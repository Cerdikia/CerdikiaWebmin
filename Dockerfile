# FROM node:22.12.0 AS builder

# WORKDIR /app

# # Ambil argumen build
# ARG VITE_API_URL
# ENV VITE_API_URL=$VITE_API_URL

# # Copy dependencies
# COPY package*.json ./
# RUN npm install

# # Copy all source code
# COPY . .
# RUN npm run build

# # Production image
# FROM nginx:alpine

# COPY --from=builder /app/dist /usr/share/nginx/html

# # Salin konfigurasi nginx
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

# =========================================
FROM node:22.12.0 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Stage 2: Production Image ---
FROM nginx:alpine

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Salin konfigurasi nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Tambahkan script startup untuk generate `env.js`
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
