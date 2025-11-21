# =========================
# 1) Build Angular App
# =========================
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy project and build
COPY . .
RUN npm run build --prod

# =========================
# 2) Serve with Nginx
# =========================
FROM nginx:alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular dist folder
COPY --from=build /app/dist/webguardianf/ /usr/share/nginx/html/
COPY default.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
