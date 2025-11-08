# Configuración de Base de Datos (Gratis) y Migraciones

Este proyecto usa Prisma con PostgreSQL. La opción más simple y gratuita es Supabase (Postgres + Storage).

## 1) Crear la base de datos en Supabase
- Ve a https://supabase.com/ y crea un proyecto.
- Define una contraseña para Postgres (guárdala).
- Si ya existe y no la recuerdas: Settings > Database > Reset Database Password.

Datos que necesitas:
- Project ref (lo verás en la URL o en Project Settings)
- Host de DB: `db.<project-ref>.supabase.co`
- Contraseña de la DB (postgres)

## 2) Variables de entorno en `.env.local`
Usa la URL de pooler (recomendada para serverless y estable en local):

```
DATABASE_URL="postgresql://postgres:TU_PASSWORD@db.TU_PROJECT_REF.supabase.co:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1"
```

Notas:
- Si la contraseña tiene caracteres especiales, encódalos en URL (por ejemplo `@` -> `%40`).
- En este proyecto la autenticación admin usa por ahora contraseña en texto plano:
```
ADMIN_EMAIL="admin@tu-dominio.com"
ADMIN_PASSWORD="TuPasswordAdmin"
NEXTAUTH_SECRET="cadena-aleatoria-segura"
```

## 3) Generar Prisma y aplicar migraciones/seed
Desde PowerShell en la raíz del repo:

```powershell
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
```

Si estás desarrollando y necesitas crear una nueva migración:
```powershell
npx prisma migrate dev
```

## 4) Probar conexión rápidamente

Puedes usar el script incluido:
```powershell
npm run db:test
```
Deberías ver `DB OK` si la conexión es válida.

## 5) Problemas comunes
- `password authentication failed`: revisa usuario `postgres` y password; si tiene símbolos, usa URL encoding.
- Certificados/SSL: añade `sslmode=require` a la URL.
- Timeouts en Vercel: usa el pooler (puerto 6543) y `pgbouncer=true`.

## 6) Despliegue (Vercel)
Agrega en Project Settings > Environment Variables:
- `DATABASE_URL` (la misma URL del paso 2)
- `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- Otras: `NEXT_PUBLIC_WHATSAPP_PHONE`

Luego redeploy.
