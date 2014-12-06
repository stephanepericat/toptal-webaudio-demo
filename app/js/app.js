angular
    .module('Synth', [])
    .controller('SynthCtrl', ['$scope', function($scope) {

    }]);

angular
    .element(document)
    .ready(function() {
        angular.bootstrap(document.body, ['Synth']);
    })
