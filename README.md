# Makeover Monday — Metacritic Best Games of All Time

## A. Dataset & Original Visualization

**Dataset:** [Data Source - Metacritic Best Games of All Time](https://data.world/makeovermonday/2025w21-metacritic-best-games-of-all-time) (posted W21/2025)

Description: 384 games with a Metascore of 90 or above, including title, score, release date, genre, platform, publisher, developer, and description.   

**Original Visualization:** Metacritic's Best Games of All Time ranked list
https://www.metacritic.com/browse/game/

![Original Visualization](/assets/original_viz.png)

The original visualization is a scrollable (paginated) list of game cards sorted by Metascore in descending order. Each card displays a cover art of the game, rank number, title (often truncated, e.g. "The Legend of..."), release date, age rating, a short description (also truncated with an ellipsis after a few words), and a green Metascore badge. Platform information is inconsistently visible only as a console branding banner embedded directly in the cover art and is absent or illegible for many entries.

---

## B. Critique

### Weakness 1: Only rank is visually encoded

The original design encodes exactly one data attribute visually, the 
ordinal rank, expressed through the numbered prefix on each card. But the dataset contains many more facts/data (e.g., genre, platform, release year, and publisher). All of which are rendered either as uniform plain text with no visual differentiation whatsoever or not visible at all. 

By Mackinlay's definition, the visualization fails expressiveness because it does not express all the facts in the data, it primarlily shows the rank only.


### Weakness 2: Card list format prevents pattern discovery

The sequential list layout forces users to read from top to 
bottom to extract any useful information about the dataset except for the rank. Questions like:
- "which genre dominates the all-time list?" 
- "which decade produced the most critically acclaimed games?" or 
- "what are the top rated games in the list for a genre that I am interested in?"

require reading every single entry which is might even be impossible using the original card design. 

By Mackinlay's definition of effectiveness, a redesign would be more effective than the original if, for example, it uses a genre pie chart or a decade-based bar chart, that makes same information immediately and readily perceivable at a glance, without reading a single card. 

### Weakness 3: Platform is the least visible attribute despite being the most actionable

For a user visiting this page to decide what to play next, platform compatibility is the most immediately actionable attribute. If a game is not available on the platforms they own, it is might be sort of irrelevant to them. But, platform information in the original has no dedicated visual encoding. It appears only as console branding embedded in the cover art photograph, which is also absent or illegible for many entries.

This is a channel-task match failure. A user needs to quickly determine which platforms a game supports. The appropriate channel for this should be a consistent, clearly labeled categorical encoding. A color encoding for platform, consistently applied across all entries and interactive for filtering, would directly match the channel to the task, which the current visualization does not have.

### Weakness 4: No filtering or sorting beyond score-based ranking

The original visualization offers no way to filter or sort the list by any attribute other than Metascore. A user interested in finding the best RPGs, or the highest rated games on PlayStation 4, or the most acclaimed games of the 1990s, has no mechanism to do so. They are forced to scroll through all 384 entries manually, reading each card individually. This is an expressiveness failure as the filtering and sorting relationships that exist implicitly in the data are never expressed or made accessible to the user.

---

## C. Redesign Rationale

### Makeover: Metacritic Best Games of All Time
Accessible at: [SeattleU css1 server](https://css1.seattleu.edu/~rrafsan/best-games-of-all-time/index.html)

### Decision 1: Genre color encoding applied consistently across the page
(Addresses Weakness 1)

The original visualization does not show any genre information at all, which might be important from a user's perspective. The redesign assigns each of the 9 broad genres a distinct color. The color encoding is also semantically resonant for quick indentification. For example, Action & Adventure in warm red to convey energy, RPG in purple to convey depth and mysticism, Sports & Racing in green to convey movement and outdoors and so on. This is applied consistently across every visual element on the page.

This directly addresses the expressiveness failure. Genre is now a visually encoded fact, not a hidden attribute. A user can identify a game's genre at a glance without reading anything.

### Decision 2: Release year as a prominent visual element on every card
(Addresses Weakness 1)

In the original, release year is rendered as a small text string in the game card, sometimes being illegible. In the redesign, the release year is encoded as a large, prominent year tab in the top corner of every card. This gives year a dedicated visual channel, directly improving the expressiveness of the visualization for a fact that exists in the data but was previously almost visually silent.

### Decision 3: Genre pie chart and decade bar chart for dataset-level overview
(Addresses Weakness 1 and 2)

The redesign introduces two charts that make dataset-level facts immediately perceivable. A genre pie chart showing the composition of all 384 games by genre, and a horizontal bar chart grouping games by decade. By Mackinlay's definition, these make the redesign more expressive by clearly showing the facts and also more effective than the original (the same information that required reading hundreds of cards is now readily perceivable in a single glance). The chart elements (each segment of a pie, and each bar in the barchart) are also interactable). This enables the user to find the top games in that particular genre or decade immediately.

### Decision 4: Platform color system with consistent categorical encoding
(Addresses Weakness 3)

The original has no dedicated platform encoding in the UI. The redesign assigns every platform a consistent color within a family-based color 
scheme, although the individual platform is still visually distinguishable. Nintendo platforms share orange-to-yellow tones, PlayStation platforms share blue tones, Xbox platforms share green tones. This is applied as a platform filter section above the cards where each platform is represented as a colored pill, directly matching a color channel to a nominal identification task.

### Decision 5 — Platform color bar on every card with interactive filtering
(Addresses Weakness 3)

Every game card displays a platform bar, a row of small colored pills, one per platform in the dataset, lit in that platform's color if the game supports it. Combined with the clickable platform filter section, users can both see platform availability at a glance on every card and filter the entire grid by platform. This directly addresses the channel-task match failure, platform identity is now consistently and categorically encoded across all 384 games, supporting the identification and filtering task the original never had.

### Decision 6 — Dedicated filter and sort controls for genre, platform, and decade
(Addresses Weakness 4)

The redesign introduces three dedicated filter mechanisms. A genre  dropdown that filters all cards to a selected genre, a platform filter section with clickable colored pills (mentioned above) that filters cards by platform availability, and a decade filter. Together these give users direct access to the groupings. The sorting potential by score or release date orderings existed in the data but were completely inaccessible in the original. This is also addressed in the redesign as well. A user can now find the best RPGs on PlayStation 4 in seconds rather than reading through hundreds of cards.

---

## D. Citations and Credits

**Game Poster Images:** 

Game poster/cover art was fetched from the [RAWG Video Games Database API](https://api.rawg.io/docs/) ([RAWG](https://rawg.io)) using each game’s title for lookup. Images are used for illustration only. All scores and metadata come from the dataset above.

**Libraries and Fonts:**
- D3.js v7 — https://d3js.org
- Google Fonts — Pixelify Sans, Inter, Barlow Condensed — https://fonts.google.com

**AI Usage:**
All visual design decisions, layout structure, narrative framing, chart selection, color choices, and redesign rationale were made by me. Claude (Anthropic, claude.ai) was used solely as a guide for JavaScript and CSS code implementation details. During implementation Cursor IDE was used as a coding and debugging partner. All code was reviewed, and modified as appropriate before inclusion. The AI did not make any design or analytical decisions (and in case it did these by itself, they were all rejected).

## E. How to view the visualization

**On the SeattleU css1 server:**  
Open the deployed page in a browser:  
[https://css1.seattleu.edu/~rrafsan/best-games-of-all-time/index.html](https://css1.seattleu.edu/~rrafsan/best-games-of-all-time/index.html)

**Locally on your computer (if you do not have the access to SeattleU's servers):**

Local web server: In a terminal, `cd` to this project’s root folder (the one that contains `index.html`), then run a small static server, for example:
   - `python3 -m http.server 8000` (requires python3, and the 8000 port open)
   - Then visit `http://localhost:8000/` in your browser.

## Review: Original Visualization
![Original Visualization](/assets/original_viz.png)