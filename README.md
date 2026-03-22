# DairyTools Backend — NestJS + PostgreSQL

## Requisitos
- Node.js 18+
- PostgreSQL 14+

## Instalación

```bash
npm install
```

## Configuración

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de PostgreSQL y genera claves JWT:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Ejecuta dos veces: una para JWT_ACCESS_SECRET y otra para JWT_REFRESH_SECRET
```

## Base de datos

Crea la base de datos en PostgreSQL:

```bash
psql -U postgres -c "CREATE DATABASE dairytools;"
psql -U postgres -d dairytools -f database/init.sql
```

## Ejecutar

```bash
# Desarrollo (watch mode)
npm run start:dev

# Producción
npm run build
npm run start:prod
```

La API corre en: `http://localhost:3001`

## Endpoints de autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/login | Iniciar sesión |
| POST | /auth/logout | Cerrar sesión |
| POST | /auth/refresh | Renovar token |
| GET | /auth/perfil | Datos del usuario actual |

## Usuarios de prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@dairytools.com | admin123 | superadmin |
| supervisor@dairytools.com | super123 | supervisor |
| operador@dairytools.com | oper123 | operador |