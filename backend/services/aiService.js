import { generateJSON, generateContent } from '../lib/gemini.js';

/**
 * AI Service — Service Layer for all AI operations
 */
export class AIService {

  /**
   * Calculate profitability score (1-10) for a product using Gemini
   */
  async scoreProduct(product) {
    const prompt = `You are a dropshipping expert analyst. Analyze this product and give it a profitability score.

PRODUCT DATA:
- Name: ${product.name}
- Category: ${product.category}
- Buy Price: $${product.buy_price}
- Sell Price: $${product.sell_price}
- Profit Margin: ${product.profit_margin}%
- Problem Solved: ${product.problem_solved || 'Unknown'}
- Competition Level: ${product.competition_level || 'Unknown'}
- Trend Growth: ${product.trend_growth_percent || 0}%
- Target Platforms: ${(product.platforms || []).join(', ')}

Score this product on a scale from 1.0 to 10.0 based on:
1. Profit margin potential (weight: 30%)
2. Market demand & trend (weight: 25%)
3. Competition saturation (weight: 20%)
4. Problem-solution fit (weight: 15%)
5. Shipping & logistics ease (weight: 10%)

Return a JSON object with EXACTLY this structure:
{
  "score": 8.5,
  "breakdown": {
    "profitMargin": 9.0,
    "marketDemand": 8.0,
    "competition": 7.5,
    "problemFit": 9.0,
    "logistics": 8.0
  },
  "reasoning": "Brief 2-3 sentence explanation of the score",
  "recommendation": "One actionable tip to maximize sales",
  "risk": "low|medium|high"
}

IMPORTANT: Do not use unescaped double quotes (") inside any string properties. If you need to use quotes inside a string, use single quotes (') instead.`;

    return await generateJSON(prompt);
  }

  /**
   * Generate product description ready to use in Shopify/TikTok/Amazon
   */
  async generateDescription(product, platform = 'shopify') {
    const platformInstructions = {
      shopify: 'SEO-optimized product description for a Shopify store. Include features, benefits, and a CTA.',
      tiktok: 'Viral TikTok video script (30-60 seconds). Hook, problem, solution, CTA. Use emojis.',
      amazon: 'Amazon listing with bullet points, features, and keywords.',
      mercadolibre: 'Descripción optimizada para Mercado Libre en español. Características y beneficios.',
    };

    const instruction = platformInstructions[platform] || platformInstructions.shopify;

    const prompt = `You are an expert copywriter for dropshipping. Create a ${instruction}

PRODUCT: ${product.name}
PROBLEM IT SOLVES: ${product.problem_solved || 'Makes life easier'}
BUY PRICE: $${product.buy_price} | SELL PRICE: $${product.sell_price}
CATEGORY: ${product.category}

Write a compelling ${platform} description/script. Be specific, persuasive, and highlight the value proposition. Max 300 words.`;

    return await generateContent(prompt);
  }

  /**
   * Analyze competition for a product
   */
  async analyzeCompetition(product) {
    const prompt = `You are a dropshipping market analyst. Analyze the competition for this product.

PRODUCT: ${product.name}
CATEGORY: ${product.category}
CURRENT COMPETITION: ${product.competition_level}
TREND GROWTH: ${product.trend_growth_percent || 0}%

Provide a detailed competition analysis. Return JSON with EXACTLY this structure:
{
  "saturationLevel": "low|medium|high|very-high",
  "marketSize": "Small|Medium|Large|Massive",
  "differentiators": ["tip1", "tip2", "tip3"],
  "pricingStrategy": {
    "recommended": 29.99,
    "minimum": 19.99,
    "premium": 49.99,
    "reasoning": "Brief explanation"
  },
  "topCompetitors": ["Platform1", "Platform2"],
  "opportunityWindow": "3-6 months|6-12 months|12+ months|Evergreen",
  "keyInsight": "Most important thing to know about this market"
}

IMPORTANT: Do not use unescaped double quotes (") inside any string properties. If you need to use quotes inside a string, use single quotes (') instead.`;

    return await generateJSON(prompt);
  }

