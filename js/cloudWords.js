(function(win, doc) {
    'use strict';

    var cloudWords, canvas, context, utils = {};
    //detect device support
    if (!win.requestAnimationFrame) return alert(':( Your device doesn\'t have native support of requestAnimationFrame Api.');

    // type detect
    utils.is = function(obj, type) {
        return Object.prototype.toString.call(obj).slice(8, -1) === type;
    };

    // copy props from a obj
    utils.copy = function(defaults, source) {
        for (var p in source) {
            if (source.hasOwnProperty(p)) {
                var val = source[p];
                defaults[p] = this.is(val, 'Object') ? this.copy({},
                val) : this.is(val, 'Array') ? this.copy([], val) : val;
            }
        }
        return defaults;
    };
    utils.merge = function(config) {
        var defaults = {
            id: 'cloudWords',
            word: ['Gemer', 'zhang'],
            color: ['#e1f3f4', '#eaf1f1'],
            width: win.innerWidth,
            height: '200',
            position: 'center',
            fontsize: '100',
            auto: false,
            index: 0,
            second: 4,

        },
        defaults_combine = utils.copy(defaults, config);
        return defaults_combine;
    };
    utils.capable = function(canvas) {
        return canvas.getContext && canvas.getContext('2d');

    };
    utils.randomBetween = function(max, min) {
        return~~ (Math.random() * (max - min + 1) + min);

    };
    utils.distanceTo = function(pointA, pointB) {
        var dx = Math.abs(pointA.x - pointB.x);
        var dy = Math.abs(pointA.y - pointB.y);

        return Math.sqrt(dx * dx + dy * dy);
    };
    utils.scrollX = function() {
        return win.pageXOffset || win.document.documentElement.scrollLeft;
    };
    utils.scrollY = function() {
        return win.pageXOffset || win.document.documentElement.scrollTop;
    };
    utils.mouse = {
        x: -99999,
        y: -99999
    };
    cloudWords = function(config) {
        var defaults = utils.merge(config);
        this.config = defaults;

        var cache = {
            particles: [],
            text: [],
            nextText: [],
            shape: {}
        };
        this.cache = cache;
        this.set();

    };

    cloudWords.prototype.set = function() {

        var self = this;
        var container = doc.getElementById(self.config.id),
        canvas = doc.createElement('canvas');
        this.canvas = canvas;
        canvas.width = self.config.width;
        canvas.height = self.config.height;
        container.appendChild(canvas);

        if ( !! (utils.capable(canvas))) {
            context = canvas.getContext('2d');
            this.createParticles();

            //make main public with requestAnimationFrame.
            var going = function() {
                self.loop();
                win.requestAnimationFrame(going);

            };

            going();

            //auto cotrol
            var auto = self.config.auto ? true: false;
            if (auto) {

                self.autoplay();
            }
            //event handler
            var mouse = this.config.mouse;

            if ('ontouchmove' in win) {

                canvas.addEventListener('touchmove', this._onMove, false);

            } else {
                canvas.addEventListener('mousemove', self._onMouseMove, false);
                canvas.addEventListener('click',
                function() {
                    self._clickNext('+=1');
                },
                false);
            }

        } else {
            console.log('your brower is not support canvas!');

        }

    };
    cloudWords.prototype.createParticles = function() {

        var self = this;
        self.createText();

    };
    cloudWords.prototype.autoplay = function() {
        this.run('+=1');
    };
    cloudWords.prototype._clickNext = function(index) {

        var self = this;
        var indexs = self.config.index;
        var len = this.config.word.length;
        var current = typeof index === 'string' ? indexs + parseInt(index.replace('=', ''), 10) : index;
        if (current >= len) self.config.index = current = 0;
        self.cache.nextText = [];
        self.createText(current);
        self.config.index = current;

    };

    cloudWords.prototype.run = function(index) {

        var self = this;
        var indexs = this.config.index;
        var current = typeof index === 'string' ? indexs + parseInt(index.replace('=', ''), 10) : index;
        var len = this.config.word.length;
        setInterval(function() {

            self.cache.nextText = [];
            self.createText(current);

            current++;
            if (current >= len) current = indexs = 0;

        },
        self.config.second * 1000);

    };

    /** particle make methods Copyright MIT © <2013> <Francesco Trillini> **/

    cloudWords.prototype.createText = function(number) {
        this.clear();
        var self = this;
        var canvas = self.canvas;
        var words = self.config.word;
        var number_index = number ? number: 0;

        context.font = this.config.fontsize + 'px Arial, sans-serif';

        context.textAlign = this.config.position;

        var strings = words[number_index].toUpperCase().split('').join(String.fromCharCode(8202));

        context.fillText(strings, canvas.width * 0.5, canvas.height - 50);

        var surface = context.getImageData(0, 0, canvas.width, canvas.height);

        for (var w = 0; w < surface.width; w += 4) {

            for (var h = 0; h < surface.width; h += 4) {

                var color = surface.data[(h * surface.width * 4) + (w * 4) - 1];
                if (color === 255) {
                    self.cache.nextText.push({
                        x: w,
                        y: h,
                        orbit: utils.randomBetween(1, 3),
                        angle: 0
                    });

                }
            }
        }
        var seed = self.cache.nextText.length;

        this.createTextParticles(seed);

    };

    cloudWords.prototype.createTextParticles = function(seed) {
        var self = this,
        canvas = self.canvas;

        for (var q = 0,
        len = seed; q < len; q++) {

            var radius = utils.randomBetween(0, 12);
            var hasBorn = radius > 0 || radius < 12 ? false: true;

            var colors = this.config.color;
            var color = colors[~~ (Math.random() * colors.length)];

            self.cache.text.push({

                x: canvas.width * 0.5,
                y: canvas.height - 70,

                hasBorn: hasBorn,

                ease: 0.04 + Math.random() * 0.06,
                bornSpeed: 0.07 + Math.random() * 0.07,

                alpha: 0,
                maxAlpha: 0.7 + Math.random() * 0.4,

                radius: radius,
                maxRadius: 12,

                color: color,
                interactive: false

            });

        }

    };
    cloudWords.prototype.updateTransition = function() {

        var self = this,
        text = self.cache.text,
        nextText = self.cache.nextText;

        [].forEach.call(nextText,
        function(particle, index) {

            if (!text[index].interactive) {

                text[index].x += ((particle.x + Math.cos(particle.angle + index) * particle.orbit) - text[index].x) * 0.08;
                text[index].y += ((particle.y + Math.sin(particle.angle + index) * particle.orbit) - text[index].y) * 0.08;

            }

            else {
                text[index].x += ((utils.mouse.x + Math.sin(particle.angle) * 30) - text[index].x) * 0.08;
                text[index].y += ((utils.mouse.y + Math.cos(particle.angle) * 30) - text[index].y) * 0.08;

            }

            particle.angle += 0.08;

        });
        if (nextText.length < text.length) {

            var extra = [].slice.call(text, nextText.length, text.length);

            // Remove extra text particles
            for (var index = 0; index < extra.length; index++)

            text.splice(index, 1);

        }
    };

    cloudWords.prototype.update = function() {

        var self = this;

        self.updateTransition();

        [].forEach.call(self.cache.text,
        function(particle, index) {

            particle.alpha += (particle.maxAlpha - particle.alpha) * 0.05;

            if (particle.hasBorn) {

                particle.radius += (0 - particle.radius) * particle.bornSpeed;

                if (Math.round(particle.radius) === 0)

                particle.hasBorn = false;

            }

            if (!particle.hasBorn) {

                particle.radius += (particle.maxRadius - particle.radius) * particle.bornSpeed;

                if (Math.round(particle.radius) === particle.maxRadius)

                particle.hasBorn = true;

            }

            utils.distanceTo(utils.mouse, particle) <= particle.radius + 30 ? particle.interactive = true: particle.interactive = false;

        });

    };

    cloudWords.prototype.render = function() {
        var self = this; [].forEach.call(self.cache.text,
        function(particle, index) {

            context.save();
            context.globalAlpha = particle.alpha;
            context.fillStyle = particle.color;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            context.fill();
            context.restore();

        });

    };
    cloudWords.prototype.clear = function() {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    };
    cloudWords.prototype.loop = function() {
        var self = this;
        self.clear();
        self.update();
        self.render();

    };
    cloudWords.prototype._onMouseMove = function(event) {

        event.preventDefault();
        utils.mouse.x = event.pageX - (utils.scrollX() + this.getBoundingClientRect().left);
        utils.mouse.y = event.pageY - (utils.scrollY() + this.getBoundingClientRect().top);

    };

    win.requestAnimFrame = (function() {

        return win.requestAnimationFrame || win.webkitRequestAnimationFrame || win.mozRequestAnimationFrame || win.oRequestAnimationFrame || win.msRequestAnimationFrame ||

        function(callback) {
            win.setTimeout(callback, 1000 / 60);

        };
    })();

    this.cloudWords = cloudWords;

}).call(this, window, document);