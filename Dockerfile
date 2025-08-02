FROM node:20.18.0-slim AS builder

LABEL fly_launch_runtime="NestJS"
ENV NODE_ENV build

WORKDIR /app
COPY . /app

ARG YARN_VERSION=1.22.21
RUN yarn install \
    && yarn build \
    && yarn cache clean 


FROM node:20.18.0-slim

ENV NODE_ENV production

WORKDIR /app

COPY --from=builder /app/package*.json /app
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist/ /app/dist


EXPOSE 8080
CMD [ "node", "dist/main.js" ]