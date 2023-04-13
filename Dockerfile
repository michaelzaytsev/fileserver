FROM node:18.15.0-alpine as build
RUN apk update && apk add dumb-init
WORKDIR /usr/src/app
COPY . .
RUN npm ci
RUN npm run build

FROM node:18.15.0-bullseye
ENV NODE_ENV production
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/dist ./
COPY --chown=node:node ./package*.json ./
RUN npm ci --omit=dev
RUN mkdir uploads
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
