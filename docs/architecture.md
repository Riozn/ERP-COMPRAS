# Arquitectura del Backend

## Definicion arquitectonica

El backend esta organizado con una arquitectura Onion:

- `domain`: entidades de negocio, tipos y contratos de repositorio.
- `application`: casos de uso y reglas de orquestacion.
- `infrastructure`: TypeORM, PostgreSQL, JWT, correo y lectura de entorno.
- `presentation`: HTTP/REST, middlewares y validacion de entrada.

### Justificacion

1. Separa reglas de negocio de detalles tecnicos.
2. Permite cambiar Express, TypeORM o nodemailer sin tocar el dominio.
3. Facilita pruebas unitarias con dobles de repositorio, mailer y tokens.
4. Encaja bien con un ERP, donde los modulos crecen por verticales.

## Patrones aplicados

- Repository: para aislar acceso a datos.
- Unit of Work: respaldado por TypeORM cuando se agrupan operaciones atomicas.
- Onion: como estructura principal.
- CQRS parcial: lectura y escritura separadas por casos de uso, sin forzar una capa CQRS completa todavia.

## Flujo de peticion

`HTTP -> route -> application service -> repository interface -> TypeORM/PostgreSQL`

## Entorno

El backend carga primero el `.env` raiz y usa `.env.example` como referencia para variables esperadas.

## Autenticacion

- JWT con `jose`
- Refresh tokens persistidos
- 2FA por email con challenge temporal
- CORS restringido por lista de origenes
