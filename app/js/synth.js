angular
    .module('Synth', ['WebAudio', 'WebAnalyser'])
    .factory('DSP', ['AudioEngine', 'Analyser', function(Engine, Analyser) {
        var self = this;
        self.device = null;
        self.analyser = null;

        Engine.init();

        function _unplug() {
            self.device.onmidimessage = null;
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

        function _createAnalyser(canvas) {
            self.analyser = new Analyser(canvas);
            // self.analyser.wire();
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
            plug: _plug,
            createAnalyser: _createAnalyser,
            setOscType: Engine.osc.setType,
            setFilterType: Engine.filter.setType,
            setAttack: Engine.setAttack,
            setRelease: Engine.setRelease,
            setFilterFrequency: Engine.filter.setFrequency,
            setFilterResonance: Engine.filter.setResonance,
            enableFilter: _enableFilter
        };
    }]);
