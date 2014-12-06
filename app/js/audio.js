angular
    .module('WebAudio', [])
    .factory('DSP', [function() {
        var self = this;
        self.device = null;

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
            console.log('MIDI MESSAGE', e.receivedTime, e.data);
        };

        return {
            plug: _plug
        };
    }]);
