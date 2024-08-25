# OOS/A Randomizer Web Interface

This is a web interface for
[oracles-randomizer-ng](https://github.com/Stewmath/oracles-randomizer-ng).
Hosted online [here](https://oosarando.zeldahacking.net).


## Running the Web Interface

You can run this on a linux machine, either in docker or directly on the host
machine. Docker is recommended due to the tangled web of dependencies needed to
build everything.


### With docker

Ensure docker is installed (obviously). This should be the only dependency.

Download the repository:

```
git clone --recursive https://github.com/Stewmath/oracles-randomizer-ng-webui
```

Or if you've already downloaded it, ensure that all submodules are checked out:

```
git submodule update --init --recursive
```

Place the clean roms "ages_clean.gbc" and "seasons_clean.gbc" in the "roms/" directory.

Then run the following commands:

```
./setup.sh build-docker      # Build docker containers, should only need to do this once
./setup.sh build-rando-clean # Build oracles-randomizer-ng and base roms
./setup.sh start             # Run the webui on port 80
```

Do not run the commands as root, npm will complain (sudo should be fine).

You can view the server logs with:

```
sudo docker logs rando-server-container
```

Stop the server with:

```
./setup.sh stop
```

Over time, you may get a pileup of unused docker images. You may want to free up
some disk space with:

```
sudo docker image prune
sudo docker container prune
```


### Without docker

Aside from figuring out how to compile oracles-randomizer-ng and oracles-disasm,
you'll need to install npm and mongod to run the webui.

To install the back and front end dependencies:

```
npm run install-both
```

Also install "concurrently":

```
sudo npm i -g concurrently
```

Then run the server:

```
npm run dev
```
