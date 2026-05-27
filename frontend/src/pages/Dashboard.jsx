import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, TrendingUp, DollarSign, Zap, 
  ArrowUpRight, RefreshCw, Sparkles, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { dashboardApi, productsApi } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';
import './Dashboard.css';

function StatCard({ icon: Icon, label, value, suffix = '', color = 'var(--color-primary)', trend }) {
  return (
    <motion.div 
      className="stat-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="stat-icon" style={{ color, background: `${color}15` }}>
        <Icon size={18} />
      </div>
      <div className="stat-content">
        <div className="stat-value">
          {value !== undefined ? value : '—'}{suffix}
        </div>
        <div className="stat-label">{label}</div>
        {trend && (
          <div className="stat-trend">
            <ArrowUpRight size={10} />
            <span>{trend}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      setStats(res.data.stats);
      setTopProducts(res.data.topScored || []);
    } catch (err) {
      console.error(err);
      toast.error('Error cargando datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      toast.loading('IA escaneando productos trending...', { id: 'scan' });
      const res = await productsApi.scan(10);
      toast.success(`✅ ${res.productsCreated} productos nuevos encontrados`, { id: 'scan' });
      await loadData();
    } catch (err) {
      toast.error(err.message, { id: 'scan' });
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const categoryEntries = stats ? Object.entries(stats.byCategory || {}).sort((a,b) => b[1]-a[1]).slice(0, 5) : [];
  const maxCategoryCount = categoryEntries[0]?.[1] || 1;

  return (
    <div className="page-content dashboard-page animate-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="text-title">Dashboard</h1>
          <p className="text-subtle text-sm mt-1">Resumen de productos y métricas de rentabilidad</p>
        </div>
        <div className="flex gap-3 items-center">
          <button className="btn btn-secondary btn-sm" onClick={loadData}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Actualizar
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleScan}
            disabled={scanning}
          >
            {scanning ? <div className="spinner" /> : <Sparkles size={14} />}
            {scanning ? 'Escaneando...' : 'Scan IA'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-stats mb-8">
        <StatCard
          icon={Package}
          label="Total Productos"
          value={loading ? '...' : stats?.total}
          color="var(--color-primary)"
        />
        <StatCard
          icon={Zap}
          label="Score IA Promedio"
          value={loading ? '...' : stats?.avgScore}
          suffix="/10"
          color="var(--color-trending)"
          trend="actualizado hoy"
        />
        <StatCard
          icon={DollarSign}
          label="Margen Promedio"
          value={loading ? '...' : stats?.avgMargin}
          suffix="%"
          color="var(--color-success)"
        />
        <StatCard
          icon={TrendingUp}
          label="Categorías Activas"
          value={loading ? '...' : Object.keys(stats?.byCategory || {}).length}
          color="var(--color-hot)"
        />
      </div>

      {/* Main content grid */}
      <div className="dashboard-grid">
        {/* Top Products */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="text-card-title">🏆 Top Productos por Score IA</h2>
            <Link to="/products" className="btn btn-ghost btn-sm">
              Ver todos <ArrowUpRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{height: '60px'}} />)}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={32} />
              <p>No hay productos aún. Usa el botón "Scan IA" para generar productos trending.</p>
              <button className="btn btn-primary" onClick={handleScan}>
                <Sparkles size={14} /> Scan IA Ahora
              </button>
            </div>
          ) : (
            <div className="top-products-list">
              {topProducts.slice(0, 8).map((product, i) => (
                <Link key={product.id} to={`/products/${product.id}`} className="top-product-item">
                  <span className="top-rank">#{i + 1}</span>
                  <div className="top-product-info">
                    <span className="top-product-name">{product.name}</span>
                    <span className="top-product-cat text-xs text-subtle">{product.category}</span>
                  </div>
                  <div className="top-product-metrics">
                    <span className="text-sm" style={{ color: 'var(--color-success)' }}>
                      {product.profit_margin}%
                    </span>
                    <div className={`score-ring score-ring-sm ${
                      product.ai_score >= 8 ? 'score-excellent' : 
                      product.ai_score >= 6 ? 'score-good' : 'score-average'
                    }`}>
                      {product.ai_score?.toFixed(1)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="dashboard-right">
          {/* Category chart */}
          <div className="card">
            <h2 className="text-card-title mb-4">📊 Por Categoría</h2>
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{height: '36px'}} />)}
              </div>
            ) : categoryEntries.length === 0 ? (
              <p className="text-subtle text-sm">Sin datos aún</p>
            ) : (
              <div className="category-chart">
                {categoryEntries.map(([cat, count]) => (
                  <div key={cat} className="category-bar-row">
                    <span className="category-label">{cat}</span>
                    <div className="category-bar-track">
                      <motion.div
                        className="category-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / maxCategoryCount) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="category-count">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Competition breakdown */}
          <div className="card mt-4">
            <h2 className="text-card-title mb-4">⚔️ Nivel de Competencia</h2>
            {stats?.byCompetition ? (
              <div className="competition-grid">
                {[
                  { key: 'low', label: 'Baja', class: 'badge-success', icon: '🟢' },
                  { key: 'medium', label: 'Media', class: 'badge-warning', icon: '🟡' },
                  { key: 'high', label: 'Alta', class: 'badge-danger', icon: '🔴' },
                ].map(({ key, label, class: cls, icon }) => (
                  <div key={key} className="competition-item">
                    <span className="competition-icon">{icon}</span>
                    <span className="competition-label">{label}</span>
                    <span className={`badge ${cls}`}>{stats.byCompetition[key] || 0}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-subtle text-sm">Sin datos</p>
            )}
          </div>

          {/* Quick tip */}
          <div className="tip-card">
            <div className="tip-icon">💡</div>
            <div>
              <p className="text-sm font-bold mb-1">Tip del día</p>
              <p className="text-sm text-muted">
                Los productos con score IA ≥ 8 y competencia baja son ideales para empezar. 
                Prioriza márgenes sobre volumen al inicio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
