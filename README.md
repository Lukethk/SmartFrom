# SmartForm

Plataforma web para extraer datos de formularios físicos, validar resultados y exportar a plantillas Excel.

## Stack

- Frontend: React + Tailwind + Vite
- Backend: FastAPI + SQLAlchemy + RQ
- DB: PostgreSQL (Docker), SQLite local por defecto
- Cola: Redis + RQ worker
- Infra: Docker Compose + Nginx reverse proxy

## Estructura

- `frontend/`: aplicación web
- `backend/`: API, modelos, worker y tests
- `infra/`: configuración de Nginx

## Ejecutar con Docker

1. Crear entorno:
   - `cp .env.example .env`
2. Levantar servicios:
   - `docker compose up --build`
3. URLs:
   - Frontend: `http://localhost:5173`
   - API: `http://localhost:8000/docs`
   - Reverse proxy: `http://localhost:8080`

## Endpoints principales

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/password-reset/request`
- `POST /auth/password-reset/confirm`
- `POST /auth/change-password`
- `GET /templates/`
- `POST /templates/`
- `POST /templates/{template_id}/fields`
- `GET /mappings/`
- `POST /mappings/`
- `GET /batches/`
- `POST /batches/`
- `POST /batches/{batch_id}/retry`
- `GET /extractions/batch/{batch_id}`
- `PATCH /extractions/{extraction_id}`
- `POST /exports/xlsx`
- `GET /health`
- `GET /ready`

## Notas de alcance

- Incluye autenticación sin roles.
- No incluye módulo de auditoría.
- No persiste archivos binarios de lotes ni exportes en disco: se procesan temporalmente.

## Despliegue gratuito sin Docker (Vercel)

### Arquitectura recomendada

- Proyecto 1 en Vercel: `backend/` (FastAPI serverless)
- Proyecto 2 en Vercel: `frontend/` (Vite estático)
- Base de datos gratis: Neon Postgres
- Redis opcional: Upstash (solo si activas cola asíncrona)

### 1) Deploy backend

1. Crea un nuevo proyecto Vercel apuntando al directorio `backend/`.
2. Runtime: Python (detectado por `backend/vercel.json`).
3. Configura variables de entorno:
   - `APP_NAME=SmartForm API`
   - `APP_ENV=production`
   - `SECRET_KEY=<tu-secreto>`
   - `ALGORITHM=HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES=30`
   - `REFRESH_TOKEN_EXPIRE_MINUTES=10080`
   - `RESET_TOKEN_EXPIRE_MINUTES=30`
   - `DATABASE_URL=<postgresql+psycopg2://... de Neon>`
   - `GEMINI_API_KEY=<tu-api-key>`
   - `GEMINI_MODEL=gemini-2.5-flash`
   - `CORS_ORIGINS=<url-del-frontend>`
   - `USE_ASYNC_QUEUE=false`
4. Despliega y verifica:
   - `/health`
   - `/docs`

### 2) Deploy frontend

1. Crea otro proyecto Vercel apuntando al directorio `frontend/`.
2. Build: Vite (detectado por `frontend/vercel.json`).
3. Variable de entorno:
   - `VITE_API_URL=<url-del-backend-vercel>`
4. Despliega y prueba login/registro.

### 3) Si luego quieres cola asíncrona

- Define `USE_ASYNC_QUEUE=true`.
- Agrega Redis (por ejemplo Upstash) y `REDIS_URL`.
- Ejecuta el worker en un servicio aparte (Railway/Render/Fly), ya que Vercel no mantiene workers persistentes.
