FROM node:18-alpine

RUN apk add wine
RUN apk add mono --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing

RUN mkdir -p /src
WORKDIR /src

ENTRYPOINT /bin/sh
