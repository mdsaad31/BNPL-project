# ============================================================
# TrustPay Protocol — Docker Configuration
# Multi-service: Hardhat node + Frontend (Nginx)
# ============================================================

# ── Stage 1: Build Frontend ─────────────────────────────────
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Build & Prepare Contracts ──────────────────────
FROM node:22-alpine AS contracts-build

WORKDIR /app/contracts
COPY contracts/package.json contracts/package-lock.json* ./
RUN npm ci
COPY contracts/ ./
RUN npx hardhat compile

# ── Stage 3: Hardhat Node (runtime) ─────────────────────────
FROM node:22-alpine AS hardhat-node

WORKDIR /app/contracts
COPY --from=contracts-build /app/contracts ./

# Healthcheck script for JSON-RPC
RUN printf '#!/bin/sh\nwget -qO- --post-data='\''{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'\'' --header="Content-Type: application/json" http://127.0.0.1:8545 > /dev/null 2>&1\n' > /healthcheck.sh && chmod +x /healthcheck.sh

EXPOSE 8545
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]

# ── Stage 4: Frontend Nginx (runtime) ───────────────────────
FROM nginx:alpine AS frontend

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend from stage 1
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
