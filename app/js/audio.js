angular
    .module('WebAudio', [])
    .service('AMP', function() {
        var self;

        function Gain(ctx) {
            self = this;

            self.gain = ctx.createGain();

            return self;
        }

        Gain.prototype.setVolume = function(volume, time) {
            self.gain.gain.setTargetAtTime(volume, 0, time);
        }

        Gain.prototype.connect = function(i) {
            self.gain.connect(i);
        }

        Gain.prototype.cancel = function() {
            self.gain.gain.cancelScheduledValues(0);
        }

        return Gain;
    })
    .service('OSC', function() {
        var self;

        function Oscillator(ctx) {
            self = this;
            self.osc = ctx.createOscillator();

            return self;
        }

        Oscillator.prototype.setOscType = function(type) {
            self.osc.type = type || 'sine';
        }

        Oscillator.prototype.setFrequency = function(freq, time) {
            self.osc.frequency.setTargetAtTime(freq, 0, time);
        };

        Oscillator.prototype.start = function(pos) {
            self.osc.start(pos);
        }

        Oscillator.prototype.stop = function(pos) {
            self.osc.stop(pos);
        }

        Oscillator.prototype.connect = function(i) {
            self.osc.connect(i);
        }

        Oscillator.prototype.cancel = function() {
            self.osc.frequency.cancelScheduledValues(0);
        }

        return Oscillator;
    })
    .factory('AudioEngine', ['OSC', 'AMP', '$window', function(Oscillator, Amp, $window) {
        var self = this;

        self.activeNotes = [];
        self.settings = {
            attack: 0.05,
            release: 0.05,
            portamento: 0.05
        };

        function _createContext() {
            self.ctx = new $window.AudioContext();
        }

        function _createAmp() {
            self.amp = new Amp(self.ctx);
        }

        function _createOscillators() {
            //osc types: sine, square, triangle, sawtooth
            // osc1
            self.osc1 = new Oscillator(self.ctx);
            self.osc1.setOscType('sine');
        }

        function _wire() {
            self.osc1.connect(self.amp.gain);
            self.amp.connect(self.ctx.destination);
            self.amp.setVolume(0.0, 0); //mute the sound
            self.osc1.start(0); // start osc1
        }

        function _mtof(note) {
            return 440 * Math.pow(2, (note - 69) / 12);
        }

        function _noteOn(note, velocity) {
            self.activeNotes.push(note);

            self.osc1.cancel();
            self.osc1.setFrequency(_mtof(note), self.settings.portamento);

            self.amp.cancel();
            self.amp.setVolume(1.0, self.settings.attack);
        }

        function _noteOff(note) {
            var position = self.activeNotes.indexOf(note);
            if (position !== -1) {
                self.activeNotes.splice(position, 1);
            }

            if (self.activeNotes.length === 0) {
                // shut off the envelope
                self.amp.cancel();
                self.amp.setVolume(0.0, self.settings.release);
            } else {
                self.osc1.cancel();
                self.osc1.setFrequency(_mtof(self.activeNotes[self.activeNotes.length - 1]), self.settings.portamento);
            }
        }

        return {
            init: function() {
                _createContext();
                _createAmp();
                _createOscillators();
                _wire();
            },
            noteOn: _noteOn,
            noteOff: _noteOff
        };
    }])
    .factory('DSP', ['AudioEngine', function(Engine) {
        var self = this;
        self.device = null;

        Engine.init();

        function _unplug() {
            self.device.onmidimessage = null;
            self.device = null;
        }

        function _plug(device) {
            // unplug any already connected device
            if(self.device) {
                _unplug();
            }

            self.device = device;
            self.device.onmidimessage = _onmidimessage;
        }

        function _onmidimessage(e) {
            /**
            * e.data is an array
            * e.data[0] = on (144) / off (128)
            * e.data[1] = midi note
            * e.data[2] = velocity
            */
            switch(e.data[0]) {
                case 144:
                    Engine.noteOn(e.data[1], e.data[2]);
                break;
                case 128:
                    Engine.noteOff(e.data[1]);
                break;
            }
        };

        return {
            plug: _plug
        };
    }]);
