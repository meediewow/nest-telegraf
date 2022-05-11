## BUILD STAGE
FROM node:14-alpine as builder

RUN apk add --no-cache \
    python3 \
    g++ \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev 

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install canvas@2.8.0
RUN npm install && npm cache clean --force

ARG SERVICE_NAME

COPY . .

RUN npx nest build protobufs
RUN npx nest build ${SERVICE_NAME}

## RUN STAGE
FROM node:14-alpine

RUN apk add --no-cache \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev 

RUN apk add font-vollkorn font-misc-cyrillic font-mutt-misc font-screen-cyrillic font-winitzki-cyrillic font-cronyx-cyrillic

WORKDIR /home/node/app

ARG NODE_PORT
ENV PORT ${NODE_PORT}

ARG SERVICE_NAME
ENV SERVICE_NAME ${SERVICE_NAME}

COPY --from=builder --chown=1000 \
    /home/node/app/package*.json \
    /home/node/app/.env* \
    ./
COPY --from=builder --chown=1000 /home/node/app/node_modules ./node_modules
COPY --from=builder --chown=1000 /home/node/app/dist ./dist

EXPOSE ${NODE_PORT}

# 1000 == node
USER 1000

CMD node dist/apps/${SERVICE_NAME}/src/main
