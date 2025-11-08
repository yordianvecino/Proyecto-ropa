# E-commerce de Ropa Cristiana

Proyecto base de e-commerce construido con Next.js 14, TypeScript, Tailwind CSS, Prisma, NextAuth y Stripe (opcional). Incluye flujo de pedido por WhatsApp.

## Scripts

- `npm run dev`: inicia el servidor de desarrollo
- `npm run build`: compila para producción
- `npm run start`: inicia el servidor en modo producción
- `npm run lint`: ejecuta el linter

## Requisitos

- Node.js 18+
- npm 9+

## Cómo iniciar

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Ejecuta el entorno de desarrollo:
   ```bash
   npm run dev
   ```
3. Abre http://localhost:3000

## Estructura

- `src/app` App Router de Next.js
- `src/components` Componentes UI (Hero, FeaturedProducts, Testimonials, Newsletter)
- `tailwind.config.ts` Configuración de Tailwind con paleta inspirada en tema cristiano

## Próximos pasos

- Header/Footer y navegación (listo)
- Carrito de compras con Context y persistencia local (listo)
- Modelado de datos con Prisma (productos, usuarios, pedidos) (añadido schema)
- Autenticación con NextAuth
- Integración con Stripe
- Panel de administración

## Autenticación (NextAuth)

Para proteger el panel de administración sin depender de la base de datos durante el desarrollo, se configuró un proveedor de credenciales (email/contraseña) con sesión JWT.

1. Crea variables de entorno en `.env`:

```ini
NEXTAUTH_SECRET="<cadena-aleatoria-segura>"
ADMIN_EMAIL="admin@tu-dominio.com"
ADMIN_PASSWORD_HASH="<bcrypt-hash>"
```

2. Genera un hash bcrypt para la contraseña del admin (PowerShell):

```powershell
node -e "(async()=>{const b=require('bcryptjs');const h=await b.hash(process.argv[1],10);console.log(h)})();" "TuContraseñaSegura123"
```

3. Inicia el dev server y accede a `/login` con el email/contraseña configurados. Al autenticarse, tendrás rol `ADMIN` y acceso a `/admin`.

La protección se realiza vía `middleware.ts` y sesiones JWT; cuando se integre Prisma + PrismaAdapter podrás migrar a usuarios persistidos si lo prefieres.

## Base de datos (Prisma + PostgreSQL)

1. Crea tu `.env` a partir de `.env.example` y completa `DATABASE_URL`:
   ```ini
   DATABASE_URL="postgresql://user:password@localhost:5432/proyecto_ropa?schema=public"
   ```
2. Genera cliente y ejecuta migraciones:
   ```powershell
   npm run prisma:generate
   npm run prisma:migrate
   ```
3. (Opcional) Datos de ejemplo:
   ```powershell
   npm run prisma:seed
   ```
4. Para inspeccionar la base de datos:
   ```powershell
   npm run prisma:studio
   ```

Nota: El frontend actual usa datos estáticos en Home. Puedes crear endpoints en `app/api` para leer productos desde la BD cuando esté lista.

## Carrito

- Botón “Agregar” en tarjetas de productos (Home y `/productos`).
- Página `/carrito` con listado, actualizar cantidades, eliminar y limpiar.
- Persistencia automática en `localStorage`.
 - Botón de “Enviar pedido por WhatsApp” que abre un chat con el resumen del carrito.

## Catálogo de productos

- Ruta: `/productos`
- Parámetros de consulta soportados:
   - `page` (número de página, por defecto 1)
   - `category` (slug de categoría)
   - `sort` (`newest` | `price-asc` | `price-desc`)

El listado usa Prisma si el cliente está disponible; si no, cae a datos de ejemplo para mantener el desarrollo operativo.

### Notas de Windows
- Si ves un error EPERM al construir (bloqueo en `.next/trace`), cierra procesos Node y elimina la carpeta `.next` antes de volver a compilar.

### Pedido por WhatsApp

El checkout principal se realiza por WhatsApp: el cliente abre un chat con un mensaje prellenado que incluye los productos, cantidades y subtotal.

1. Configura tu número en `.env` (E.164, sin signos):

```ini
NEXTPUBLIC_WHATSAPP_PHONE="573001234567"
```

2. En la página `/carrito`, el botón “Enviar pedido por WhatsApp” generará el mensaje y abrirá el chat en una nueva pestaña.

Notas:
- El helper `src/lib/whatsapp.ts` construye el mensaje (`buildWhatsAppMessage`) y la URL (`buildWhatsAppUrl`).
- Si no está configurado `NEXT_PUBLIC_WHATSAPP_PHONE`, se mostrará un error en el resumen del carrito.

## Pagos (Stripe) – opcional

Se añadió un flujo básico de Stripe Checkout, pero el flujo principal actual usa WhatsApp. Activa Stripe solo si lo necesitas:

- API: `POST /api/checkout` crea una sesión a partir del carrito (line_items con `price_data`).
- Cliente: en `/carrito`, puedes re-activar un botón “Pagar con Stripe” que llame a la API y redirija a Stripe si prefieres este método.
- Páginas de resultado: `/checkout/success` y `/checkout/cancel`.

Variables `.env` requeridas:

```ini
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_CURRENCY="USD" # o la moneda que uses (p.ej. COP)
```

Importante:
- Los precios se envían en centavos (coincide con el modelo de `Product.price`).
- Si `STRIPE_SECRET_KEY` no está definido, la API devolverá 501 con un mensaje indicando que falta la configuración.
