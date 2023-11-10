FROM alpine:latest

RUN apk add --no-cache nodejs npm

ENV PORT=5000

WORKDIR /docker

COPY . /docker

RUN npm install 

EXPOSE 5000

ENTRYPOINT [ "node" ]

CMD [ "server.js" ]