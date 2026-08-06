const axios = require('axios');
const cheerio = require('cheerio');
const pThrottle = require('p-throttle');

const USER_AGENT = 'MairaLearningBot/1.0 (educational scraping practice)';

async function fetchPage(url) {
  const response = await axios.get(url, {
    headers: { 'User-Agent': USER_AGENT },
  });
  return response.data;
}

// max 1 request/sec — the "polite" part
const throttle = pThrottle({ limit: 1, interval: 1000 });
const throttledFetch = throttle(fetchPage);

async function scrapeAllPages() {
  const allBooks = [];
  for (let page = 1; page <= 5; page++) {
    const url = `https://books.toscrape.com/catalogue/page-${page}.html`;
    const html = await throttledFetch(url);
    const $ = cheerio.load(html);

    $('.product_pod').each((i, el) => {
      allBooks.push({
        title: $(el).find('h3 a').attr('title'),
        price: $(el).find('.price_color').text(),
        availability: $(el).find('.availability').text().trim(),
      });
    });
    console.log(`Page ${page} done`);
  }
  return allBooks;
}

async function main() {
  const books = await scrapeAllPages();
  console.log(`Scraped ${books.length} books total`);
}

main();