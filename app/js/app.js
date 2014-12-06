angular
    .module('Synth', ['WebAudio', 'WebMIDI'])
    .controller('SynthCtrl', ['$scope', 'Devices', function($scope, Devices) {
        $scope.devices = [];

        Devices
            .connect()
            .then(function(access) {

                if('function' === typeof access.inputs) {
                    // deprecated
                    // $scope.devices = access.inputs();
                    // $($scope.devices).each(function(idx, device) {
                    //     device.onmidimessage = function(e) {
                    //         if($scope.activeDevice && $scope.activeDevice.name === this.name) {
                    //             console.log('active device');
                    //             console.log('MIDI MESSAGE', e);
                    //         }
                    //     };
                    // });
                } else {
                    var inputs = access.inputs.values(),
                    input, device;

                    for (input = inputs.next(); input && !input.done; input = inputs.next()) {
                        device = input.value;

                        device.onmidimessage = function(e) {
                            if($scope.activeDevice && $scope.activeDevice.name === this.name) {
                                console.log('active device');
                                console.log('MIDI MESSAGE', e);
                            }
                        };

                        $scope.devices.push(device);
                    }
                }
            });

        $scope.$watch('activeDevice', function(n, o) {
            if(n) {
                console.log(n);
                console.log('active device: %s %s', n.manufacturer, n.name);
            }
        });
    }]);

angular
    .element(document)
    .ready(function() {
        angular.bootstrap(document.body, ['Synth']);
    })
