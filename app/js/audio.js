angular
    .module('WebAudio', [])
    .service('AMP', function() {
        var self;

        function Gain(ctx) {
            self = this;

            self.gain = ctx.createGain();

            return self;
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
            self.osc.frequency.setValueAtTime(freq, time);
        };

        return Oscillator;
    })
    .factory('AudioEngine', ['OSC', 'AMP', '$window', function(Oscillator, Amp, $window) {
        var self = this;

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
            self.osc1.osc.connect(self.amp.gain);
            self.amp.gain.connect(self.ctx.destination);
        }

        function _mtof(note) {
            return 440 * Math.pow(2, (note - 69) / 12);
        }

        function _noteOn(note, velocity) {
            console.log('note on', note, velocity);
        }

        function _noteOff(note) {
            console.log('note off', note);
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
        var self = this
            activeNotes = [];

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
