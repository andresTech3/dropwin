import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, LogIn, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Login.css';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Completa todos los campos');
      return;
    }
    
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('¡Bienvenido a DropWin!');
      navigate('/');
    } catch (err) {
      toast.error('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background effects */}
      <div className="login-bg">
        <div className="bg-glow" />
      </div>

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon" style={{ width: 44, height: 44 }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <h1 className="login-brand">DropWin</h1>
            <div className="login-badge">
              <Sparkles size={10} />
              AI-Powered Dropshipping
            </div>
          </div>
        </div>

        <h2 className="login-title">Panel de Control</h2>
        <p className="login-subtitle text-subtle text-sm">
          Accede a tu dashboard de productos y análisis IA
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="login-email"
              type="email"
              className="input"
              placeholder="admin@dropwin.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: '40px' }}
                required
              />
              <button
                type="button"
                className="btn btn-ghost btn-icon btn-sm"
                style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full btn-lg mt-2"
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : <LogIn size={16} />}
            {loading ? 'Ingresando...' : 'Ingresar al Dashboard'}
          </button>
        </form>

        {/* Features preview */}
        <div className="login-features">
          {['🔥 Productos trending con IA', '📈 Score de rentabilidad', '💬 Asistente dropshipping'].map(f => (
            <div key={f} className="login-feature">
              <span>{f}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
