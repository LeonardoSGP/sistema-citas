# Sistema de Gestión de Consulta Psicológica

Sistema web profesional para la gestión de pacientes, citas y notas de sesión de una consulta psicológica.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | Vue 3, Vite, TypeScript, Tailwind CSS |
| Estado | Pinia |
| HTTP | Axios |
| Backend | Node.js, Express, TypeScript |
| Base de datos | MySQL |
| ORM | Prisma |
| Autenticación | JWT + bcrypt |
| CI | GitHub Actions |

---

## Requisitos previos

- Node.js v18 o superior
- npm v9 o superior
- MySQL 8.0 o superior
- Git

---

## Estructura del proyecto

```
psicologia-app/
├── frontend/           # Aplicación Vue 3
│   └── src/
│       ├── components/ # Componentes reutilizables
│       ├── views/      # Vistas / páginas
│       ├── layouts/    # Layouts base
│       ├── router/     # Configuración de rutas
│       ├── stores/     # Estado global (Pinia)
│       ├── services/   # Llamadas a la API
│       ├── types/      # Tipos TypeScript
│       └── composables/# Composables reutilizables
├── backend/            # API REST con Express
│   ├── prisma/         # Schema y seed de Prisma
│   └── src/
│       ├── config/     # Configuración
│       ├── controllers/# Controladores
│       ├── middleware/ # Middlewares
│       ├── routes/     # Rutas de la API
│       ├── services/   # Lógica de negocio
│       ├── validators/ # Validación de datos
│       ├── types/      # Tipos TypeScript
│       └── utils/      # Utilidades
├── .github/
│   └── workflows/      # GitHub Actions CI
├── .gitignore
└── README.md
```

---

## Configuración de MySQL

### Opción A: MySQL local

1. Instala MySQL 8.0
2. Crea la base de datos:

```sql
CREATE DATABASE psicologia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'psi_user'@'localhost' IDENTIFIED BY 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON psicologia_db.* TO 'psi_user'@'localhost';
FLUSH PRIVILEGES;
```

3. La `DATABASE_URL` quedará así:
```
DATABASE_URL="mysql://psi_user:tu_contraseña_segura@localhost:3306/psicologia_db"
```

### Opción B: TiDB Cloud (MySQL compatible, gratuito)

