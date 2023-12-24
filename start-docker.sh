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
# - The web interface docker image takes a clean git clone of the repository and
#   uses that. This means you need to commit your changes before docker will
#   pick it up. Might change this later. (Doesn't apply to disasm, randomizer)
# - Run this as whatever user owns the repository, not as root.
# - Running this multiple times will create a pileup of unused docker images.
#   I ought to do something about this. In the meantime run "docker prune"
#   periodically to free up disk space.

ASSEMBLER_IMAGE_NAME=rando-assembler
SERVER_IMAGE_NAME=rando-server
SERVER_CONTAINER_NAME=rando-server

sudo echo "Got superuser access" || exit 1

# Build the assembler image
sudo docker build -t $ASSEMBLER_IMAGE_NAME docker-assembler/ || exit 1

# Build the disassembly with the assembler image
sudo docker run --rm --user $(id -u) --mount type=bind,src=$PWD/oracles-randomizer-ng/oracles-disasm,dst=/mnt\
    $ASSEMBLER_IMAGE_NAME "make" || exit 1

# Build the randomizer with the assembler image
sudo docker run --rm --user $(id -u) --mount type=bind,src=$PWD,dst=/mnt\
    $ASSEMBLER_IMAGE_NAME "cd oracles-randomizer-ng && go generate && go build" || exit 1

# Clone repository to ensure that everything is clean for docker (no untracked files)
rm -Rf clonedir 2>/dev/null
mkdir -p clonedir
git clone . clonedir || exit 1
rm -Rf clonedir/.git || exit 1

# Build docker image
sudo docker build -t $SERVER_IMAGE_NAME . || exit 1

rm -Rf clonedir || exit 1

# Remove docker container if it exists already
sudo docker stop $SERVER_CONTAINER_NAME 2>/dev/null
sudo docker rm $SERVER_CONTAINER_NAME 2>/dev/null

# Create new container mounting the cloned version of the repo
sudo docker create --name $SERVER_CONTAINER_NAME -p 80:3000 $SERVER_IMAGE_NAME || exit 1

sudo docker start $SERVER_CONTAINER_NAME
