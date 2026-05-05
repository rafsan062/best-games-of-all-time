#!/usr/bin/env python3
"""
Build data/game-posters.json using the RAWG Video Games Database API.

1. Create a free API key: https://rawg.io/apidocs
2. Put it in a .env file next to this script's project root, or export it:
     export RAWG_API_KEY=your_key_here
3. Run from the project root (best-games-of-all-time):
     python3 scripts/build-posters-rawg.py

Existing poster URLs in data/game-posters.json are kept when RAWG returns
no usable image for that Metacritic slug.

Requires: Python 3.9+ (stdlib only).

Optional: python3 scripts/build-posters-rawg.py --limit 10

SSL on macOS: install CA bundle with  pip3 install certifi  (recommended), or set
  RAWG_INSECURE_SSL=1  in .env only for local runs (disables certificate verification).
"""
from __future__ import annotations

import argparse
import csv
import difflib
import json
import os
import re
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "metacritic_top_games.csv"
OUT_PATH = ROOT / "data" / "game-posters.json"
ENV_PATH = ROOT / ".env"

SLUG_RE = re.compile(r"metacritic\.com/game/([^/]+)/?", re.I)
YEAR_SUFFIX_RE = re.compile(r"^(.+?)\s*\(\d{4}\)\s*$")


def build_ssl_context() -> ssl.SSLContext:
    """RAWG is HTTPS; many macOS Python builds lack a working default CA store."""
    flag = (os.environ.get("RAWG_INSECURE_SSL") or "").strip().lower()
    if flag in ("1", "true", "yes", "on"):
        return ssl._create_unverified_context()
    try:
        import certifi

        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context()


def load_dotenv() -> None:
    if not ENV_PATH.is_file():
        return
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        k, v = k.strip(), v.strip().strip('"').strip("'")
        if k and k not in os.environ:
            os.environ[k] = v


def metacritic_slug(link: str) -> str | None:
    m = SLUG_RE.search(link or "")
    return m.group(1).lower() if m else None


def title_search_variants(title: str) -> list[str]:
    t = (title or "").strip()
    out = [t]
    m = YEAR_SUFFIX_RE.match(t)
    if m and m.group(1).strip() not in out:
        out.append(m.group(1).strip())
    return out


def normalize_name(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return " ".join(s.split())


def pick_best_result(metacritic_title: str, results: list[dict]) -> dict | None:
    if not results:
        return None
    target = normalize_name(metacritic_title)
    best, best_r = results[0], 0.0
    for r in results:
        name = r.get("name") or ""
        ratio = difflib.SequenceMatcher(None, target, normalize_name(name)).ratio()
        if ratio > best_r:
            best, best_r = r, ratio
    if best_r >= 0.45:
        return best
    return results[0]


def rawg_search(api_key: str, query: str) -> list[dict]:
    q = urllib.parse.urlencode(
        {
            "search": query,
            "page_size": "8",
            "key": api_key,
        }
    )
    url = f"https://api.rawg.io/api/games?{q}"
    ctx = build_ssl_context()
    req = urllib.request.Request(url, headers={"User-Agent": "VA5-poster-builder/1.0"})
    with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    if isinstance(data, dict) and data.get("error"):
        raise RuntimeError(data["error"])
    return list(data.get("results") or [])


def image_from_game(g: dict) -> str | None:
    img = g.get("background_image")
    if isinstance(img, str) and img.startswith("http"):
        return img
    shots = g.get("short_screenshots") or []
    for s in shots:
        u = s.get("image") if isinstance(s, dict) else None
        if isinstance(u, str) and u.startswith("http"):
            return u
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Build game-posters.json via RAWG API")
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        metavar="N",
        help="Only process the first N unique slugs (for testing)",
    )
    args = parser.parse_args()

    load_dotenv()
    api_key = (os.environ.get("RAWG_API_KEY") or "").strip()
    if not api_key:
        print(
            "Missing RAWG_API_KEY.\n"
            "  1) Get a key: https://rawg.io/apidocs\n"
            "  2) export RAWG_API_KEY=...  or add RAWG_API_KEY=... to .env in the project root",
            file=sys.stderr,
        )
        return 1

    if not CSV_PATH.is_file():
        print(f"CSV not found: {CSV_PATH}", file=sys.stderr)
        return 1

    existing: dict[str, str] = {}
    if OUT_PATH.is_file():
        try:
            raw = json.loads(OUT_PATH.read_text(encoding="utf-8"))
            if isinstance(raw, dict):
                existing = {k: v for k, v in raw.items() if isinstance(v, str) and v.startswith("http")}
        except json.JSONDecodeError:
            pass

    rows: list[tuple[str, str]] = []
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            link = row.get("Link") or ""
            title = row.get("Title") or ""
            slug = metacritic_slug(link)
            if slug and title:
                rows.append((slug, title))

    # One poster per slug (first CSV row wins if duplicates)
    seen: set[str] = set()
    unique: list[tuple[str, str]] = []
    for slug, title in rows:
        if slug in seen:
            continue
        seen.add(slug)
        unique.append((slug, title))

    if args.limit and args.limit > 0:
        unique = unique[: args.limit]
        print(f"--limit {args.limit}: processing {len(unique)} slugs only\n", flush=True)

    out: dict[str, str] = dict(existing)
    failed: list[str] = []

    print(f"Fetching up to {len(unique)} games from RAWG (rate-limited)…", flush=True)

    for i, (slug, title) in enumerate(unique):
        if (i + 1) % 25 == 0 or i == 0:
            print(f"  … {i + 1}/{len(unique)}", flush=True)

        chosen: dict | None = None
        request_failed = False
        for variant in title_search_variants(title):
            try:
                results = rawg_search(api_key, variant)
            except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, json.JSONDecodeError, RuntimeError) as e:
                print(f"\nRAWG error for {slug!r} ({title!r}): {e}", file=sys.stderr)
                request_failed = True
                break
            if results:
                chosen = pick_best_result(title, results)
                break
            time.sleep(0.12)

        if request_failed:
            failed.append(slug)
            time.sleep(0.35)
            continue

        if not chosen:
            failed.append(slug)
            time.sleep(0.12)
            continue

        img = image_from_game(chosen)
        if img:
            out[slug] = img
        elif slug not in out:
            failed.append(slug)

        time.sleep(0.22)

    OUT_PATH.write_text(
        json.dumps(dict(sorted(out.items())), indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    print(f"\nWrote {len(out)} poster URLs to {OUT_PATH}")
    if failed:
        print(f"No new image for {len(failed)} slugs (RAWG miss or error); kept prior URL if any.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
