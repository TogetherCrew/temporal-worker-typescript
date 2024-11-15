FROM node:20-bullseye AS builder

# For better cache utilization, copy package.json and lock file first and install the dependencies before copying the
# rest of the application and building.
WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .

RUN npm run build

FROM node:20-bullseye AS production

WORKDIR /app

COPY package*.json .

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/worker.js"]