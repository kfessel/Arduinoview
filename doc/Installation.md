# Installation

## Preconditions

* Arduino IDE
* Chromium oder Google Chrome Webbrowser
or
* NW.js

## Installation process

get Arduinoview https://gitlab.com/OvGU-ESS/arduinoview either by using git or downloading the zipfile

    git clone https://gitlab.com/OvGU-ESS/arduinoview

flot is provided via a git submodule or needs to be downloaded from https://github.com/flot/flot

    git submodule init
    git submodule update

copy or link the libraries/Arduinoview directory to your Arduino IDE's library directory (linux-default: $HOME/Arduino/libraries).

    ln -s <Path to Arduinoview>/libraries/Arduinoview $HOME/Arduino/libraries/Arduinoview

## Chromium preparation

* start Chrome or Chromium
* click Menu > More tools > Extensions
* activate "Developer Mode"
* click load unpacked extension
* select the ArduinoviewjsServ directory from gitlab

* the App can be started from the chromium apps menu or from the extension settings
  (at the moment of writing this chromium also creates a link in your desktops application menu)


## NW.js

NW.js is able to run Chromium apps standalone and will continue do.
see: http://nwjs.io/blog/chrome-apps-support/

While writing this 0.16.1 was stable and 0.14.7 LTS both did run Arduinoview
the SDK provides the Inspektion/debug Part of Chrome.

* get NW.js from http://nwjs.io/downloads/

* run ./nw arduinoview/ArduinoviewjsServ
copy
