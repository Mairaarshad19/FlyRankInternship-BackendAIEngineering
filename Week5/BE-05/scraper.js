const axios = require('axios');
const cheerio = require('cheerio');
const pThrottle = require('p-throttle');
const fs = require('fs');

const BASE_URL = 'https://books.toscrape.com';
const USER_AGENT = 'MairaLearningBot/1.0 (educational scraping practice)';
const PAGES_TO_SCRAPE = 5;

// max 1 request/sec — the "polite" part
const throttle = pThrottle({ limit: 1, interval: 1000 });

async function fetchPage(url) {
  const response = await axios.get(url, {
    headers: { 'User-Agent': USER_AGENT },
  });
  return response.data;
}

const throttledFetch = throttle(fetchPage);

async function checkRobots() {
  console.log('--- robots.txt ---');
  try {
    const robots = await fetchPage(`${BASE_URL}/robots.txt`);
    console.log(robots);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      console.log('No robots.txt found — no restrictions specified, proceeding.');
    } else {
      throw err;
    }
  }
  console.log('------------------');
}

function parseBooksFromHtml(html) {
  const $ = cheerio.load(html);
  const books = [];
  $('.product_pod').each((i, el) => {
    books.push({
      title: $(el).find('h3 a').attr('title'),
      price: $(el).find('.price_color').text(),
      availability: $(el).find('.availability').text(),
    });
  });
  return books;
}

function cleanBook(book) {
  return {
    title: book.title.trim(),
    price: parseFloat(book.price.replace('£', '').trim()),
    inStock: book.availability.includes('In stock'),
  };
}

async function scrapeAllPages() {
  let allBooks = [];
  for (let page = 1; page <= PAGES_TO_SCRAPE; page++) {
    const url = `${BASE_URL}/catalogue/page-${page}.html`;
    try {
      const html = await throttledFetch(url);
      const books = parseBooksFromHtml(html);
      allBooks = allBooks.concat(books);
      console.log(`Page ${page}: ${books.length} books scraped`);
    } catch (err) {
      console.error(`Page ${page} failed: ${err.message}`);
    }
  }
  return allBooks;
}

async function main() {
  await checkRobots();

  const rawBooks = await scrapeAllPages();
  const cleanBooks = rawBooks.map(cleanBook);

  fs.writeFileSync('books.json', JSON.stringify(cleanBooks, null, 2));
  console.log(`\nSaved ${cleanBooks.length} books to books.json`);
}

main().catch((err) => {
  console.error('Scraper failed:', err.message);
  process.exit(1);
});