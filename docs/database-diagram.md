# Diagrama de Base de Datos

El esquema base se tomo de [bd.md](../bd.md). El siguiente diagrama resume las relaciones principales del modelo ERP.

```mermaid
erDiagram
  O_ROLES ||--o{ O_USUARIOS : asigna
  O_USUARIOS ||--o{ AUTH_REFRESH_TOKENS : emite
  O_USUARIOS ||--o{ AUTH_2FA_CODES : genera
  O_MONEDAS ||--o{ O_PROVEEDORES : usa
  O_MONEDAS ||--o{ COMPRAS_ENCABEZADO : usa
  O_MONEDAS ||--o{ O_ARTICULOS : referencia
  O_IMPUESTOS ||--o{ O_ARTICULOS : aplica
  O_GRUPOS_ARTICULO ||--o{ O_ARTICULOS : clasifica
  O_TIPOS_DOCUMENTO ||--o{ COMPRAS_ENCABEZADO : define
  O_ESTADOS_DOCUMENTO ||--o{ COMPRAS_ENCABEZADO : controla
  O_PROVEEDORES ||--o{ COMPRAS_ENCABEZADO : recibe
  O_USUARIOS ||--o{ COMPRAS_ENCABEZADO : crea
  COMPRAS_ENCABEZADO ||--o{ COMPRAS_DETALLE : contiene
  O_ARTICULOS ||--o{ COMPRAS_DETALLE : referencia
  O_ALMACENES ||--o{ COMPRAS_DETALLE : destino
  O_ALMACENES ||--o{ O_ARTICULO_ALMACEN : stock
  O_ARTICULOS ||--o{ O_ARTICULO_ALMACEN : stock
  COMPRAS_ENCABEZADO ||--o{ DIARIO_INVENTARIO : mueve
  O_ARTICULOS ||--o{ DIARIO_INVENTARIO : afecta
  O_ALMACENES ||--o{ DIARIO_INVENTARIO : registra
  O_USUARIOS ||--o{ DIARIO_INVENTARIO : ejecuta
  COMPRAS_ENCABEZADO ||--o{ CXP_CUENTAS_POR_PAGAR : origina
  O_PROVEEDORES ||--o{ CXP_CUENTAS_POR_PAGAR : debe
  CXP_CUENTAS_POR_PAGAR ||--o{ CXP_PAGOS_PROVEEDOR : liquida
  O_PROVEEDORES ||--o{ CXP_PAGOS_PROVEEDOR : recibe
  O_USUARIOS ||--o{ CXP_PAGOS_PROVEEDOR : registra
  O_USUARIOS ||--o{ AUDITORIA_EVENTOS : audita
```

## Tablas Principales

- Seguridad: `o_roles`, `o_usuarios`, `auth_refresh_tokens`, `auth_2fa_codes`
- Catalogos: `o_monedas`, `o_almacenes`, `o_impuestos`, `o_grupos_articulo`, `o_estados_documento`, `o_tipos_documento`
- Maestro: `o_proveedores`, `o_articulos`, `o_articulo_almacen`
- Compras: `compras_encabezado`, `compras_detalle`
- Inventario: `diario_inventario`
- Cuentas por pagar: `cxp_cuentas_por_pagar`, `cxp_pagos_proveedor`
- Auditoria: `auditoria_eventos`

## Implementacion

La definicion SQL base vive en `docker/postgres/init.sql` para levantar el esquema dentro de Docker.
