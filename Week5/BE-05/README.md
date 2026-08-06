# BE-05: The Polite Scraper

## Goal
Scrape book listings from books.toscrape.com, clean the extracted fields, and save them as structured JSON - while following good scraping etiquette (robots.txt check, rate limiting, identification).

## Tech stack
- Node.js
- axios - fetching pages
- cheerio - parsing HTML
- p-throttle - rate limiting

## robots.txt
Checked `https://books.toscrape.com/robots.txt` - it returns a 404, meaning the site has no robots.txt and specifies no crawling restrictions. Proceeded with scraping.

## Politeness measures
- Custom User-Agent set on every request: `MairaLearningBot/1.0 (educational scraping practice)`
- Requests throttled to 1 per second using p-throttle
- Only public catalogue pages were scraped, no login or restricted sections touched

## What was scraped
- Source: `books.toscrape.com/catalogue/page-1.html` through `page-5.html`
- Fields extracted: title, price, availability
- 100 books scraped and cleaned

## Cleaning steps
- Trimmed whitespace from titles
- Converted price from string (e.g. `£51.77`) to a float
- Converted availability text into a boolean `inStock` field

## Output
Structured records saved to `books.json`.

## Run it
```bash
npm install
node scraper.js
```