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

function cleanBook(book) {
  return {
    title: book.title.trim(),
    price: parseFloat(book.price.replace('£', '')),
    inStock: book.availability.includes('In stock'),
  };
}

async function main() {
  const rawBooks = await scrapeAllPages();
  const cleanBooks = rawBooks.map(cleanBook);
  console.log(cleanBooks.slice(0, 3)); // preview first 3
}

main();