  /**
   * Chat with AI dropshipping assistant
   */
  async chat(messages, userMessage) {
    const systemPrompt = `You are DropWin AI, an expert dropshipping consultant and business strategist. 
You help entrepreneurs find profitable products, optimize their stores, and scale their dropshipping businesses.
You have deep knowledge of:
- Product research and trend analysis
- TikTok, Shopify, Amazon, and Mercado Libre selling strategies
- Pricing psychology and profit optimization
- Supplier relations (AliExpress, CJ Dropshipping, Alibaba)
- Marketing strategies for each platform
- Logistics and shipping optimization

Be concise, practical, and action-oriented. Use bullet points when listing multiple tips.
Always respond in the same language as the user.`;

    const conversationHistory = messages
      .slice(-10) // Keep last 10 messages for context
      .map(m => `${m.role === 'user' ? 'User' : 'DropWin AI'}: ${m.content}`)
      .join('\n');

    const prompt = `${systemPrompt}

Conversation history:
${conversationHistory}

User: ${userMessage}

DropWin AI:`;

    return await generateContent(prompt);
  }

  /**
   * Auto-generate new trending products using Gemini
   */
  async scanTrendingProducts(count = 10, existingNames = []) {
    // List of diverse micro-niches to pick randomly on each scan
    const microNiches = [
      "Smart home kitchen gadgets & time-savers",
      "Pet health, training & tracking tech",
      "Ergonomic desk setup & remote work accessories",
      "Eco-friendly bathroom & cleaning utilities",
      "Compact portable fitness & recovery equipment",
      "Content creator tools & portable ambient lighting",
      "Smart travel essentials & anti-theft gear",
      "Self-care, stress-relief & sleep optimization gadgets",
      "Car organizer, comfort & safety accessories",
      "Outdoor adventure & camping multi-tools",
      "Smart indoor gardening & plant parenting tech",
      "Portable home theater & audio accessories",
      "Baby safety, sensory learning & parent hacks",
      "Clean beauty devices & high-tech skincare",
      "Anti-fatigue, posture correction & wellness gear"
    ];

    // Pick 3 random niches to keep the AI generation dynamic and fresh
    const selectedNiches = [];
    const tempNiches = [...microNiches];
    for (let i = 0; i < 3; i++) {
      if (tempNiches.length > 0) {
        const randIdx = Math.floor(Math.random() * tempNiches.length);
        selectedNiches.push(tempNiches.splice(randIdx, 1)[0]);
      }
    }

    const avoidText = existingNames.length > 0
      ? `IMPORTANT: The following products already exist in our database. DO NOT return any of these products (neither exact nor very similar variants):
${existingNames.slice(0, 100).map(name => `- "${name}"`).join('\n')}`
      : '';

    const prompt = `You are a dropshipping product researcher. Find ${count} trending products perfect for dropshipping RIGHT NOW in 2024-2025.
Focus on finding new, highly interesting, unique, and non-obvious products.

For this specific scan, please focus your research on these micro-niches for inspiration:
${selectedNiches.map(n => `- ${n}`).join('\n')}

${avoidText}

Each product MUST:
- Solve a real, annoying problem
- Have high profit margin potential (40%+ ideally)
- Be compact, durable, and easy to ship
- Not be easily found in local supermarkets or dominated by a single giant brand

Return a JSON array with EXACTLY this structure for each product:
[
  {
    "name": "Portable LED Light Ring for Remote Work",
    "category": "Tech & Office",
    "description": "Clip-on ring light for laptop screens, perfect for video calls and content creation",
    "problem_solved": "Poor lighting during video calls makes professionals look unprofessional",
    "buy_price": 8.50,
    "sell_price": 34.99,
    "profit_margin": 75.7,
    "competition_level": "medium",
    "trend_growth_percent": 145,
    "platforms": ["tiktok", "shopify", "amazon"],
    "supplier_name": "AliExpress",
    "is_featured": false
  }
]

IMPORTANT: Do not use unescaped double quotes (") inside any string properties. If you need to use quotes inside a string, use single quotes (') instead.
Generate exactly ${count} unique, specific products with real market data estimates.`;

    const products = await generateJSON(prompt);
    return Array.isArray(products) ? products : [];
  }
}

export default new AIService();
