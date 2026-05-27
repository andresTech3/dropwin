import aiService from '../../../services/aiService.js';
import productRepository from '../../../lib/repositories/productRepository.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { count = 4 } = req.query;

    // Get existing product names to avoid duplicates
    let existingNames = [];
    try {
      const existing = await productRepository.findAll({ limit: 200 });
      if (existing && existing.data) {
        existingNames = existing.data.map(p => p.name);
      }
    } catch (e) {
      console.error('Error fetching existing products for trends:', e);
    }

    // Generate products directly (without saving them yet)
    const products = await aiService.scanTrendingProducts(parseInt(count), existingNames);

    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('/api/products/trends error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
