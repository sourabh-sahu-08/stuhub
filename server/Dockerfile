FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY server/package.json server/package.json
RUN npm install

FROM deps AS build
COPY server server
RUN npm run build --workspace server

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules node_modules
COPY --from=build /app/server/dist server/dist
COPY server/package.json server/package.json
EXPOSE 5000
CMD ["npm", "run", "start", "--workspace", "server"]
