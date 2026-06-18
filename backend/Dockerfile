# --- Backend (Express) ---
FROM node:20-alpine

WORKDIR /app

# Najprej samo manifest, da izkoristimo Docker layer cache za odvisnosti.
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Nato izvorna koda.
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "index.js"]
