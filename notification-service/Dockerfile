FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN yarn install --production
COPY src/ ./src/
CMD ["node", "src/server.js"]
