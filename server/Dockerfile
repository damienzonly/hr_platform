FROM node:16-alpine as builder

WORKDIR /build
COPY package.json package.json
COPY src src
COPY tsconfig.json tsconfig.json
COPY yarn.lock yarn.lock

RUN yarn install && yarn build

FROM node:16-alpine

WORKDIR /app
COPY --from=builder /build/node_modules /app/node_modules
COPY --from=builder /build/build /app/build

ENTRYPOINT [ "node", "build" ]