angular
    .module('WebAudio', [])
    .service('OSC', function() {
        function Oscillator(ctx) {
            return ctx.createOscillator();
        }

        return Oscillator;
    })
    .factory('AudioEngine', ['OSC', function(Oscillator) {
        var self = this;

        self.ctx = new AudioContext();

        return {
            init: function() {
                var osc1 = new Oscillator(self.ctx);
                console.log('OSCILLATOR', osc1);
            }
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
            if(self.device) {
                _unplug();
            }

            self.device = device;
            self.device.onmidimessage = _onmidimessage;
        }

        function _onmidimessage(e) {
            /**
            * e.data is an array
            * e[0] = on (144) / off (128)
            * e[1] = midi note
            * e[2] = velocity (64 if 'off')
            */
            console.log('MIDI MESSAGE', parseInt(e.receivedTime), e.data);
        };

        return {
            plug: _plug
        };
    }]);
