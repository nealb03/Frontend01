# -------------------------------------------------------
# STAGE 1 – Build the static frontend (Vite / React)
# -------------------------------------------------------
FROM node:20-bullseye-slim AS build
WORKDIR /app

# Environment tweaks / caching
ENV ROLLUP_USE_NATIVE=false
ENV npm_config_cache=/tmp/npm-cache

# --- Install dependencies ---
COPY package*.json ./
RUN npm ci --no-optional

# --- Copy source and build ---
COPY . .
RUN npm run build


# -------------------------------------------------------
# STAGE 2 – Runtime (NGINX static server)
# -------------------------------------------------------
FROM nginx:1.25-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Clean out any default or stray content
RUN rm -rf /etc/nginx/conf.d/* \
           /usr/share/nginx/html/* \
           /app/* \
           /tmp/*

# --- Copy the built SPA only ---
COPY --from=build /app/dist/ ./

# --- Copy the custom NGINX configuration ---
COPY etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# --- Expose port & health‑check ---
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# --- Start NGINX in foreground ---
CMD ["nginx", "-g", "daemon off;"]