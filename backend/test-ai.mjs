import aiService from './services/aiService.js';

async function test() {
  console.log("Running scanTrendingProducts...");
  try {
    const products = await aiService.scanTrendingProducts(1, []);
    console.log(JSON.stringify(products, null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
