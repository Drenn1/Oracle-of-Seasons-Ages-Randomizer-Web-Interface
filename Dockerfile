# Docker image to run the server. oracles-randomizer-ng and the base roms must
# be built before this.

FROM alpine:3.19

RUN apk update
RUN apk add nodejs npm

# No good way to install mongo on alpine 3.19 other than to use an old version...
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.9/main' >> /etc/apk/repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.9/community' >> /etc/apk/repositories
RUN apk add mongodb yaml-cpp=0.6.2-r2

# Mongo setup
RUN mkdir -p /data/db

# Using "concurrently" to run client & server simultaneously
RUN npm i -g concurrently

# Need non-root user to use node
RUN /usr/sbin/adduser nonroot -h /home/nonroot -s /bin/sh -D

# Set up /site directory where repo will be mounted
RUN mkdir /site
RUN chown -R nonroot /site
WORKDIR /site

USER root

# Run mongod, node client, and node server simultaneously
CMD [ "concurrently", "-n", "mongod,client,server",\
  "mongod", \
  "su nonroot -c \"npm run client\"", \
  "su nonroot -c \"npm run server\""]
