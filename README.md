toptal-webaudio-demo
====================

Demo files supporting the Toptal blog article about webaudio

##Prerequisites##
 - Google Chrome 39 or above with #enable-web-midi flag activated
 - Some MIDI controller connected to your computer

##How To Use##

    git clone https://github.com/stephanepericat/toptal-webaudio-demo.git
    cd toptal-webaudio-demo/
    npm i && bower i
    npm start

Go to [http://localhost:3000/](http://localhost:3000/)

##MIDI Devices##

Any MIDI device should be picked up by the demo.

Remember to connect your MIDI device __before__ starting your browser.


##Live Demo##

Try it out [here](http://webmididemo.herokuapp.com/)!

##Computer keyboard support##

If you do not own a midi device, you can still test the application using your computer keyboard.
To do so, simply checkout the 'keyboard' branch of this repository. The following keys are mapped:

| Note  | Letter  |
|-------|---------|
|   C   |    a    |
|   C#  |    w    |
|   D   |    s    |
|   D#  |    e    |
|   E   |    d    |
|   F   |    f    |
|   F#  |    t    |
|   G   |    g    |
|   G#  |    y    |
|   A   |    h    |
|   A#  |    u    |
|   B   |    j    |

You can also change octaves:
- `z` for octave down
- `x` for octave up
