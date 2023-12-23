# Sets up an image capable of assembling oracles-disasm using wla-dx, and the
# golang randomizer
FROM golang:1.21-alpine

RUN apk update
RUN apk add build-base cmake bash git python3 py3-yaml go

# Checkout wla-dx
RUN git clone --branch v9.12 --depth 1 https://github.com/vhelin/wla-dx
WORKDIR wla-dx

# Build wla-dx
RUN mkdir build && cd build && cmake .. && cmake --build . -t wla-gb -t wlalink --config Release

# Copy binaries to path
RUN cp build/binaries/wla-gb build/binaries/wlalink /usr/local/bin/

# Create new user
#RUN groupadd -r myuser && useradd -r -g myuser myuser
#RUN chown -R myuser:myuser /mnt 
#USER myuser

# golang needs to access "/.cache" as we'll be using a fake user without a home
# directory.
RUN mkdir /.cache && chmod 777 /.cache

# This will make it easier to run complex commands with "docker run"
ENTRYPOINT [ "/bin/sh", "-c" ]

# Mount stuff in /mnt when you want to build things.
# Remember to use "--user $(id -u)" to ensure permissions are correct.
WORKDIR /mnt
