import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Star, DollarSign, Zap, 
  ExternalLink, ArrowUpRight, Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import './ProductCard.css';

const platformIcons = {
  tiktok: '🎵',
  shopify: '🛍️',
  amazon: '📦',
  mercadolibre: '🛒',
  instagram: '📸',
};

const competitionConfig = {
  low: { label: 'Baja', class: 'badge-success' },
  medium: { label: 'Media', class: 'badge-warning' },
  high: { label: 'Alta', class: 'badge-danger' },
};

function ScoreRing({ score }) {
  const getScoreClass = (s) => {
    if (s >= 8) return 'score-excellent';
    if (s >= 6) return 'score-good';
    if (s >= 4) return 'score-average';
    return 'score-poor';
  };

  return (
    <div className={`score-ring ${getScoreClass(score)}`}>
      {score ? score.toFixed(1) : '—'}
    </div>
  );
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [hovering, setHovering] = useState(false);

  const competition = competitionConfig[product.competition_level] || competitionConfig.medium;
  const margin = parseFloat(product.profit_margin) || 0;
  const isHot = product.ai_score >= 8;
  const isTrending = product.trend_growth_percent >= 100;
  const isHighMargin = margin >= 60;

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* Badges row */}
      <div className="product-badges">
        {isHot && <span className="badge badge-hot">🔥 HOT</span>}
        {isTrending && <span className="badge badge-trending">📈 TRENDING</span>}
        {isHighMargin && <span className="badge badge-premium">💎 HIGH MARGIN</span>}
        {product.is_featured && <span className="badge badge-primary">⭐ FEATURED</span>}
      </div>

      {/* Header */}
      <div className="product-header">
        <div className="product-image-container">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="product-card-img" />
          ) : (
            <div className="product-image-placeholder">
              <Package size={24} />
            </div>
          )}
        </div>
        <ScoreRing score={product.ai_score} />
      </div>

      {/* Info */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-category text-subtle text-xs">{product.category}</p>
        {product.problem_solved && (
          <p className="product-problem text-sm text-muted">
            💡 {product.problem_solved}
          </p>
        )}
      </div>

      {/* Metrics */}
      <div className="product-metrics">
        <div className="metric">
          <DollarSign size={12} />
          <div>
            <span className="metric-value">${product.sell_price}</span>
            <span className="metric-label">Precio venta</span>
          </div>
        </div>
        <div className="metric">
          <TrendingUp size={12} />
          <div>
            <span className="metric-value" style={{ color: 'var(--color-success)' }}>
              {margin.toFixed(1)}%
            </span>
            <span className="metric-label">Margen</span>
          </div>
        </div>
        <div className="metric">
          <Zap size={12} />
          <div>
            <span className="metric-value" style={{ color: 'var(--color-trending)' }}>
              +{product.trend_growth_percent || 0}%
            </span>
            <span className="metric-label">Tendencia</span>
          </div>
        </div>
      </div>

      {/* Buy price & margin bar */}
      <div className="product-pricing">
        <div className="pricing-row">
          <span className="text-xs text-subtle">Compra: ${product.buy_price}</span>
          <span className="text-xs text-subtle">Venta: ${product.sell_price}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${Math.min(margin, 100)}%`,
              background: margin >= 60 
                ? 'linear-gradient(90deg, var(--color-success), var(--color-trending))'
                : margin >= 40
                ? 'linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))'
                : 'var(--color-warning)'
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="product-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="product-platforms">
            {(product.platforms || []).slice(0, 4).map(p => (
              <span key={p} title={p} className="platform-icon">{platformIcons[p] || '🌐'}</span>
            ))}
          </div>
          <span className={`badge ${competition.class}`}>{competition.label} comp.</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {product.supplier_link && (
            <a 
              href={product.supplier_link} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-ghost btn-sm" 
              style={{ flex: 1, padding: '4px', fontSize: '10px' }}
              onClick={e => e.stopPropagation()}
            >
              🛒 Proveedor
            </a>
          )}
          {product.video_reference_link && (
            <a 
              href={product.video_reference_link} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-ghost btn-sm" 
              style={{ flex: 1, padding: '4px', fontSize: '10px' }}
              onClick={e => e.stopPropagation()}
            >
              📱 Viral
            </a>
          )}
        </div>
      </div>

      {/* Hover overlay */}
      <div className={`card-hover-overlay ${hovering ? 'visible' : ''}`}>
        <span className="text-sm">Ver detalles →</span>
      </div>
    </motion.div>
  );
}
