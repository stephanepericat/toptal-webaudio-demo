angular
    .module('Keyboard', [])
    .factory('KeyboardHandler', ['$document', function($document) {

        function _keydown(e) {
            console.log('keydown', e);
        }

        function _keyup(e) {
            console.log('keyup', e);
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
