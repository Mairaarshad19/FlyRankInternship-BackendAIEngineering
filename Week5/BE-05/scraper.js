const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENT = 'MairaLearningBot/1.0 (educational scraping practice)';

async function fetchPage(url) {
  const response = await axios.get(url, {
    headers: { 'User-Agent': USER_AGENT },
  });
  return response.data;
}

async function main() {
  const html = await fetchPage('https://books.toscrape.com/');
  const $ = cheerio.load(html);

  $('.product_pod').each((i, el) => {
    const title = $(el).find('h3 a').attr('title');
    const price = $(el).find('.price_color').text();
    console.log(title, price);
  });
}

main();