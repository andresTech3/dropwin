import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { productsApi } from '../services/api';
import toast from 'react-hot-toast';
import './Admin.css';

const EMPTY_PRODUCT = {
  name: '', category: '', description: '', problem_solved: '',
  buy_price: '', sell_price: '', competition_level: 'medium',
  trend_growth_percent: '', supplier_name: '', aliexpress_url: '',
  platforms: [], is_featured: false,
};

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const togglePlatform = (p) => {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter(x => x !== p)
        : [...prev.platforms, p]
    }));
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Nombre requerido'); return; }
    setSaving(true);
    try {
      let result;
      if (product?.id) {
        result = await productsApi.update(product.id, form);
        toast.success('Producto actualizado');
      } else {
        result = await productsApi.create(form);
        toast.success('Producto creado');
      }
      onSave(result.data);
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const platforms = ['tiktok', 'shopify', 'amazon', 'mercadolibre', 'instagram'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2 className="text-card-title mb-5">{product?.id ? 'Editar' : 'Nuevo'} Producto</h2>
        <div className="modal-grid">
          <div className="form-group">
            <label className="filter-label">Nombre</label>
            <input className="input" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Nombre del producto" />
          </div>
          <div className="form-group">
            <label className="filter-label">Categoría</label>
            <input className="input" value={form.category} onChange={e => update('category', e.target.value)} placeholder="Tech & Office" />
          </div>
          <div className="form-group">
            <label className="filter-label">Precio Compra ($)</label>
            <input className="input" type="number" value={form.buy_price} onChange={e => update('buy_price', e.target.value)} placeholder="8.50" />
          </div>
          <div className="form-group">
            <label className="filter-label">Precio Venta ($)</label>
            <input className="input" type="number" value={form.sell_price} onChange={e => update('sell_price', e.target.value)} placeholder="34.99" />
          </div>
          <div className="form-group" style={{ gridColumn: '1/-1' }}>
            <label className="filter-label">Problema que resuelve</label>
            <input className="input" value={form.problem_solved} onChange={e => update('problem_solved', e.target.value)} placeholder="..." />
          </div>
          <div className="form-group">
            <label className="filter-label">Competencia</label>
            <select className="input" value={form.competition_level} onChange={e => update('competition_level', e.target.value)}>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <div className="form-group">
            <label className="filter-label">Trend Growth (%)</label>
            <input className="input" type="number" value={form.trend_growth_percent} onChange={e => update('trend_growth_percent', e.target.value)} placeholder="145" />
          </div>
          <div className="form-group">
            <label className="filter-label">Proveedor</label>
            <input className="input" value={form.supplier_name} onChange={e => update('supplier_name', e.target.value)} placeholder="AliExpress" />
          </div>
          <div className="form-group">
            <label className="filter-label">URL AliExpress</label>
            <input className="input" value={form.aliexpress_url} onChange={e => update('aliexpress_url', e.target.value)} placeholder="https://..." />
          </div>
          <div className="form-group" style={{ gridColumn: '1/-1' }}>
            <label className="filter-label">Plataformas</label>
            <div className="flex gap-2 flex-wrap">
              {platforms.map(p => (
                <button
                  key={p}
                  type="button"
                  className={`btn btn-sm ${form.platforms.includes(p) ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => togglePlatform(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => update('is_featured', e.target.checked)} />
              <span className="filter-label">Producto destacado</span>
            </label>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <div className="spinner" /> : null}
            {product?.id ? 'Actualizar' : 'Crear'} Producto
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [scanning, setScanning] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await productsApi.getAll({ limit: '100' });
      setProducts(res.data || []);
    } catch (e) { toast.error('Error cargando productos'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await productsApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Eliminado');
    } catch (e) { toast.error(e.message); }
  };

  const handleToggleActive = async (product) => {
    try {
      const res = await productsApi.update(product.id, { is_active: !product.is_active });
      setProducts(prev => prev.map(p => p.id === product.id ? res.data : p));
    } catch (e) { toast.error(e.message); }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      toast.loading('Escaneando productos trending con IA...', { id: 'scan' });
      const res = await productsApi.scan(10);
      toast.success(`✅ ${res.productsCreated} productos creados`, { id: 'scan' });
      await load();
    } catch (e) { toast.error(e.message, { id: 'scan' }); }
    finally { setScanning(false); }
  };

  const handleSave = (saved) => {
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = saved; return copy; }
      return [saved, ...prev];
    });
    setModal(null);
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-content animate-in">
      <div className="admin-header mb-6">
        <div>
          <h1 className="text-title">Panel Admin</h1>
          <p className="text-subtle text-sm mt-1">{products.length} productos en total</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setModal({})}>
            <Plus size={14} /> Nuevo
          </button>
          <button className="btn btn-primary" onClick={handleScan} disabled={scanning}>
            {scanning ? <div className="spinner" /> : <Sparkles size={14} />}
            {scanning ? 'Escaneando...' : 'Scan IA'}
          </button>
        </div>
      </div>

      <div className="input-icon-wrapper mb-5" style={{ maxWidth: 360 }}>
        <Search size={14} className="input-icon" />
        <input className="input" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="admin-table">
        <div className="table-header">
          <span>Producto</span>
          <span>Score</span>
          <span>Margen</span>
          <span>Competencia</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '52px', borderRadius: '6px', marginBottom: '4px' }} />
          ))
        ) : filtered.map(product => (
          <motion.div 
            key={product.id} 
            className="table-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div>
              <span className="text-sm font-bold">{product.name}</span>
              <span className="text-xs text-subtle block">{product.category}</span>
            </div>
            <div className={`score-ring score-ring-sm ${
              product.ai_score >= 8 ? 'score-excellent' : product.ai_score >= 6 ? 'score-good' : 'score-average'
            }`}>
              {product.ai_score?.toFixed(1) || '—'}
            </div>
            <span className="text-sm text-success">{product.profit_margin}%</span>
            <span className={`badge ${
              product.competition_level === 'low' ? 'badge-success' :
              product.competition_level === 'medium' ? 'badge-warning' : 'badge-danger'
            }`}>{product.competition_level}</span>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleToggleActive(product)}>
              {product.is_active ? <ToggleRight size={18} style={{ color: 'var(--color-success)' }} /> : <ToggleLeft size={18} />}
            </button>
            <div className="flex gap-1">
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(product)} title="Editar">
                <Edit size={14} />
              </button>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(product.id)} title="Eliminar"
                style={{ color: 'var(--color-danger)' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {modal !== null && (
        <ProductModal
          product={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
