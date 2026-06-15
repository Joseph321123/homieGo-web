# homieGo-web

Frontend de HomieGo (plataforma tipo Airbnb). Aplicación React con Vite.

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git
- Repositorio [homieGo-api](https://github.com/Joseph321123/homieGo-api) corriendo (backend y base de datos)

No es necesario instalar Node.js en tu máquina si usas Docker.

## Configuración inicial

1. Clona el repositorio:

```bash
git clone https://github.com/Joseph321123/homieGo-web.git
cd homieGo-web
```

2. Crea tu archivo de entorno a partir de la plantilla:

```bash
copy .env.example .env
```

En macOS o Linux:

```bash
cp .env.example .env
```

3. Comparte el contenido de `.env` con tu compañera de forma privada (no subas `.env` a GitHub).

## Levantar el proyecto con Docker

Antes de iniciar el frontend, asegúrate de que la API esté corriendo en el repositorio `homieGo-api`:

```bash
cd homieGo-api
docker compose up --build -d
```

Luego, en este repositorio:

```bash
docker compose up --build
```

Para ejecutarlo en segundo plano:

```bash
docker compose up --build -d
```

Aplicación disponible en: http://localhost:5173

## Detener los contenedores

```bash
docker compose down
```

Esto solo detiene el frontend. La API y la base de datos se detienen desde el repositorio `homieGo-api`.

## Scripts npm (opcional, sin Docker)

Si prefieres correr el frontend directamente en tu máquina:

```bash
npm install
npm run dev
```

Necesitas Node.js 22+ y la API disponible en http://localhost:3000.

## Trabajo en equipo

Este repositorio es independiente del backend (`homieGo-api`). Flujo recomendado:

1. Levanta primero `homieGo-api` (PostgreSQL + API).
2. Levanta `homieGo-web` (este repositorio).
3. Trabaja en ramas compartidas (por ejemplo, `development`) y sincroniza cambios con GitHub.

Cada desarrolladora clona su propio repositorio y usa los mismos valores de `.env` compartidos por fuera de Git.

## Estructura del proyecto

```
homieGo-web/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   └── routes/
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## Variables de entorno

| Variable       | Descripción                                      |
|----------------|--------------------------------------------------|
| VITE_API_URL   | URL base de la API (default: http://localhost:3000) |

Las variables de Vite deben comenzar con `VITE_` para estar disponibles en el código del frontend.

## Comandos útiles

| Comando              | Descripción                          |
|----------------------|--------------------------------------|
| npm run dev          | Servidor de desarrollo (sin Docker)  |
| npm run build        | Build de producción                  |
| npm run preview      | Vista previa del build               |
| npm run lint         | Revisión con ESLint                  |
| npm run docker:up    | Levantar contenedor en segundo plano |
| npm run docker:down  | Detener contenedor                   |
