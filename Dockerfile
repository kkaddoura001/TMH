FROM node:18-slim

RUN npm install -g pnpm@10.33.0

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY lib/ lib/
COPY artifacts/ artifacts/
COPY scripts/ scripts/
COPY tsconfig.base.json tsconfig.json ./

RUN pnpm install --frozen-lockfile
RUN pnpm run build

EXPOSE 3000
CMD ["node", "artifacts/api-server/dist/index.cjs"]
