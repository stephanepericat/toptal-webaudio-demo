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

        Gain.prototype.disconnect = function() {
            self.gain.disconnect(0);
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
            if(type) {
                self.osc.type = type
            }
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
    .service('FTR', function() {
        var self;

        function Filter(ctx) {
            self = this;

            self.filter = ctx.createBiquadFilter();
            // self.filter.gain.value = -40; // ???

            return self;
        }

        Filter.prototype.setFilterType = function(type) {
            if(type) {
                self.filter.type = type;
            }
        }

        Filter.prototype.setFilterFrequency = function(freq) {
            if(freq) {
                self.filter.frequency.value = freq;
            }
        }

        Filter.prototype.setFilterResonance = function(res) {
            if(res) {
                self.filter.Q.value = res;
            }
        }

        Filter.prototype.connect = function(i) {
            self.filter.connect(i);
        }

        Filter.prototype.disconnect = function() {
            self.filter.disconnect(0);
        }

        return Filter;
    })
    .factory('AudioEngine', ['OSC', 'AMP', 'FTR', '$window', function(Oscillator, Amp, Filter, $window) {
        var self = this;

        self.activeNotes = [];
        self.settings = {
            attack: 0.05,
            release: 0.05,
            portamento: 0.05
        };

        self.currentFreq = null;

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

        function _setAttack(a) {
            console.log(a);
            if(a) {
                self.settings.attack = a / 1000;
            }
        }

        function _setRelease(r) {
            console.log(r);
            if(r) {
                self.settings.release = r / 1000;
            }
        }

        function _createFilters() {
            self.filter1 = new Filter(self.ctx);
            // self.filter1.setFilterType('highpass');
            self.filter1.setFilterFrequency(5000);
            self.filter1.setFilterResonance(25);
        }

        function _wire(Analyser) {
            self.osc1.connect(self.amp.gain);

            if(Analyser) {
                self.analyser = Analyser;
                self.analyser.connect(self.ctx, self.amp);
            } else {
                self.amp.connect(self.ctx.destination);
            }

            self.amp.setVolume(0.0, 0); //mute the sound
            self.osc1.start(0); // start osc1
        }

        function _connectFilter() {
            self.amp.disconnect();
            self.amp.connect(self.filter1.filter);
            if(self.analyser) {
                self.analyser.connect(self.ctx, self.filter1);
            } else {
                self.filter1.connect(self.ctx.destination);
            }
        }

        function _disconnectFilter() {
            self.filter1.disconnect();
            self.amp.disconnect();
            if(self.analyser) {
                self.analyser.connect(self.ctx, self.amp);
            } else {
                self.amp.connect(self.ctx.destination);
            }
        }

        function _mtof(note) {
            return 440 * Math.pow(2, (note - 69) / 12);
        }

        function _vtov (velocity) {
            return (velocity / 127).toFixed(2);
        }

        function _noteOn(note, velocity) {
            self.activeNotes.push(note);

            self.osc1.cancel();
            self.currentFreq = _mtof(note);
            self.osc1.setFrequency(self.currentFreq, self.settings.portamento);

            self.amp.cancel();

            self.amp.setVolume(_vtov(velocity), self.settings.attack);
        }

        function _noteOff(note) {
            var position = self.activeNotes.indexOf(note);
            if (position !== -1) {
                self.activeNotes.splice(position, 1);
            }

            if (self.activeNotes.length === 0) {
                // shut off the envelope
                self.amp.cancel();
                self.currentFreq = null;
                self.amp.setVolume(0.0, self.settings.release);
            }
            // else {
            //     self.osc1.cancel();
            //     self.osc1.setFrequency(_mtof(self.activeNotes[self.activeNotes.length - 1]), self.settings.portamento);
            // }
        }

        function _detune(d) {
            if(self.currentFreq) {
                //64 = no detune
                if(64 === d) {
                    self.osc1.setFrequency(self.currentFreq, self.settings.portamento);
                } else {
                    var detuneFreq = Math.pow(2, 1 / 12) * (d - 64);
                    self.osc1.setFrequency(self.currentFreq + detuneFreq, self.settings.portamento);
                }
            }
        }

        return {
            init: function() {
                _createContext();
                _createAmp();
                _createOscillators();
                _createFilters();
            },
            wire: _wire,
            noteOn: _noteOn,
            noteOff: _noteOff,
            detune: _detune,
            setAttack: _setAttack,
            setRelease: _setRelease,
            osc: {
                setType: function(t) {
                    if(self.osc1) {
                        self.osc1.setOscType(t);
                    }
                }
            },
            filter: {
                setType: function(t) {
                    if(self.filter1) {
                        self.filter1.setFilterType(t);
                    }
                },
                setFrequency: function(f) {
                    if(self.filter1) {
                        self.filter1.setFilterFrequency(f);
                    }
                },
                setResonance: function(r) {
                    if(self.filter1) {
                        self.filter1.setFilterResonance(r);
                    }
                },
                connect: _connectFilter,
                disconnect: _disconnectFilter
            }
        };
    }]);
