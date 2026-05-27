import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, DollarSign, TrendingUp, Zap, 
  Copy, Check, ExternalLink, RefreshCw, Sparkles,
  BarChart3, Package, Globe, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { productsApi, aiApi } from '../services/api';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const PLATFORMS = {
  shopify: { label: 'Shopify', icon: '🛍️' },
  tiktok: { label: 'TikTok', icon: '🎵' },
  amazon: { label: 'Amazon', icon: '📦' },
  mercadolibre: { label: 'Mercado Libre', icon: '🛒' },
  instagram: { label: 'Instagram', icon: '📸' },
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('¡Copiado al portapapeles!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="btn btn-secondary btn-sm" onClick={copy}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiScore, setAiScore] = useState(null);
  const [description, setDescription] = useState('');
  const [competition, setCompetition] = useState(null);
  const [descPlatform, setDescPlatform] = useState('shopify');
  const [loadingScore, setLoadingScore] = useState(false);
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [loadingComp, setLoadingComp] = useState(false);

  useEffect(() => {
    productsApi.getById(id)
      .then(res => {
        setProduct(res.data);
        if (res.data.ai_competition_analysis) {
          try { setAiScore(JSON.parse(res.data.ai_competition_analysis)); } catch (e) {}
        }
      })
      .catch(() => { toast.error('Producto no encontrado'); navigate('/products'); })
      .finally(() => setLoading(false));
  }, [id]);

  const refreshScore = async () => {
    setLoadingScore(true);
    try {
      const res = await aiApi.score(id);
      setAiScore(res.data);
      setProduct(prev => ({ ...prev, ai_score: res.data.score }));
      toast.success('Score actualizado');
    } catch (e) { toast.error('Error calculando score'); }
    finally { setLoadingScore(false); }
  };

  const generateDescription = async () => {
    setLoadingDesc(true);
    try {
      const res = await aiApi.describe(id, descPlatform);
      setDescription(res.data.description);
      toast.success('Descripción generada');
    } catch (e) { toast.error('Error generando descripción'); }
    finally { setLoadingDesc(false); }
  };

  const analyzeCompetition = async () => {
    setLoadingComp(true);
    try {
      const res = await aiApi.analyze(id);
      setCompetition(res.data);
      toast.success('Análisis completado');
    } catch (e) { toast.error('Error en análisis'); }
    finally { setLoadingComp(false); }
  };

  if (loading) return (
    <div className="page-content">
      <div className="flex flex-col gap-4">
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{height: '120px'}} />)}
      </div>
    </div>
  );

  if (!product) return null;

  const margin = parseFloat(product.profit_margin) || 0;
  const score = product.ai_score;

  const getScoreClass = (s) => s >= 8 ? 'score-excellent' : s >= 6 ? 'score-good' : s >= 4 ? 'score-average' : 'score-poor';

  return (
    <div className="page-content animate-in">
      {/* Back */}
      <button className="btn btn-ghost btn-sm mb-6" onClick={() => navigate('/products')}>
        <ArrowLeft size={14} /> Volver a productos
      </button>

      {/* Header */}
      <div className="detail-header mb-6">
        <div className="flex gap-6 items-start">
          <div className="detail-product-image-container">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="detail-product-image" />
            ) : (
              <div className="detail-product-image-placeholder">
                <Package size={48} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {product.is_featured && <span className="badge badge-primary">⭐ Featured</span>}
              <span className="badge badge-neutral">{product.category}</span>
            </div>
            <h1 className="text-headline">{product.name}</h1>
            {product.problem_solved && (
              <p className="text-muted mt-2">💡 {product.problem_solved}</p>
            )}
          </div>
        </div>
        <div className={`score-ring ${getScoreClass(score)}`} style={{ width: 64, height: 64, fontSize: 20 }}>
          {score?.toFixed(1) || '—'}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid mb-6">
        {[
          { icon: DollarSign, label: 'Precio Compra', value: `$${product.buy_price}`, color: 'var(--color-ink-muted)' },
          { icon: DollarSign, label: 'Precio Venta', value: `$${product.sell_price}`, color: 'var(--color-ink)' },
          { icon: TrendingUp, label: 'Margen Neto', value: `${margin.toFixed(1)}%`, color: 'var(--color-success)' },
          { icon: Zap, label: 'Trend Growth', value: `+${product.trend_growth_percent || 0}%`, color: 'var(--color-trending)' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="metric-card">
            <Icon size={16} style={{ color }} />
            <div>
              <div className="metric-big-value" style={{ color }}>{value}</div>
              <div className="metric-big-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="detail-grid">
        {/* Left column */}
        <div className="flex flex-col gap-5">

          {/* AI Score Panel */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Star size={16} style={{ color: 'var(--color-warning)' }} />
                <h2 className="text-card-title">Score de Rentabilidad IA</h2>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={refreshScore} disabled={loadingScore}>
                {loadingScore ? <div className="spinner" /> : <RefreshCw size={14} />}
                Recalcular
              </button>
            </div>

            {aiScore ? (
              <div>
                {aiScore.reasoning && (
                  <p className="text-sm text-muted mb-4 p-3 rounded-lg" 
                     style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)' }}>
                    {aiScore.reasoning}
                  </p>
                )}
                {aiScore.breakdown && (
                  <div className="score-breakdown">
                    {Object.entries(aiScore.breakdown).map(([key, val]) => (
                      <div key={key} className="score-row">
                        <span className="score-key">{key}</span>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-fill" style={{
                            width: `${(val / 10) * 100}%`,
                            background: val >= 8 ? 'var(--color-success)' : val >= 6 ? 'var(--color-primary)' : 'var(--color-warning)'
                          }} />
                        </div>
                        <span className="score-val">{val}/10</span>
                      </div>
                    ))}
                  </div>
                )}
                {aiScore.recommendation && (
                  <div className="recommendation-box">
                    <span>💡</span>
                    <p className="text-sm">{aiScore.recommendation}</p>
                  </div>
                )}
                {aiScore.risk && (
                  <div className="flex items-center gap-2 mt-3">
                    <AlertTriangle size={12} />
                    <span className="text-xs text-subtle">Riesgo:</span>
                    <span className={`badge ${aiScore.risk === 'low' ? 'badge-success' : aiScore.risk === 'medium' ? 'badge-warning' : 'badge-danger'}`}>
                      {aiScore.risk === 'low' ? 'Bajo' : aiScore.risk === 'medium' ? 'Medio' : 'Alto'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-score">
                <p className="text-subtle text-sm">No hay score calculado aún.</p>
                <button className="btn btn-primary btn-sm" onClick={refreshScore} disabled={loadingScore}>
                  {loadingScore ? <div className="spinner" /> : <Sparkles size={14} />}
                  Calcular Score IA
                </button>
              </div>
            )}
          </div>

          {/* AI Description */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-card-title">✍️ Descripción IA</h2>
              <div className="flex gap-2 items-center">
                <select 
                  className="input"
                  style={{ width: 'auto', padding: '5px 8px', fontSize: '12px' }}
                  value={descPlatform}
                  onChange={e => setDescPlatform(e.target.value)}
                >
                  {Object.entries(PLATFORMS).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
                <button className="btn btn-primary btn-sm" onClick={generateDescription} disabled={loadingDesc}>
                  {loadingDesc ? <div className="spinner" /> : <Sparkles size={12} />}
                  Generar
                </button>
              </div>
            </div>

            {description || product.ai_description ? (
              <div>
                <div className="description-box">
                  <p className="text-sm">{description || product.ai_description}</p>
                </div>
                <div className="flex justify-end mt-3">
                  <CopyButton text={description || product.ai_description} />
                </div>
              </div>
            ) : (
              <p className="text-subtle text-sm">Selecciona plataforma y genera una descripción lista para copiar.</p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Platforms */}
          <div className="card">
            <h2 className="text-card-title mb-4">
              <Globe size={16} style={{ display: 'inline', marginRight: 8 }} />
              Plataformas
            </h2>
            <div className="platforms-list">
              {(product.platforms || []).map(p => (
                <div key={p} className="platform-item">
                  <span>{PLATFORMS[p]?.icon || '🌐'}</span>
                  <span>{PLATFORMS[p]?.label || p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier & References */}
          <div className="card">
            <h2 className="text-card-title mb-4">📦 Proveedor y Referencias</h2>
            <div className="supplier-info flex flex-col gap-3">
              <div>
                <span className="supplier-name">Proveedor recomendado: <strong>{product.supplier_name || 'AliExpress'}</strong></span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <a 
                  href={product.supplier_link || `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(product.name)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary btn-sm flex-1"
                >
                  <ExternalLink size={12} /> Ver Proveedor (AliExpress/Amazon)
                </a>
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                <a 
                  href={product.video_reference_link || `https://www.tiktok.com/search?q=${encodeURIComponent(product.name)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary btn-sm flex-1"
                >
                  <ExternalLink size={12} /> Ver Video Viral (TikTok/Instagram)
                </a>
              </div>
            </div>
          </div>

          {/* Competition Analysis */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-card-title">
                <BarChart3 size={16} style={{ display: 'inline', marginRight: 8 }} />
                Análisis Competencia
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={analyzeCompetition} disabled={loadingComp}>
                {loadingComp ? <div className="spinner" /> : <BarChart3 size={14} />}
                Analizar
              </button>
            </div>

            {competition ? (
              <div className="competition-analysis">
                <div className="comp-row">
                  <span className="text-subtle text-xs">Saturación</span>
                  <span className={`badge ${
                    competition.saturationLevel === 'low' ? 'badge-success' :
                    competition.saturationLevel === 'medium' ? 'badge-warning' : 'badge-danger'
                  }`}>{competition.saturationLevel}</span>
                </div>
                <div className="comp-row">
                  <span className="text-subtle text-xs">Tamaño mercado</span>
                  <span className="badge badge-primary">{competition.marketSize}</span>
                </div>
                <div className="comp-row">
                  <span className="text-subtle text-xs">Ventana oportunidad</span>
                  <span className="text-xs text-muted">{competition.opportunityWindow}</span>
                </div>
                {competition.keyInsight && (
                  <div className="insight-box">
                    <p className="text-xs">{competition.keyInsight}</p>
                  </div>
                )}
                {competition.differentiators?.length > 0 && (
                  <div>
                    <p className="text-xs text-subtle mb-2 mt-3">Diferenciadores:</p>
                    {competition.differentiators.map((d, i) => (
                      <div key={i} className="differentiator">• {d}</div>
                    ))}
                  </div>
                )}
                {competition.pricingStrategy && (
                  <div className="pricing-strategy">
                    <p className="text-xs text-subtle mb-2">Estrategia de precios:</p>
                    <div className="pricing-options">
                      <div className="pricing-opt">
                        <span className="text-xs">Mín</span>
                        <span className="font-bold">${competition.pricingStrategy.minimum}</span>
                      </div>
                      <div className="pricing-opt recommended">
                        <span className="text-xs">Ideal</span>
                        <span className="font-bold">${competition.pricingStrategy.recommended}</span>
                      </div>
                      <div className="pricing-opt">
                        <span className="text-xs">Premium</span>
                        <span className="font-bold">${competition.pricingStrategy.premium}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-subtle text-sm">Haz clic en "Analizar" para obtener un análisis de competencia con IA.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
