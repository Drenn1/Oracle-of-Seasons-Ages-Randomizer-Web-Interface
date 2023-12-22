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

# --mount type=bind,src=$PWD/clonedir,dst=/site

[[ $? != 0 ]] && exit 1

docker start rando
