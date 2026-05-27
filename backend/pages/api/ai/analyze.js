import aiService from '../../../services/aiService.js';
import productService from '../../../services/productService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { productId } = req.body;
    const product = await productService.getProductById(productId);
    const analysis = await aiService.analyzeCompetition(product);
    return res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
