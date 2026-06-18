# --- Frontend (React + Vite) ---

# 1) Build stopnja
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

# Naslov backenda se vgradi v build (Vite env je build-time).
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# 2) Strežba prek nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
