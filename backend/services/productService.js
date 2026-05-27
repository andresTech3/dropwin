import productRepository from '../lib/repositories/productRepository.js';

/**
 * Product Service — Business logic layer
 */
export class ProductService {

  async getProducts(filters) {
    return await productRepository.findAll(filters);
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('Product not found');
    return product;
  }

  async getFeaturedProducts() {
    return await productRepository.findFeatured(6);
  }

  async getTopScored() {
    return await productRepository.findTopScored(10);
  }

  _sanitizeData(data) {
    const sanitized = { ...data };
    
    // Normalize competition_level to ('low', 'medium', 'high')
    if (sanitized.competition_level) {
      const level = String(sanitized.competition_level).toLowerCase().trim();
      if (level.includes('low')) {
        sanitized.competition_level = 'low';
      } else if (level.includes('high') || level.includes('very')) {
        sanitized.competition_level = 'high';
      } else {
        sanitized.competition_level = 'medium';
      }
    }
    
    // Clamp ai_score between 0 and 10
    if (sanitized.ai_score !== undefined && sanitized.ai_score !== null) {
      sanitized.ai_score = Math.max(0, Math.min(10, parseFloat(sanitized.ai_score)));
    }
    
    // Clamp trend_score between 1 and 10
    if (sanitized.trend_score !== undefined && sanitized.trend_score !== null) {
      sanitized.trend_score = Math.max(1, Math.min(10, parseInt(sanitized.trend_score)));
    }

    return sanitized;
  }

  async createProduct(data) {
    const sanitized = this._sanitizeData(data);
    // Calculate profit margin if not provided
    if (sanitized.buy_price && sanitized.sell_price && !sanitized.profit_margin) {
      sanitized.profit_margin = ((sanitized.sell_price - sanitized.buy_price) / sanitized.sell_price * 100).toFixed(2);
    }
    return await productRepository.create(sanitized);
  }

  async updateProduct(id, data) {
    const sanitized = this._sanitizeData(data);
    // Recalculate margin on price update
    if (sanitized.buy_price || sanitized.sell_price) {
      const existing = await productRepository.findById(id);
      const buyPrice = sanitized.buy_price || existing.buy_price;
      const sellPrice = sanitized.sell_price || existing.sell_price;
      if (buyPrice && sellPrice) {
        sanitized.profit_margin = ((sellPrice - buyPrice) / sellPrice * 100).toFixed(2);
      }
    }
    return await productRepository.update(id, sanitized);
  }

  async deleteProduct(id) {
    return await productRepository.delete(id);
  }

  async getDashboardStats() {
    return await productRepository.getStats();
  }

  async getCategories() {
    return await productRepository.getCategories();
  }
}

export default new ProductService();
