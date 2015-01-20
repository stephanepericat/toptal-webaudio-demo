////////
// This sample is published as part of the blog article at www.toptal.com/blog
// Visit www.toptal.com/blog and subscribe to our newsletter to read great posts
////////

angular
    .module('WebAnalyser', [])
    .service('Analyser', function() {
        var self;

        function Analyser(canvas) {
            self = this;

            self.canvas = angular.element(canvas) || null;
            self.view = self.canvas[0].getContext('2d') || null;
            self.javascriptNode = null;
            self.analyser = null;

            return self;
        }

        function drawSpectrum(array) {
            for (var i = 0; i < (array.length); i++) {
                var v = array[i],
                    h = self.canvas.height();

                self.view.fillRect(i * 2, h - (v - (h / 4)), 1, v + (h / 4));
            }
        }

        Analyser.prototype.connect = function(ctx, output) {
            // setup a javascript node
            self.javascriptNode = ctx.createScriptProcessor(2048, 1, 1);
            // connect to destination, else it isn't called
            self.javascriptNode.connect(ctx.destination);

            // setup a analyzer
            self.analyser = ctx.createAnalyser();
            self.analyser.smoothingTimeConstant = 0.3;
            self.analyser.fftSize = 512;

            // connect the output to the destiantion for sound
            output.connect(ctx.destination);
            // connect the output to the analyser for processing
            output.connect(self.analyser);

            self.analyser.connect(self.javascriptNode);

            // sourceNode.connect(context.destination);
            var gradient = self.view.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(1, '#000000');
            gradient.addColorStop(0.75, '#ff0000');
            gradient.addColorStop(0.25, '#ffff00');
            gradient.addColorStop(0, '#ffffff');

            // when the javascript node is called
            // we use information from the analyzer node
            // to draw the volume
            self.javascriptNode.onaudioprocess = function() {
                // get the average for the first channel
                var array =  new Uint8Array(self.analyser.frequencyBinCount);
                self.analyser.getByteFrequencyData(array);

                // clear the current state
                self.view.clearRect(0, 0, 1000, 325);

                // set the fill style
                self.view.fillStyle = gradient;
                drawSpectrum(array);
            }
        };

        Analyser.prototype.disconnect = function() {
            self.analyser.disconnect(0);
        };

        return Analyser;
    });
