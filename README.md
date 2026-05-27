# DropWin — Plataforma de Dropshipping con IA 🚀

## Stack Tecnológico
- **Frontend**: React + Vite (puerto 5173)
- **Backend**: Next.js API Routes (puerto 3000)
- **Base de datos**: Supabase (PostgreSQL)
- **IA**: Google Gemini 1.5 Flash
- **Diseño**: Linear Design System

---

## 🛠️ Setup Inicial

### 1. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y accede a tu proyecto
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase-schema.sql`
3. Ve a **Settings → API** y copia:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Obtener API Key de Gemini

1. Ve a [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Crea una nueva API Key
3. Cópiala

### 3. Configurar variables de entorno

**Backend** (`backend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://XXXXXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJXXXXXXXX
SUPABASE_SERVICE_ROLE_KEY=eyJXXXXXXXX
GEMINI_API_KEY=AIzaSyXXXXXXXX
```

**Frontend** (`frontend/.env.local`):
```env
VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJXXXXXXXX
VITE_API_URL=http://localhost:3000/api
```

### 4. Crear usuario administrador en Supabase

1. Ve a Supabase → **Authentication → Users**
2. Haz clic en **"Add User"** → Invite user
3. Usa: `admin@dropwin.com` / contraseña de tu elección

---

## 🚀 Ejecutar la aplicación

```bash
# Terminal 1 — Backend (Next.js)
cd backend
npm run dev
# → http://localhost:3000

# Terminal 2 — Frontend (Vite)
cd frontend
npm run dev
# → http://localhost:5173
```

Abre `http://localhost:5173` en tu navegador y haz login con las credenciales de Supabase Auth.

---

## 📱 Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| 🏠 Dashboard | Métricas, top productos, botón "Scan IA" |
| 📦 Catálogo | 20+ productos con filtros avanzados |
| 🤖 Score IA | Gemini califica rentabilidad 1-10 |
| ✍️ Descripción IA | Copy listo para Shopify/TikTok/Amazon |
| 📊 Análisis | Competencia + estrategia de precios |
| 💬 AI Chat | Asistente dropshipping con Gemini |
| 🔐 Admin | CRUD de productos + Scan automático |

---

## 🗂️ Estructura del Proyecto

```
Gadget rentables/
├── frontend/          # React + Vite
│   └── src/
│       ├── components/   # ProductCard, Sidebar, etc.
│       ├── pages/        # Dashboard, Products, AIChat, Admin
│       ├── services/     # API client
│       ├── context/      # AuthContext
│       └── styles/       # Linear design tokens
├── backend/           # Next.js API
│   ├── pages/api/       # API Routes
│   ├── lib/             # Supabase, Gemini clients
│   ├── services/        # Business logic
│   └── repositories/    # Data access layer
└── supabase-schema.sql  # DB schema + seed data
```
