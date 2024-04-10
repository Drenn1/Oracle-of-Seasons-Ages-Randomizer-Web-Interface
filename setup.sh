#!/usr/bin/env bash
#
# This will build oracles-randomizer-ng and the baseroms from oracles-disasm.
# Assumes you've run "build-docker.sh" at least once to generate the docker
# containers that this uses.
#
# This does not attempt to check out the "correct" version of either repository,
# it simply works with whatever it's given.

ASSEMBLER_IMAGE_BASE=rando-assembler-base
ASSEMBLER_IMAGE=rando-assembler
SERVER_IMAGE=rando-server

ASSEMBLER_CONTAINER=rando-assembler-container
SERVER_CONTAINER=rando-server-container

MOUNT_OPTIONS_A="--mount type=bind,src=$PWD,dst=/site"
MOUNT_OPTIONS_B="--mount type=bind,src=$PWD,dst=/mnt"

THREADS=8

PORT=80

RED='\033[1;31m'
NC='\033[0m'

function help() {
    echo "Usage: $0 [build-docker | build-rando | start | stop]"
    echo
    echo "Tasks should be run in the following order:"
    echo
    echo "build-docker: Build docker images used for the following operations."
    echo
    echo "build-rando: Build oracles-randomizer-ng and oracles-disasm."
    echo
    echo "start: Start the webui server."
    echo
    echo "stop: Stop the webui server."
}

function printStage() {
    echo -e "\n${RED}$1${NC}"
}

if [[ $# < 1 ]]; then
    help
    exit 1
fi

case $1 in
    build-docker)
        echo "Requesting superuser access..."
        sudo echo "Got superuser access" || exit 1

        printStage "Removing existing containers..."
        sudo docker stop $ASSEMBLER_CONTAINER 2>/dev/null
        sudo docker rm $ASSEMBLER_CONTAINER 2>/dev/null
        sudo docker stop $SERVER_CONTAINER 2>/dev/null
        sudo docker rm $SERVER_CONTAINER 2>/dev/null

        printStage "Building assembler image..."
        sudo docker build -t $ASSEMBLER_IMAGE_BASE docker-assembler/ || exit 1

        printStage "Installing golang dependencies..."
        sudo docker run --user $(id -u) --name $ASSEMBLER_CONTAINER $MOUNT_OPTIONS_B \
            $ASSEMBLER_IMAGE_BASE "cd oracles-randomizer-ng && go generate" || exit 1
        sudo docker commit $ASSEMBLER_CONTAINER $ASSEMBLER_IMAGE || exit 1

        printStage "Building server image..."
        sudo docker build --build-arg "UID=$(id -u)" --build-arg "GID=$(id -g)" \
            -t $SERVER_IMAGE . || exit 1

        printStage "Installing npm dependencies..."
        sudo docker run $MOUNT_OPTIONS_A --user $(id -u) $SERVER_IMAGE \
            npm run install-both || exit 1

        printStage "Creating server container..."
        sudo docker create --name $SERVER_CONTAINER \
            $MOUNT_OPTIONS_A -p $PORT:3000 $SERVER_IMAGE || exit 1

        printStage "Docker images built successfully."
        ;;

    build-rando)
        echo "Requesting superuser access..."
        sudo echo "Got superuser access" || exit 1

        printStage "Building disassembly..."
        sudo docker run --user $(id -u) \
            --mount type=bind,src=$PWD/oracles-randomizer-ng/oracles-disasm,dst=/mnt \
            $ASSEMBLER_IMAGE "MAKEFLAGS=-j${THREADS} make" || exit 1

        printStage "Building randomizer..."
        sudo docker run --user $(id -u) --mount type=bind,src=$PWD,dst=/mnt \
            $ASSEMBLER_IMAGE "cd oracles-randomizer-ng && go generate && go build" || exit 1

        printStage "Randomizer build complete!"
        echo "You should be able to run the server now."
        ;;

    start)
        echo "Requesting superuser access..."
        sudo echo "Got superuser access" || exit 1

        printStage "Starting server..."
        sudo docker start $SERVER_CONTAINER || exit 1

        printStage "Server should now be running on port $PORT."
        ;;

    stop)
        echo "Requesting superuser access..."
        sudo echo "Got superuser access" || exit 1

        printStage "Stopping server..."
        sudo docker stop $SERVER_CONTAINER || exit 1

        printStage "Server should now be stopped."
        ;;

    *)
        echo -e "Unrecognized command: \"$1\"."
        help
        ;;
esac
