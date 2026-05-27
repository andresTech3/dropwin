-- ============================================
-- DropWin Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  
  -- Financial metrics
  buy_price DECIMAL(10,2),
  sell_price DECIMAL(10,2),
  profit_margin DECIMAL(5,2),
  
  -- Trend metrics
  trend_score INTEGER CHECK (trend_score >= 1 AND trend_score <= 10),
  trend_growth_percent DECIMAL(7,2),
  competition_level TEXT CHECK (competition_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  
  -- AI fields
  ai_score DECIMAL(3,1) CHECK (ai_score >= 0 AND ai_score <= 10),
  ai_description TEXT,
  ai_competition_analysis TEXT,
  problem_solved TEXT,
  
  -- Suppliers
  aliexpress_url TEXT,
  cj_dropshipping_url TEXT,
  supplier_name TEXT,
  
  -- Platforms
  platforms TEXT[] DEFAULT '{}',
  
  -- Meta
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Scans log table
CREATE TABLE IF NOT EXISTS ai_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  products_found INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Chat history table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_ai_score ON products(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_competition ON products(competition_level);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('english', name));

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (backend uses service role key)
CREATE POLICY "Service role full access on products"
  ON products FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on ai_scans"
  ON ai_scans FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on chat_messages"
  ON chat_messages FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- SEED DATA — 20 Trending Products
-- ============================================

INSERT INTO products (name, category, description, problem_solved, buy_price, sell_price, profit_margin, competition_level, trend_growth_percent, platforms, supplier_name, ai_score, is_featured, is_active) VALUES

('Anillo LED RGB para Videollamadas', 'Tech & Office', 'Aro de luz LED que se clip en laptops y monitores para videollamadas profesionales', 'La mala iluminación durante videollamadas hace ver poco profesional', 7.50, 39.99, 81.2, 'low', 280, ARRAY['tiktok','shopify','amazon'], 'AliExpress', 9.2, true, true),

('Soporte Ergonómico de Cuello para Celular', 'Salud & Bienestar', 'Soporte flexible que mantiene el teléfono a la altura de los ojos para evitar dolor cervical', 'Mirar el celular hacia abajo causa dolor de cuello y mala postura', 5.00, 24.99, 80.0, 'medium', 195, ARRAY['tiktok','shopify','mercadolibre'], 'AliExpress', 8.7, true, true),

('Cargador Inalámbrico 3 en 1 MagSafe', 'Tech & Office', 'Carga simultánea para iPhone, Apple Watch y AirPods en una sola base elegante', 'Los cables desordenados y cargar dispositivos por separado es ineficiente', 18.00, 79.99, 77.5, 'medium', 165, ARRAY['shopify','amazon','tiktok'], 'AliExpress', 9.0, true, true),

('Cortador de Vegetales 12 en 1', 'Hogar & Cocina', 'Procesador manual de vegetales con 12 tipos de cortes diferentes y recipiente integrado', 'Cortar vegetales toma mucho tiempo y es peligroso con cuchillos tradicionales', 12.00, 49.99, 76.0, 'medium', 220, ARRAY['tiktok','shopify','amazon','mercadolibre'], 'AliExpress', 8.5, false, true),

('Dispensador Automático de Jabón con Sensor', 'Hogar & Cocina', 'Dispensador sin contacto de jabón líquido con sensor infrarrojo y batería recargable', 'El contacto con dispensadores manuales propaga gérmenes y bacterias', 8.50, 34.99, 75.7, 'low', 310, ARRAY['shopify','amazon','mercadolibre'], 'AliExpress', 8.9, true, true),

('Mini Proyector Portátil WiFi', 'Tech & Entertainment', 'Proyector de bolsillo con WiFi, 100 pulgadas de imagen y batería de 2 horas', 'Ver películas en pantalla pequeña arruina la experiencia cinematográfica', 45.00, 149.99, 70.0, 'high', 145, ARRAY['shopify','amazon','tiktok'], 'AliExpress', 7.8, false, true),

('Organizador Magnético de Escritorio', 'Productividad', 'Sistema modular con imanes para organizar cables, bolígrafos y accesorios de escritorio', 'Los escritorios desordenados reducen la productividad y concentración', 9.00, 39.99, 77.5, 'low', 189, ARRAY['shopify','tiktok','amazon'], 'AliExpress', 8.3, false, true),

('Alfombrilla Calefactora para Taza', 'Hogar & Oficina', 'Base calefactora USB que mantiene bebidas a temperatura ideal durante horas', 'El café y el té se enfrían antes de terminarlos durante el trabajo', 6.00, 29.99, 80.0, 'medium', 250, ARRAY['shopify','amazon','mercadolibre','tiktok'], 'AliExpress', 8.6, false, true),

('Peine Electrónico Antipiojos con UV', 'Salud & Familia', 'Peine eléctrico que elimina piojos y liendres con luz UV sin químicos', 'Los piojos son difíciles de eliminar con métodos químicos agresivos', 10.00, 44.99, 77.8, 'low', 175, ARRAY['shopify','mercadolibre','amazon'], 'AliExpress', 8.4, false, true),

('Peladora Eléctrica Universal de Frutas', 'Hogar & Cocina', 'Peladora automática para manzanas, papas y vegetales con cuchilla ajustable', 'Pelar frutas y vegetales manualmente es lento y puede causar cortes', 11.00, 42.99, 74.4, 'medium', 165, ARRAY['tiktok','shopify','amazon','mercadolibre'], 'AliExpress', 7.9, false, true),

('Teclado Mecánico Compacto 75% RGB', 'Tech & Gaming', 'Teclado mecánico pequeño con retroiluminación RGB y switches silenciosos', 'Los teclados grandes ocupan mucho espacio y los baratos tienen tacto malo', 22.00, 89.99, 75.6, 'high', 135, ARRAY['shopify','amazon'], 'AliExpress', 7.5, false, true),

('Cepillo Sónico Facial USB', 'Belleza & Cuidado', 'Dispositivo de limpieza facial con vibraciones sónicas y cerdas suaves recargable', 'La limpieza manual del rostro no elimina impurezas profundas en los poros', 8.00, 39.99, 80.0, 'medium', 290, ARRAY['tiktok','shopify','instagram','mercadolibre'], 'AliExpress', 9.1, true, true),

('Bolsa Compresora de Viaje al Vacío', 'Viaje & Lifestyle', 'Bolsas herméticas que comprimen ropa hasta 80% usando solo el rollo con la mano', 'Las maletas siempre están demasiado llenas y la ropa llega arrugada', 4.50, 24.99, 82.0, 'medium', 210, ARRAY['tiktok','shopify','amazon','mercadolibre'], 'AliExpress', 8.8, false, true),

('Audífonos de Conducción Ósea', 'Tech & Deporte', 'Audífonos que transmiten sonido a través de los pómulos sin tapar los oídos', 'Correr con audífonos tradicionales es peligroso por no escuchar el entorno', 25.00, 89.99, 72.2, 'medium', 155, ARRAY['shopify','amazon','tiktok'], 'AliExpress', 8.2, false, true),

('Plancha de Cabello 4 en 1 Inalámbrica', 'Belleza & Cuidado', 'Plancha recargable que funciona como alisador, rizador, voluminizador y secador', 'Viajar con múltiples herramientas de cabello es molesto y ocupan espacio', 28.00, 99.99, 72.0, 'medium', 185, ARRAY['tiktok','shopify','instagram','mercadolibre'], 'AliExpress', 8.0, false, true),

('Trampa Inteligente para Mosquitos UV', 'Hogar & Exterior', 'Trampa para mosquitos con luz UV y succión que no usa químicos ni repelentes', 'Los mosquitos arruinan el descanso y pueden transmitir enfermedades', 12.00, 49.99, 76.0, 'low', 240, ARRAY['shopify','amazon','mercadolibre'], 'AliExpress', 8.7, false, true),

('Lentes Anti Luz Azul para Gaming', 'Tech & Salud', 'Gafas con filtro de luz azul al 99% para reducir fatiga visual frente a pantallas', 'La luz azul de pantallas causa fatiga ocular, insomnio y dolor de cabeza', 6.00, 29.99, 80.0, 'high', 195, ARRAY['shopify','amazon','tiktok','mercadolibre'], 'AliExpress', 7.8, false, true),

('Medidor de Calidad del Aire Portátil', 'Salud & Tecnología', 'Dispositivo compacto que mide CO2, PM2.5, temperatura y humedad en tiempo real', 'El aire interior malo afecta la concentración, salud y sueño sin saberlo', 20.00, 79.99, 75.0, 'low', 310, ARRAY['shopify','amazon'], 'AliExpress', 9.0, true, true),

('Masajeador Percusivo Mini Portátil', 'Salud & Deporte', 'Pistola de masaje compacta con 4 velocidades para músculos y articulaciones', 'Los músculos tensos y dolores post-ejercicio afectan el rendimiento diario', 18.00, 69.99, 74.3, 'high', 175, ARRAY['tiktok','shopify','amazon','mercadolibre'], 'AliExpress', 8.1, false, true),

('Planta Artificial con Panel Solar LED', 'Decoración & Hogar', 'Planta decorativa realista con luces LED que se recargan con luz solar', 'Las plantas naturales requieren cuidado y mueren fácilmente, las falsas se ven poco realistas', 9.00, 39.99, 77.5, 'low', 165, ARRAY['shopify','tiktok','mercadolibre'], 'AliExpress', 8.4, false, true);
