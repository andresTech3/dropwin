import aiService from '../../../services/aiService.js';
import productService from '../../../services/productService.js';
import productRepository from '../../../lib/repositories/productRepository.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { count = 10 } = req.body;

    // Log scan start
    const { data: scan } = await (await import('../../../lib/supabase.js')).supabaseAdmin
      .from('ai_scans')
      .insert([{ status: 'running', started_at: new Date().toISOString() }])
      .select().single();

    // Get existing product names to avoid duplicates
    let existingNames = [];
    try {
      const existing = await productRepository.findAll({ limit: 200 });
      if (existing && existing.data) {
        existingNames = existing.data.map(p => p.name);
      }
    } catch (e) {
      console.error('Error fetching existing products for scan:', e);
    }

    // Generate products with AI
    const products = await aiService.scanTrendingProducts(parseInt(count), existingNames);
    
    // Score each product and save
    const savedProducts = [];
    for (const product of products) {
      try {
        const scoreData = await aiService.scoreProduct(product);
        const enrichedProduct = {
          ...product,
          ai_score: scoreData.score,
          ai_description: null, // Generated on demand
          ai_competition_analysis: JSON.stringify(scoreData),
        };
        const saved = await productService.createProduct(enrichedProduct);
        savedProducts.push(saved);
      } catch (err) {
        console.error('Error saving product:', err.message);
      }
    }

    // Update scan record
    const { supabaseAdmin } = await import('../../../lib/supabase.js');
    await supabaseAdmin
      .from('ai_scans')
      .update({ 
        status: 'completed', 
        products_found: savedProducts.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', scan.id);

    return res.status(200).json({ 
      success: true, 
      productsCreated: savedProducts.length,
      data: savedProducts 
    });
  } catch (error) {
    console.error('/api/products/scan error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
