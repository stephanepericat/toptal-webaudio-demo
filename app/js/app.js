angular
    .module('Synth', ['WebAudio', 'WebMIDI'])
    .controller('SynthCtrl', ['$scope', 'Devices', 'DSP', function($scope, devices, DSP) {
        $scope.devices = [];

        $scope.synth = {
            oscType: 'sine',
            filterType: 'lowpass',
            filterOn: true
        };

        devices
            .connect()
            .then(function(access) {
                if('function' === typeof access.inputs) {
                    // deprecated
                    // $scope.devices = access.inputs();
                    console.error('Update your Chrome version!');
                } else {
                    if(access.inputs && access.inputs.size > 0) {
                        var inputs = access.inputs.values(),
                        input, device;

                        // iterate through the devices
                        for (input = inputs.next(); input && !input.done; input = inputs.next()) {
                            $scope.devices.push(input.value);
                        }
                    } else {
                        console.error('No devices detected!');
                    }

                }
            })
            .catch(function(e) {
                console.error(e);
            });

        // watchers
        $scope.$watch('activeDevice', DSP.plug);
        $scope.$watch('synth.oscType', DSP.setOscType);
    }]);

angular
    .element(document)
    .ready(function() {
        angular.bootstrap(document.body, ['Synth']);
    })
