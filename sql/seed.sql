-- Manual seed equivalent to prisma/seed.js
-- Run after init.sql

insert into "Category" (id, name, slug)
select gen_random_uuid()::text, c.name, c.slug
from (values
  ('Camisetas','camisetas'),
  ('Sudaderas','sudaderas'),
  ('Accesorios','accesorios'),
  ('Vestidos','vestidos')
) as c(name, slug)
where not exists (select 1 from "Category" existing where existing.slug = c.slug);

-- Insert sample product referencing 'camisetas'
with camisetas as (
  select id from "Category" where slug = 'camisetas'
)
insert into "Product" (id, name, slug, description, price, "imageUrl", "categoryId", active)
select gen_random_uuid()::text,
       'Camiseta ''Fe, Esperanza, Amor''',
       'fe-esperanza-amor',
       'Camiseta con mensaje inspirado en 1 Corintios 13:13',
       2599,
       null,
       camisetas.id,
       true
from camisetas
where not exists (select 1 from "Product" p where p.slug = 'fe-esperanza-amor');
