import productService from '../../../services/productService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const product = await productService.getProductById(id);
      return res.status(200).json({ success: true, data: product });
    }

    if (req.method === 'PATCH') {
      const product = await productService.updateProduct(id, req.body);
      return res.status(200).json({ success: true, data: product });
    }

    if (req.method === 'DELETE') {
      await productService.deleteProduct(id);
      return res.status(200).json({ success: true, message: 'Product deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(`/api/products/${id} error:`, error);
    return res.status(error.message === 'Product not found' ? 404 : 500)
      .json({ success: false, error: error.message });
  }
}