1. Ve a [tidbcloud.com](https://tidbcloud.com/) y crea una cuenta
2. Crea un cluster Serverless (gratuito)
3. Copia la cadena de conexión que te proporcionan

### Opción C: Aiven (MySQL, plan gratuito disponible)

1. Ve a [aiven.io](https://aiven.io/) y crea una cuenta
2. Crea un servicio MySQL en el plan gratuito
3. Copia la cadena de conexión

---

## Instalación

### 1. Clonar el repositorio (o navegar al directorio)

```bash
# Si ya tienes el proyecto localmente:
cd psicologia-app
```

### 2. Configurar el backend

```bash
cd backend

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus datos reales
# Especialmente: DATABASE_URL y JWT_SECRET

# Instalar dependencias
npm install
```

### 3. Configurar el frontend

```bash
cd frontend

# Copiar variables de entorno
cp .env.example .env

# Editar .env si el backend no corre en el puerto 3000
# VITE_API_URL=http://localhost:3000

# Instalar dependencias
npm install
```

---

## Variables de entorno

### backend/.env

```env
DATABASE_URL="mysql://usuario:contraseña@host:3306/psicologia_db"
JWT_SECRET="secreto-seguro-de-al-menos-32-caracteres"
FRONTEND_URL="http://localhost:5173"
PORT=3000
NODE_ENV=development
```

> ⚠️ **IMPORTANTE:** Nunca subas el archivo `.env` al repositorio.

### frontend/.env

```env
VITE_API_URL=http://localhost:3000
```

---

## Prisma

### Generar Prisma Client

```bash
cd backend
npm run prisma:generate
```

### Ejecutar migraciones

```bash
cd backend
npm run prisma:migrate
# Cuando pregunte el nombre, escribe algo como: init
```

### Ejecutar seed (datos de prueba)

```bash
cd backend
npm run prisma:seed
```

### Abrir Prisma Studio (opcional)

```bash
cd backend
npm run prisma:studio
```

---

## Credenciales ficticias de prueba

> Estas credenciales son únicamente para desarrollo local con el seed.

| Campo | Valor |
|-------|-------|
| Email | `laura@psicologia.dev` |
| Contraseña | `Demo1234!` |

---

## Ejecución local

### Backend (puerto 3000)

```bash
cd backend
npm run dev
```

### Frontend (puerto 5173)

```bash
cd frontend
npm run dev
```

Abre tu navegador en: **http://localhost:5173**

---

## Build para producción

### Frontend

```bash
cd frontend
npm run build
# Los archivos quedan en frontend/dist/
```

### Backend

```bash
cd backend
npm run build
# Los archivos quedan en backend/dist/
```

---

## Git

### Inicializar repositorio (primera vez)

```bash
# Desde la raíz del proyecto
git init
git add .
git commit -m "chore: initialize project"
```

### Conectar con GitHub

```bash
# Crea un repositorio en GitHub llamado 'psicologia-app'
git remote add origin https://github.com/TU_USUARIO/psicologia-app.git
git branch -M main
git push -u origin main
```

---

## Despliegue gratuito

### Frontend → Vercel

1. Ve a [vercel.com](https://vercel.com/) y crea una cuenta
2. Importa tu repositorio de GitHub
3. Configuración:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Agrega la variable de entorno:
   - `VITE_API_URL` = URL de tu backend en Render

### Backend → Render

1. Ve a [render.com](https://render.com/) y crea una cuenta
2. Crea un **Web Service** nuevo
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build && npm run prisma:generate`
   - **Start Command:** `npm start`
5. Agrega las variables de entorno:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL` = URL de tu sitio en Vercel
   - `NODE_ENV` = production

### Base de datos MySQL → TiDB Cloud (recomendado, gratuito)

1. Ve a [tidbcloud.com](https://tidbcloud.com/)
2. Crea un cluster **Serverless** (gratuito para proyectos pequeños)
3. Obtén la cadena de conexión y úsala como `DATABASE_URL`
4. Ejecuta las migraciones:
   ```bash
   cd backend
   npm run prisma:migrate
   ```

---

## Rutas de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/profile` | Perfil del usuario |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/patients` | Listar pacientes |
| POST | `/api/patients` | Crear paciente |
| GET | `/api/patients/:id` | Ver paciente |
| PUT | `/api/patients/:id` | Actualizar paciente |
| GET | `/api/patients/:id/expediente` | Ver expediente |
| PATCH | `/api/patients/:id/deactivate` | Desactivar paciente |
| PATCH | `/api/patients/:id/activate` | Activar paciente |
| GET | `/api/appointments` | Listar citas |
| GET | `/api/appointments/today` | Citas de hoy |
| GET | `/api/appointments/week` | Citas de la semana |
| POST | `/api/appointments` | Crear cita |
| PUT | `/api/appointments/:id` | Actualizar cita |
| PATCH | `/api/appointments/:id/status` | Cambiar estado |
| GET | `/api/session-notes` | Listar notas |
| POST | `/api/session-notes` | Crear nota |
| PUT | `/api/session-notes/:id` | Actualizar nota |

---

## Solución de problemas comunes

### Error: `Cannot connect to database`
- Verifica que MySQL esté corriendo
- Verifica la `DATABASE_URL` en el archivo `.env`
- Verifica que la base de datos exista

### Error: `Prisma client not generated`
```bash
cd backend && npm run prisma:generate
```

### Error: `Port 3000 already in use`
```bash
# Cambia el puerto en backend/.env
PORT=3001
```

### Error en Vite: `VITE_API_URL not defined`
- Asegúrate de que `frontend/.env` exista y tenga la variable correcta
- Reinicia el servidor de Vite

### El seed falla con error de conexión
- Verifica que la base de datos esté corriendo
- Verifica las migraciones: `npm run prisma:migrate`

---

## Seguridad

- Las contraseñas se almacenan con **bcrypt** (nunca en texto plano)
- La autenticación usa **JWT** con expiración de 8 horas
- Todos los endpoints (excepto login) requieren autenticación
- Las variables sensibles van en `.env` (nunca en Git)
- CORS configurado para aceptar solo el frontend autorizado

---

## Licencia

Proyecto personal. Uso privado.
