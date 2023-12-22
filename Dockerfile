FROM alpine:3.19

RUN apk update
RUN apk add nodejs npm

# No good way to install mongo on alpine 3.19 other than to use an old version...
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.9/main' >> /etc/apk/repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.9/community' >> /etc/apk/repositories
RUN apk add mongodb yaml-cpp=0.6.2-r2

# Mongo setup
RUN mkdir -p /data/db
RUN mongod &

# Using "concurrently" to run client & server simultaneously
RUN npm i -g concurrently

# Need non-root user to use node
RUN /usr/sbin/adduser nonroot -h /home/nonroot -s /bin/sh -D

# Copy clean clone of git repository to docker
COPY clonedir /site
COPY server/base/oracles-randomizer server/base/oo*.blob /site/server/base/
RUN chown -R nonroot /site
USER nonroot

WORKDIR /site

# Install node dependencies
RUN npm run install-both

# Save status of volume (TODO: mongodb)
VOLUME /site

CMD [ "npm", "run", "both" ]
