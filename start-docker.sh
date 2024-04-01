# This script will:
# - Build the "assembler" docker image
# - Use the "assembler" image to assemble oracles-disasm and oracles-randomizer-ng
# - Build the web server docker image, copying the compiled results into it
# - Run the web server docker image on port 80
#
# Some notes:
# - It's on you to ensure that oracles-disasm and oracles-randomizer-ng are on
#   whatever commit they should be on to match the web interface (this can be
#   managed with submodules)
# - Run this as whatever user owns the repository, not as root.
# - Running this multiple times will create a pileup of unused docker images.
#   I ought to do something about this. In the meantime run "docker prune"
#   periodically to free up disk space.

ASSEMBLER_IMAGE_NAME=rando-assembler
SERVER_IMAGE_NAME=rando-server
SERVER_CONTAINER_NAME=rando-server

sudo echo "Got superuser access" || exit 1

echo "Build assembler image..."
sudo docker build -t $ASSEMBLER_IMAGE_NAME docker-assembler/ || exit 1

echo "Building disassembly..."
sudo docker run --rm --user $(id -u) --mount type=bind,src=$PWD/oracles-randomizer-ng/oracles-disasm,dst=/mnt\
    $ASSEMBLER_IMAGE_NAME "make" || exit 1

echo "Building randomizer..."
sudo docker run --rm --user $(id -u) --mount type=bind,src=$PWD,dst=/mnt\
    $ASSEMBLER_IMAGE_NAME "cd oracles-randomizer-ng && go generate && go build" || exit 1

echo "Building server image..."
sudo docker build -t $SERVER_IMAGE_NAME . || exit 1

# Remove docker container if it exists already
sudo docker stop $SERVER_CONTAINER_NAME 2>/dev/null
sudo docker rm $SERVER_CONTAINER_NAME 2>/dev/null

echo "Creating server image..."
MOUNT_OPTIONS="--mount type=bind,src=$PWD,dst=/site"
sudo docker create --name $SERVER_CONTAINER_NAME $MOUNT_OPTIONS -p 80:3000 $SERVER_IMAGE_NAME || exit 1

echo "Installing npm dependencies..."
sudo docker run $MOUNT_OPTIONS --user 1000 $SERVER_CONTAINER_NAME npm run install-both || exit 1

# Run server
echo "Starting server image..."
sudo docker start $SERVER_CONTAINER_NAME
