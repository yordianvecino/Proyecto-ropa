-- Manual init SQL for Supabase (PostgreSQL)
-- Purpose: Create enums, tables, constraints and basic indexes matching prisma/schema.prisma
-- Safe to run multiple times: uses IF NOT EXISTS where possible

-- 1) Extensions (for gen_random_uuid)
create extension if not exists pgcrypto;

-- 2) Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'Role') then
    create type "Role" as enum ('ADMIN', 'CUSTOMER');
  end if;
  if not exists (select 1 from pg_type where typname = 'OrderStatus') then
    create type "OrderStatus" as enum ('PENDING', 'PAID', 'SHIPPED', 'CANCELLED');
  end if;
end$$;

-- 3) Tables
create table if not exists "User" (
  id        text primary key default gen_random_uuid()::text,
  name      text,
  email     text not null unique,
  image     text,
  role      "Role" not null default 'CUSTOMER',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "Category" (
  id        text primary key default gen_random_uuid()::text,
  name      text not null unique,
  slug      text not null unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "Product" (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  slug        text not null unique,
  description text,
  price       integer not null,
  "imageUrl" text,
  "categoryId" text,
  active      boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "Product_categoryId_fkey" foreign key ("categoryId") references "Category"(id) on delete set null on update cascade
);

create table if not exists "Order" (
  id          text primary key default gen_random_uuid()::text,
  "userId"    text not null,
  status      "OrderStatus" not null default 'PENDING',
  total       integer not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "Order_userId_fkey" foreign key ("userId") references "User"(id) on delete restrict on update cascade
);

create table if not exists "OrderItem" (
  id          text primary key default gen_random_uuid()::text,
  "orderId"   text not null,
  "productId" text not null,
  quantity    integer not null default 1,
  "unitPrice" integer not null,
  constraint "OrderItem_orderId_fkey" foreign key ("orderId") references "Order"(id) on delete cascade on update cascade,
  constraint "OrderItem_productId_fkey" foreign key ("productId") references "Product"(id) on delete restrict on update cascade
);

-- 4) Helpful indexes (beyond uniques already defined)
create index if not exists idx_product_category on "Product"("categoryId");
create index if not exists idx_order_user on "Order"("userId");
create index if not exists idx_orderitem_order on "OrderItem"("orderId");
create index if not exists idx_orderitem_product on "OrderItem"("productId");

-- 5) Touch updatedAt on update (optional)
-- NOTE: Prisma @updatedAt updates at application level. If you prefer DB-side auto-update, uncomment triggers below.
-- do $$
-- begin
--   if not exists (select 1 from pg_proc where proname = 'set_updated_at') then
--     create or replace function set_updated_at() returns trigger as $$
--     begin
--       new."updatedAt" = now();
--       return new;
--     end;
--     $$ language plpgsql;
--   end if;
-- end$$;
--
-- create trigger t_user_updated_at before update on "User" for each row execute procedure set_updated_at();
-- create trigger t_category_updated_at before update on "Category" for each row execute procedure set_updated_at();
-- create trigger t_product_updated_at before update on "Product" for each row execute procedure set_updated_at();
-- create trigger t_order_updated_at before update on "Order" for each row execute procedure set_updated_at();
