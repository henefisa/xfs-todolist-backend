FROM node:14-alpine as base

WORKDIR /server
COPY package.json yarn.lock ./
RUN yarn install

FROM base as dev
ENV NODE_ENV=development
COPY . .
CMD ["nodemon", "./index.ts"]
