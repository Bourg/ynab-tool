FROM node:22

WORKDIR /build

COPY package.json .
COPY package-lock.json .
COPY prisma prisma
RUN npm ci

COPY tsconfig.json .
COPY app.config.ts .
COPY app app


RUN npm run build

ENTRYPOINT ["npm", "run", "start"]