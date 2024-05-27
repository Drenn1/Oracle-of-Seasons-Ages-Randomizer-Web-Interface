#!/usr/bin/env python3
# A simple script to verify that there is no mismatch between the music track
# listing in the disassembly and the music track listing in the webui.

import yaml, os

if os.path.basename(os.getcwd()) == 'scripts':
    os.chdir('..')

# Step 1: Read disassembly track list
with open('oracles-randomizer-ng/oracles-disasm/audio/meta/musicTracksCustom.txt', 'r') as file:
    lines = [line.strip() for line in file.readlines()]

# Step 2: Read webui track list
with open('client/public/music/customMusicTracks.yaml', 'r') as file:
    yaml_content = yaml.safe_load(file)

# Step 3: Compare the contents
yaml_keys = set(yaml_content.keys())
txt_keys = set(lines)

missing_in_txt = yaml_keys - txt_keys
missing_in_yaml = txt_keys - yaml_keys

if missing_in_txt:
    print("The following tracks from webui list are missing in disassembly list:")
    for key in missing_in_txt:
        print(key)
else:
    print("All tracks from webui list exist in disassembly list.")

if missing_in_yaml:
    print("The following tracks from disassembly list are missing in webui list:")
    for key in missing_in_yaml:
        print(key)
else:
    print("All tracks from disassembly list exist in webui list.")
