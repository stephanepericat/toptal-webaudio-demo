////////
// This sample is published as part of the blog article at www.toptal.com/blog
// Visit www.toptal.com/blog and subscribe to our newsletter to read great posts
////////

angular
    .module('WebMIDI', [])
    .factory('Devices', ['$window', '$q', function($window, $q) {
        function _test() {
            return ($window.navigator && $window.navigator.requestMIDIAccess) ? true : false;
        }

        function _connect() {
            var d = $q.defer(),
            p = d.promise
            a = null;

            if(_test()) {
                $window
                    .navigator
                    .requestMIDIAccess()
                    .then(d.resolve, d.reject);
            } else {
                d.reject(new Error('No Web MIDI support'));
            }

            return p;
        }

        return {
            connect: _connect
        };
    }]);
