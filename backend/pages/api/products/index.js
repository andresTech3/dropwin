import productService from '../../../services/productService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { 
        category, platform, minScore, competition, 
        search, orderBy, order, limit = '50', offset = '0' 
      } = req.query;

      const { data, count } = await productService.getProducts({
        category, platform, competition, search, orderBy, order,
        minScore: minScore ? parseFloat(minScore) : undefined,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return res.status(200).json({ 
        success: true, 
        data, 
        count,
        pagination: { limit: parseInt(limit), offset: parseInt(offset) }
      });
    }

    if (req.method === 'POST') {
      const product = await productService.createProduct(req.body);
      return res.status(201).json({ success: true, data: product });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('/api/products error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
