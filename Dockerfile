FROM node:22-alpine
WORKDIR /app
COPY package.json server.mjs index.html manifest.webmanifest icon.svg sw.js ./
COPY src ./src
COPY backend ./backend
USER node
EXPOSE 4173
CMD ["node","server.mjs"]
