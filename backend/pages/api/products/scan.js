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
    
    // Save generated products directly using the inline AI score
    const savedProducts = [];
    for (const product of products) {
      try {
        const enrichedProduct = {
          ...product,
          ai_score: product.ai_score || 7.5,
          ai_description: null, // Generated on demand
          ai_competition_analysis: JSON.stringify({
            score: product.ai_score || 7.5,
            breakdown: product.ai_score_breakdown || { profitMargin: 7.5, marketDemand: 7.5, competition: 7.5, problemFit: 7.5, logistics: 7.5 },
            reasoning: product.ai_score_reasoning || product.description || '',
            recommendation: product.ai_score_recommendation || 'Probar diferentes anuncios de video.',
            risk: product.ai_score_risk || 'medium'
          }),
        };
        
        // Remove temporary helper attributes before saving to database
        delete enrichedProduct.ai_score_breakdown;
        delete enrichedProduct.ai_score_reasoning;
        delete enrichedProduct.ai_score_recommendation;
        delete enrichedProduct.ai_score_risk;

        const saved = await productService.createProduct(enrichedProduct);
        savedProducts.push(saved);
      } catch (err) {
        console.error('Error saving product during scan:', err.message);
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
