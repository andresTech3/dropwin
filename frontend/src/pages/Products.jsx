import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productsApi } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';
import './Products.css';

const COMPETITION_OPTIONS = [
  { value: '', label: 'Toda competencia' },
  { value: 'low', label: '🟢 Baja' },
  { value: 'medium', label: '🟡 Media' },
  { value: 'high', label: '🔴 Alta' },
];

const SORT_OPTIONS = [
  { value: 'ai_score', label: '⭐ Score IA' },
  { value: 'profit_margin', label: '💰 Margen' },
  { value: 'trend_growth_percent', label: '📈 Tendencia' },
  { value: 'created_at', label: '🕐 Más reciente' },
];

const PLATFORM_OPTIONS = ['tiktok', 'shopify', 'amazon', 'mercadolibre', 'instagram'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    platform: '',
    competition: '',
    minScore: '',
    orderBy: 'ai_score',
    order: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters, search: search || undefined };
      // Remove empty strings
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      
      const res = await productsApi.getAll(params);
      setProducts(res.data || []);
      setTotalCount(res.count || res.data?.length || 0);
    } catch (err) {
      toast.error('Error cargando productos');
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  // Load categories once
  useEffect(() => {
    productsApi.getAll({ limit: '200' })
      .then(res => {
        const cats = [...new Set((res.data || []).map(p => p.category).filter(Boolean))].sort();
        setCategories(cats);
      })
      .catch(() => {});
  }, []);

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => {
    setFilters({ category: '', platform: '', competition: '', minScore: '', orderBy: 'ai_score', order: 'desc' });
    setSearch('');
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'orderBy' && k !== 'order').length + (search ? 1 : 0);

  return (
    <div className="page-content animate-in">
      {/* Header */}
      <div className="products-header mb-6">
        <div>
          <h1 className="text-title">Catálogo de Productos</h1>
          <p className="text-subtle text-sm mt-1">
            {loading ? 'Cargando...' : `${totalCount} productos encontrados`}
          </p>
        </div>
      </div>

      {/* Search & Controls */}
      <div className="products-controls mb-5">
        <div className="input-icon-wrapper" style={{ flex: 1, maxWidth: '400px' }}>
          <Search size={14} className="input-icon" />
          <input
            className="input"
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="search-products"
          />
        </div>

        <select 
          className="input"
          style={{ width: 'auto' }}
          value={filters.orderBy}
          onChange={e => updateFilter('orderBy', e.target.value)}
          id="sort-products"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button 
          className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setShowFilters(!showFilters)}
          id="toggle-filters"
        >
          <SlidersHorizontal size={14} />
          Filtros
          {activeFilterCount > 0 && (
            <span className="badge badge-hot" style={{ padding: '1px 6px', fontSize: '10px' }}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            <X size={12} /> Limpiar
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="filter-panel mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="filter-grid">
              <div className="filter-group">
                <label className="filter-label">Categoría</label>
                <select className="input" value={filters.category} onChange={e => updateFilter('category', e.target.value)}>
                  <option value="">Todas</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Plataforma</label>
                <select className="input" value={filters.platform} onChange={e => updateFilter('platform', e.target.value)}>
                  <option value="">Todas</option>
                  {PLATFORM_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Competencia</label>
                <select className="input" value={filters.competition} onChange={e => updateFilter('competition', e.target.value)}>
                  {COMPETITION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Score mínimo IA</label>
                <select className="input" value={filters.minScore} onChange={e => updateFilter('minScore', e.target.value)}>
                  <option value="">Cualquier score</option>
                  <option value="9">9+ (Excelente)</option>
                  <option value="8">8+ (Muy bueno)</option>
                  <option value="7">7+ (Bueno)</option>
                  <option value="5">5+ (Regular)</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Niche Tabs / Categorías */}
      <div className="niche-tabs-container mb-6">
        <button 
          className={`niche-tab ${!filters.category ? 'active' : ''}`}
          onClick={() => updateFilter('category', '')}
        >
          🌐 Todos los Nichos
        </button>
        {categories.map(cat => {
          let emoji = '📦';
          const lower = cat.toLowerCase();
          if (lower.includes('tech') || lower.includes('gaming') || lower.includes('tecnología') || lower.includes('office') || lower.includes('oficina') || lower.includes('productividad')) emoji = '💻';
          else if (lower.includes('cocina') || lower.includes('hogar') || lower.includes('decoración') || lower.includes('exterior')) emoji = '🏠';
          else if (lower.includes('salud') || lower.includes('bienestar') || lower.includes('familia') || lower.includes('deporte')) emoji = '❤️';
          else if (lower.includes('belleza') || lower.includes('cuidado')) emoji = '✨';
          else if (lower.includes('viaje') || lower.includes('lifestyle')) emoji = '✈️';

          return (
            <button 
              key={cat}
              className={`niche-tab ${filters.category === cat ? 'active' : ''}`}
              onClick={() => updateFilter('category', cat)}
            >
              {emoji} {cat}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid-products">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '360px', borderRadius: '12px' }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state" style={{ minHeight: '400px' }}>
          <Search size={40} style={{ color: 'var(--color-ink-subtle)' }} />
          <p className="text-card-title">Sin productos</p>
          <p className="text-subtle">Prueba cambiar los filtros o usa Scan IA para generar nuevos productos.</p>
        </div>
      ) : (
        <div className="grid-products">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
