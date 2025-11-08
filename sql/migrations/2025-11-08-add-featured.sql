-- Migración para agregar columna 'featured' a Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "featured" boolean NOT NULL DEFAULT false;

-- Índice opcional para consultas de destacados
CREATE INDEX IF NOT EXISTS "idx_product_featured_active" ON "Product"("featured", "active");
