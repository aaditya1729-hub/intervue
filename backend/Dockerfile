FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install --production=false || yarn install || pnpm install

COPY . .

ENV NODE_ENV=production
EXPOSE 4000
CMD ["npm", "start"]