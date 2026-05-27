import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Plus, Check, DollarSign, TrendingUp, Zap, HelpCircle, Package, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productsApi } from '../services/api';
import toast from 'react-hot-toast';
import './Trends.css';

const platformIcons = {
  tiktok: '🎵',
  shopify: '🛍️',
  amazon: '📦',
  mercadolibre: '🛒',
  instagram: '📸',
};

export default function Trends() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importedIds, setImportedIds] = useState(new Set());

  const fetchTrends = async () => {
    setLoading(true);
    try {
      // Fetch 4 fresh trending products
      const res = await productsApi.getTrends(4);
      if (res.success && res.data) {
        setTrends(res.data);
        // Reset imported state for new trends
        setImportedIds(new Set());
        toast.success('¡Nuevas tendencias cargadas!');
      } else {
        toast.error('No se recibieron tendencias');
      }
    } catch (e) {
      toast.error('Error cargando tendencias: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const handleImport = async (product, index) => {
    const toastId = toast.loading('Importando producto al catálogo...');
    try {
      // Build the enriched product object using the inline AI score metrics
      const enrichedProduct = {
        name: product.name,
        category: product.category,
        description: product.description,
        problem_solved: product.problem_solved,
        buy_price: product.buy_price,
        sell_price: product.sell_price,
        profit_margin: product.profit_margin,
        competition_level: product.competition_level,
        trend_growth_percent: product.trend_growth_percent,
        platforms: product.platforms,
        supplier_name: product.supplier_name,
        supplier_link: product.supplier_link,
        video_reference_link: product.video_reference_link,
        image_url: product.image_url,
        is_featured: product.is_featured || false,
        ai_score: product.ai_score || 7.5,
        ai_competition_analysis: JSON.stringify({
          score: product.ai_score || 7.5,
          breakdown: product.ai_score_breakdown || { profitMargin: 7.5, marketDemand: 7.5, competition: 7.5, problemFit: 7.5, logistics: 7.5 },
          reasoning: product.ai_score_reasoning || product.description,
          recommendation: product.ai_score_recommendation || 'Probar diferentes anuncios de video.',
          risk: product.ai_score_risk || 'medium'
        })
      };

      const res = await productsApi.create(enrichedProduct);
      if (res.success || res.data) {
        setImportedIds(prev => {
          const next = new Set(prev);
          next.add(index);
          return next;
        });
        toast.success(`🎉 ¡${product.name} importado al catálogo!`, { id: toastId });
      } else {
        toast.error('No se pudo guardar el producto', { id: toastId });
      }
    } catch (e) {
      toast.error('Error al guardar: ' + e.message, { id: toastId });
    }
  };

  return (
    <div className="page-content animate-in">
      {/* Header */}
      <div className="trends-header mb-6">
        <div>
          <h1 className="text-title">Cazador de Tendencias IA</h1>
          <p className="text-subtle text-sm mt-1">
            Descubre gadgets y productos ganadores en tiempo real. Analízalos antes de guardarlos en tu catálogo.
          </p>
        </div>
        <button className="btn btn-primary" onClick={fetchTrends} disabled={loading}>
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? 'Buscando...' : 'Buscar Nuevas Tendencias'}
        </button>
      </div>

      {/* Grid of live trends */}
      {loading ? (
        <div className="trends-loader">
          <div className="spinner mb-3" style={{ width: 40, height: 40 }} />
          <p className="text-subtle text-sm">Escaneando nichos de mercado con Inteligencia Artificial...</p>
        </div>
      ) : trends.length === 0 ? (
        <div className="empty-state">
          <HelpCircle size={40} style={{ color: 'var(--color-ink-subtle)' }} />
          <p className="text-card-title">Sin Tendencias</p>
          <p className="text-subtle">Da clic en el botón de arriba para buscar nuevos productos trending.</p>
        </div>
      ) : (
        <div className="trends-grid">
          <AnimatePresence>
            {trends.map((product, idx) => {
              const isImported = importedIds.has(idx);
              const margin = parseFloat(product.profit_margin) || 0;
              const score = product.ai_score || 7.5;

              return (
                <motion.div
                  key={product.name + idx}
                  className="trend-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  {/* Category & Badge */}
                  <div className="trend-card-header mb-3">
                    <span className="badge badge-neutral">{product.category}</span>
                    <span className={`badge ${
                      product.ai_score_risk === 'low' ? 'badge-success' : 
                      product.ai_score_risk === 'medium' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      Riesgo: {product.ai_score_risk === 'low' ? 'Bajo' : product.ai_score_risk === 'medium' ? 'Medio' : 'Alto'}
                    </span>
                  </div>

                  {/* Title & Emojis */}
                  <h3 className="trend-card-title mb-2">{product.name}</h3>
                  <p className="trend-card-desc text-muted text-sm mb-4">{product.description}</p>

                  <div className="trend-card-insight mb-4">
                    <strong>💡 Problema:</strong> {product.problem_solved}
                  </div>

                  {/* Metrics grid */}
                  <div className="trend-metrics-row mb-4">
                    <div className="trend-metric">
                      <span className="metric-lbl">Compra</span>
                      <span className="metric-val text-subtle">${product.buy_price}</span>
                    </div>
                    <div className="trend-metric">
                      <span className="metric-lbl">Venta</span>
                      <span className="metric-val text-ink">${product.sell_price}</span>
                    </div>
                    <div className="trend-metric">
                      <span className="metric-lbl">Margen</span>
                      <span className="metric-val text-success">{margin.toFixed(1)}%</span>
                    </div>
                    <div className="trend-metric">
                      <span className="metric-lbl">Tendencia</span>
                      <span className="metric-val text-trending">+{product.trend_growth_percent}%</span>
                    </div>
                  </div>

                  {/* IA Score Section */}
                  <div className="trend-card-score-box mb-4">
                    <div className="score-summary mb-3">
                      <div className={`score-ring score-ring-sm ${
                        score >= 8 ? 'score-excellent' : score >= 6 ? 'score-good' : 'score-average'
                      }`}>
                        {score.toFixed(1)}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-ink">Score de Rentabilidad IA</span>
                        <span className="block text-xs text-subtle mt-0.5">{product.ai_score_reasoning}</span>
                      </div>
                    </div>

                    {product.ai_score_breakdown && (
                      <div className="score-bars">
                        {Object.entries(product.ai_score_breakdown).map(([key, val]) => (
                          <div key={key} className="score-bar-row">
                            <span className="bar-label">{key}</span>
                            <div className="bar-wrapper">
                              <div 
                                className="bar-fill" 
                                style={{ 
                                  width: `${(val / 10) * 100}%`,
                                  background: val >= 8 ? 'var(--color-success)' : val >= 6 ? 'var(--color-primary)' : 'var(--color-warning)'
                                }} 
                              />
                            </div>
                            <span className="bar-val">{val}/10</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Platforms & Action */}
                  <div className="trend-card-footer mt-auto">
                    <div className="trend-platforms">
                      {product.platforms?.map(p => (
                        <span key={p} title={p} className="platform-icon">
                          {platformIcons[p] || '🌐'}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {product.supplier_link && (
                        <a href={product.supplier_link} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '11px', flex: 1 }}>
                          🛒 Proveedor
                        </a>
                      )}
                      {product.video_reference_link && (
                        <a href={product.video_reference_link} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '11px', flex: 1 }}>
                          📱 Ver Viral
                        </a>
                      )}
                    </div>
                    <button
                      className={`btn btn-sm ${isImported ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleImport(product, idx)}
                      disabled={isImported}
                    >
                      {isImported ? <Check size={14} /> : <Plus size={14} />}
                      {isImported ? '¡Importado!' : 'Importar al Catálogo'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
