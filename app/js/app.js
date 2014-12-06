angular
    .module('Synth', ['WebAudio', 'WebMIDI'])
    .controller('SynthCtrl', ['$scope', 'Devices', 'DSP', function($scope, Devices, DSP) {
        $scope.devices = [];

        Devices
            .connect()
            .then(function(access) {
                if('function' === typeof access.inputs) {
                    // deprecated
                    // $scope.devices = access.inputs();
                    console.warn('update your Chrome version!');
                } else {
                    if(access.inputs && access.inputs.size > 0) {
                        var inputs = access.inputs.values(),
                        input, device;

                        // iterate through the devices
                        for (input = inputs.next(); input && !input.done; input = inputs.next()) {
                            $scope.devices.push(input.value);
                        }
                    } else {
                        console.error('no devices!');
                    }

                }
            });

        $scope.$watch('activeDevice', function(device) {
            if(device) {
                // attache the midi device to the audio source
                DSP.plug(device);
                console.log('active device: %s %s', device.manufacturer, device.name);
            }
        });
    }]);

angular
    .element(document)
    .ready(function() {
        angular.bootstrap(document.body, ['Synth']);
    })
