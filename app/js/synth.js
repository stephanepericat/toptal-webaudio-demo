angular
    .module('Synth', ['WebAudio', 'WebAnalyser', 'Keyboard'])
    .factory('DSP', ['AudioEngine', 'Analyser', '$window', 'KeyboardHandler', function(Engine, Analyser, $window, Keyboard) {
        var self = this;
        self.device = null;
        self.analyser = null;
        self.useKeyboard = false;

        Engine.init();

        function _unplug() {
            if(self.device && self.device.onmidimessage) {
                self.device.onmidimessage = null;
            }

            self.device = null;
        }

        function _plug(device) {
            if(device) {
                // unplug any already connected device
                if(self.device) {
                    _unplug();
                }

                self.device = device;
                self.device.onmidimessage = _onmidimessage;
            }
        }

        function _switchKeyboard(on) {
            if(on !== undefined) {
                _unplug();
                Keyboard.disable();

                if(on) {
                    Keyboard.enable();

                    self.device = $window;
                    self.device.onmessage = _onmessage;
                }
            }
        }

        function _createAnalyser(canvas) {
            self.analyser = new Analyser(canvas);
            Engine.wire(self.analyser);

            return self.analyser;
        }

        function _onmidimessage(e) {
            /**
            * e.data is an array
            * e.data[0] = on (144) / off (128) / detune (224)
            * e.data[1] = midi note
            * e.data[2] = velocity || detune
            */
            switch(e.data[0]) {
                case 144:
                    Engine.noteOn(e.data[1], e.data[2]);
                break;
                case 128:
                    Engine.noteOff(e.data[1]);
                break;
                case 224:
                    Engine.detune(e.data[2]);
                break;
            }
        }

        function _onmessage(e) {
            console.log('post message', e);
        }

        function _enableFilter(enable) {
            if(enable !== undefined) {
                if(enable) {
                    Engine.filter.connect();
                } else {
                    Engine.filter.disconnect();
                }
            }
        }

        return {
            createAnalyser: _createAnalyser,
            enableFilter: _enableFilter,
            plug: _plug,
            setOscType: Engine.osc.setType,
            setFilterType: Engine.filter.setType,
            setAttack: Engine.setAttack,
            setRelease: Engine.setRelease,
            setFilterFrequency: Engine.filter.setFrequency,
            setFilterResonance: Engine.filter.setResonance,
            switchKeyboard: _switchKeyboard
        };
    }]);
