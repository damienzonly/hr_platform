FROM node:16-alpine as builder

WORKDIR /build
COPY src src
COPY public public
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY yarn.lock yarn.lock
RUN yarn add serve
RUN yarn install && yarn build

FROM node:16-alpine

WORKDIR /app
COPY --from=builder /build/build /app/build
COPY --from=builder /build/node_modules /app/node_modules

CMD ["./node_modules/.bin/serve", "-s", "build"]