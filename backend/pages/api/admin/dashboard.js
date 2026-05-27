import productService from '../../../services/productService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const [stats, featured, topScored] = await Promise.all([
      productService.getDashboardStats(),
      productService.getFeaturedProducts(),
      productService.getTopScored(),
    ]);

    return res.status(200).json({ 
      success: true, 
      data: { stats, featured, topScored }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
