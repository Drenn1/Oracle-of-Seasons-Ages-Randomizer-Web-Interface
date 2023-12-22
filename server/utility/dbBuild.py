import threading
import os
import subprocess
import time
import platform
from Naked.toolshed.shell import execute_js

if platform.system() == "Windows":
    oracles_randomizer_exe = "../base/oracles-randomizer.exe"
else:
    oracles_randomizer_exe = "../base/oracles-randomizer"


FNULL = open(os.devnull, 'w')
start = time.time()

# -LIVE will send to a live server, address stored in Environment Variable
#nodeArgs = '-{}'.format(input('Local or Live host?\n').upper())
#print(nodeArgs)
nodeArgs = "-local"

#romAsk = input("Make roms? (Y)es or (N)o\n").upper()
#makeroms = romAsk == "Y" or romAsk == "YES"
#print(makeroms)
makeroms = True


# can generate 1000 roms simultaneously faster than making as needed and checking if enough has been made to
# determine if enough data to determine all needed addresses for seeds
# easier time with threading with python and easier time with mongodb with nodejs ("pip install Naked" to
# run node scripts from within python)
def threadedfunc(sargs, game):
    subprocess.run(sargs, cwd=game, stdout=FNULL, stderr=subprocess.STDOUT)


def makeseeds(margs, game):
    for y in range(15):
        threaded = threading.Thread(target=threadedfunc, args=(margs, game))
        threaded.start()


# makes 500 seeds, 15 at a time = 33 batches
if makeroms:
    print("Generating Seasons roms")
    for seasons in range(50):
        args = [oracles_randomizer_exe]
        if seasons > 10:
            args.append('-hard')
        if seasons > 20:
            args.append('-treewarp')
            args.append('-portals')
        if seasons > 30:
            args.append('-dungeons')
        if seasons > 40:
            args.append('-race')
        
        args.append('-noui')
        args.append('../base/oos.blob')
        makeseeds(args, "seasons")
        while threading.active_count() > 1:
            pass
        print("Seasons batch {} done".format(seasons + 1))

    print("Generating Ages roms")
    for ages in range(50):
        args = [oracles_randomizer_exe]
        if ages > 10:
            args.append('-hard')
        if ages > 20:
            args.append('-treewarp')
        if ages > 30:
            args.append('-dungeons')
        if ages > 40:
            args.append('-race')
        while threading.active_count() > 1:
            pass
        args.append('-noui')
        args.append('../base/ooa.blob')
        makeseeds(args, "ages")
        print("Ages batch {} done".format(ages + 1))
    print('Seed generation time: {} seconds'.format(time.time() - start))

seasonssuccess = execute_js('ooscompare.js', nodeArgs)
agessuccess = execute_js('ooacompare.js', nodeArgs)

while threading.active_count() > 1:
    pass

print('Process complete after {} seconds'.format(time.time() - start))
