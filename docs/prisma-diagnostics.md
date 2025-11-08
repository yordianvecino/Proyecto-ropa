# Diagnóstico Prisma en Windows + Supabase

## 1. Variables de Entorno Clave
Asegúrate de definir en `.env` (no solo `.env.local`):
- `DATABASE_URL` (cadena completa de conexión postgres Supabase)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (para fallback Supabase JS)

Verifica presencia (sin valores) con endpoint `/api/health/env`.

## 2. Comandos Básicos
```bash
# Generar cliente
yarn prisma generate
# Aplicar migraciones (dev)
yarn prisma migrate dev --name init
# Ver esquema remoto
yarn prisma db pull
# Abrir Prisma Studio
yarn prisma studio
```

## 3. Test de Conexión Rápido
```bash
yarn db:test
```
Revisa salida: errores comunes
- `ECONNREFUSED` / DNS: firewall o cadena incorrecta.
- `ETIMEDOUT`: red bloqueada.
- `P1000`: credenciales inválidas.

## 4. Problema EPERM en Windows
Síntomas: `EPERM: operation not permitted, unlink ... swc ...`
Causas frecuentes:
- Antivirus / Defender bloqueando eliminación de binarios.
- Carpeta en uso por otro proceso (`next dev`).
- PnP + binarios nativos.

### Soluciones
1. Parar procesos previos (`Ctrl+C` en terminales que corran `dev`).
2. Excluir la carpeta del proyecto en Antivirus/Defender.
3. Cambiar a `node_modules` (hecho en `.yarnrc.yml` con `nodeLinker: node-modules`).
4. Ejecutar terminal como Administrador si persiste.
5. Borrar cache parcial:
```bash
rd /s /q .yarn\unplugged
rd /s /q .yarn\cache
yarn install --force
```

## 5. Columna `featured`
Si falta se agregó migración en `sql/migrations/2025-11-08-add-featured.sql`.
Puedes aplicarla manualmente en Supabase SQL Editor. Luego ejecutar:
```bash
yarn prisma db pull
yarn prisma generate
```

## 6. Actualizar Schema
Tras agregar columna, verificar en `prisma/schema.prisma` que el modelo `Product` contiene:
```prisma
featured Boolean @default(false)
```
Si no, editar y correr `yarn prisma generate`.

## 7. Validar Fallback Supabase
Si Prisma entrega 0 productos o lanza error, el código usa Supabase. Revisa logs o añade `console.error` temporal para diferenciar.

## 8. Checklist Rápido
- [ ] Endpoint `/api/health/env` muestra todas las env como `true`.
- [ ] Migración SQL ejecutada (columna featured presente).
- [ ] `yarn prisma generate` sin errores.
- [ ] `yarn build` exitoso.
- [ ] Productos destacados aparecen tras marcar `Destacado` en admin.

## 9. Problemas Persistentes
Si EPERM continúa:
- Ver si otro proceso mantiene handle: `tasklist | findstr node`
- Reiniciar máquina (libera locks nativos).
- Cambiar temporalmente versión Node a LTS más reciente (>=20) usando nvm/windows para probar.

## 10. Registro de Errores
Incluye en issues cualquier salida de:
```bash
yarn prisma generate --debug
yarn build
```
Copiar solo bloques relevantes (stacktrace y mensaje) para análisis.

---
Esta guía te asegura reproducir y resolver la mayoría de problemas de Prisma y binarios Next en Windows con Supabase.
