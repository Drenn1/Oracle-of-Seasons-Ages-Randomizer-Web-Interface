# This script will:
# - Build the "assembler" docker image
# - Use the "assembler" image to assemble oracles-disasm and oracles-randomizer-ng
# - Build the web interface docker image, copying the compiled results into it
# - Run the web interface docker image on port 80
#
# Some notes:
# - It's on you to ensure that oracles-disasm and oracles-randomizer-ng are on
#   whatever commit they should be on to match the web interface (this can be
#   managed with submodules)
# - The web interface docker image takes a clean git clone of the repository and
#   uses that. This means you need to commit your changes before docker will
#   pick it up. Might change this later. (Doesn't apply to disasm, randomizer)

# Build the assembler image
docker build -t assembler docker-assembler/

# Build the disassembly with the assembler image
docker run --user $(id -u) --mount type=bind,src=$PWD/oracles-randomizer-ng/oracles-disasm,dst=/mnt assembler "make"

# Build the randomizer with the assembler image
docker run --user $(id -u) --mount type=bind,src=$PWD/oracles-randomizer-ng,dst=/mnt assembler "go generate; go build"

# Clone repository to ensure that everything is clean for docker (no untracked files)
rm -Rf clonedir 2>/dev/null
mkdir -p clonedir
git clone . clonedir || exit 1
rm -Rf clonedir/.git || exit 1

# Build docker image
docker build -t rando . || exit 1

# Remove docker container if it exists already
docker stop rando 2>/dev/null
docker rm rando 2>/dev/null

# Create new container mounting the cloned version of the repo
docker create --name rando -p 80:3000 rando

[[ $? != 0 ]] && exit 1

docker start rando
