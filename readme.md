# OOS/A Randomizer Web Interface

This is a web interface for the oracles randomizer originally written by
Jaysee97. The randomizer itself was written by Jangler and Stewmat.


## Running the Web Interface

Originally this web interface could run on either windows or linux, but
currently only linux is supported. If you want to try it on windows you're on
your own.

This can run either in docker or directly on the host machine. If you're not
doing any development, docker is recommended.


### With docker

Ensure docker is installed (obviously). This should be the only dependency.

Start the server with:

```
sudo ./start-docker.sh
```

This will create a docker image based on the latest commit in the local
repository and expose the randomizer UI on port 80. That's it!


### Without docker

You will need [Nodejs](https://nodejs.org/en/) for the back and front end dependencies:

```
$ npm run install-both
```

#### Set up Base entries in DB
You will need [Python](https://www.python.org/) for the db setup script, it is
CPU intensive and takes roughly 10 minutes to run at this time. You will also
need the module Naked installed. You will need to have your randomizer
executable and vanilla roms renamed to OOA.blob and OOS.blob, as they are not
provided in this repo.

```
$ pip install Naked
```

You will need to have mongoDB installed and running:

```
# mongod
```

Then in the utility directory

```
On Linux/MacOSX
$ mkdir ages seasons
$ python3 dbBuild.py
$ local
$ y
  -- or --
On Windows Command Prompt
$ mkdir ages seasons
$ python dbBuild.py
$ local
$ y
```


#### Running the Web Interface (without docker)

After all the npm modules are installed, front end compiled, and db entries created, go to the project root directory:

With nodemon installed globally `npm i -g nodemon` (useful for live reload on edits on server side scripts)
```
$ npm run dev
```

Without nodemon install to run only, and manually restart after edits on server side
```
$ npm run both
```

## Future Goals
* Plandomizer UI
* Handle sprite selection options via backend or external json list
