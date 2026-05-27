import { supabaseAdmin } from '../supabase.js';

/**
 * Product Repository — Data access layer following Repository Pattern
 * All DB operations are encapsulated here
 */
export class ProductRepository {
  
  async findAll({ 
    category, 
    platform, 
    minScore, 
    competition, 
    search, 
    orderBy = 'ai_score', 
    order = 'desc',
    limit = 50,
    offset = 0
  } = {}) {
    let query = supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (category) query = query.eq('category', category);
    if (platform) query = query.contains('platforms', [platform]);
    if (competition) query = query.eq('competition_level', competition);
    if (minScore) query = query.gte('ai_score', minScore);
    if (search) query = query.ilike('name', `%${search}%`);

    query = query
      .order(orderBy, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  }

  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async findFeatured(limit = 5) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('ai_score', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  }

  async findTopScored(limit = 10) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('ai_score', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  }

  async create(product) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([product])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  async getStats() {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('ai_score, profit_margin, category, competition_level')
      .eq('is_active', true);
    
    if (error) throw error;

    const total = data.length;
    const avgScore = data.reduce((a, b) => a + (b.ai_score || 0), 0) / total;
    const avgMargin = data.reduce((a, b) => a + (b.profit_margin || 0), 0) / total;
    
    // Category distribution
    const categoryCount = data.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});

    // Competition distribution
    const competitionCount = data.reduce((acc, p) => {
      acc[p.competition_level] = (acc[p.competition_level] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      avgScore: Math.round(avgScore * 10) / 10,
      avgMargin: Math.round(avgMargin * 10) / 10,
      byCategory: categoryCount,
      byCompetition: competitionCount,
    };
  }

  async getCategories() {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('category')
      .eq('is_active', true);
    if (error) throw error;
    const categories = [...new Set(data.map(p => p.category).filter(Boolean))];
    return categories.sort();
  }
}

export default new ProductRepository();
