angular
    .module('Keyboard', [])
    .factory('Mapping', function() {
        return {
            '65': 1,
            '68': 5,
            '69': 4,
            '70': 6,
            '71': 8,
            '72': 10,
            '74': 12,
            '83': 3,
            '84': 7,
            '85': 11,
            '87': 2,
            '88': 200, // +
            '89': 9,
            '90': 100 // -
        };
    })
    .factory('KeyboardHandler', ['$document', '$window', 'Mapping', function($document, $window, mapping) {
        var currentOctave = 5,
            activeNotes = [];

        function _octaveUp() {
            if(currentOctave < 9) {
                currentOctave++;
            }
        }

        function _octaveDown() {
            if(currentOctave > 0) {
                currentOctave--;
            }
        }

        function _keydown(e) {
            // TODO: solve i18n issue
            var midievent = null;

            if(e && e.keyCode && mapping[e.keyCode]) {
                switch(mapping[e.keyCode]) {
                    // octave down
                    case 100:
                        _octaveDown();
                    break;
                    // octave up
                    case 200:
                        _octaveUp();
                    break;
                    // note
                    default:
                        midievent = {
                            'eventName': 'MIDIMessageEvent',
                            'data': [144, mapping[e.keyCode] + (currentOctave * 12), 100],
                            'timeStamp': e.timeStamp
                        };
                    break;
                }
            }

            if(midievent && activeNotes.indexOf(midievent.data[1]) === -1) {
                $window.postMessage(midievent, '*');
                activeNotes.push(midievent.data[1]);
            }
        }

        function _keyup(e) {
            // TODO: solve i18n issue
            var midievent = null;

            if(e && e.keyCode && mapping[e.keyCode]) {
                switch(mapping[e.keyCode]) {
                    // octave down
                    case 100:

                    break;
                    // octave up
                    case 200:

                    break;
                    // note
                    default:
                        midievent = {
                            'eventName': 'MIDIMessageEvent',
                            'data': [128, mapping[e.keyCode] + (currentOctave * 12), 0],
                            'timeStamp': e.timeStamp
                        };
                    break;
                }
            }

            if(midievent) {
                /**
                 * TODO: Look at the buggy situation - test with device if reproducable
                 */
                $window.postMessage(midievent, '*');
                var pos = activeNotes.indexOf(midievent.data[1]);
                activeNotes.splice(pos, 1);
            }
        }

        function _enable() {
            $document.on('keydown', _keydown);
            $document.on('keyup', _keyup);
        }

        function _disable() {
            $document.off('keydown', _keydown);
            $document.off('keyup', _keyup);
        }

        return {
            enable: _enable,
            disable: _disable
        };

    }]);
