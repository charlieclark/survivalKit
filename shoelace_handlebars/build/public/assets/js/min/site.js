// jQuery WipeTouch 1.2.0
// ------------------------------------------------------------------------
//
// Developed and maintained by Igor Ramadas
// http://aboutigor.com
// http://devv.com
//
// USAGE
// ------------------------------------------------------------------------
//
// $(selector).wipetouch(config);
//
// The wipe events should expect the result object with the following properties:
// speed - the wipe speed from 1 to 5
// x - how many pixels moved on the horizontal axis
// y - how many pixels moved on the vertical axis
// source - the element which triggered the wipe gesture
//
// EXAMPLE
//      $(document).wipetouch({
//          allowDiagonal: true,
//          wipeLeft: function(result) { alert("Left on speed " + result.speed) },
//          wipeTopLeft: function(result) { alert("Top left on speed " + result.speed) },
//          wipeBottomLeft: function(result) { alert("Bottom left on speed " + result.speed) }
//      });
//
//
// More details at http://wipetouch.codeplex.com/
//
// CHANGE LOG
// ------------------------------------------------------------------------
// 1.2.0
// - New: wipeMove event, triggered while moving the mouse/finger.
// - New: added "source" to the result object.
// - Bug fix: sometimes vertical wipe events would not trigger correctly.
// - Bug fix: improved tapToClick handler.
// - General code refactoring.
// - Windows Phone 7 is not supported, yet! Its behaviour is completely broken and would require some special tricks to make it work. Maybe in the future...
//
// 1.1.0
// - New: tapToClick, if true will identify taps and and trigger a click on the touched element. Default is false.
// - Changed: events wipeBottom*** and wipeTop*** renamed to wipeDown*** and wipeUp***.
// - Changed: better touch speed calculation (was always too fast before).
// - Changed: speed will be an integer now (instead of float).
// - Changed: better wipe detection (if Y movement is more than X, do a vertical wipe instead of horizontal).
// - Bug fix: added preventDefault to touchStart and touchEnd internal events (this was missing).
// - Other general tweaks to the code.
//
// The minified version of WipeTouch can be generated using Jasc: http://jasc.codeplex.com

(function ($) {
    $.fn.wipetouch = function (settings) {
        // ------------------------------------------------------------------------
        // PLUGIN SETTINGS
        // ------------------------------------------------------------------------

        var config = {

            // Variables and options
            moveX: 40,  // minimum amount of horizontal pixels to trigger a wipe event
            moveY: 40,  // minimum amount of vertical pixels to trigger a wipe event
            tapToClick: false, // if user taps the screen it will fire a click event on the touched element
            preventDefault: true, // if true, prevents default events (click for example)
            allowDiagonal: false, // if false, will trigger horizontal and vertical movements so wipeUpLeft, wipeDownLeft, wipeUpRight, wipeDownRight are ignored

            // Wipe events
            wipeLeft: false, // called on wipe left gesture
            wipeRight: false, // called on wipe right gesture
            wipeUp: false, // called on wipe up gesture
            wipeDown: false, // called on wipe down gesture
            wipeUpLeft: false, // called on wipe top and left gesture
            wipeDownLeft: false, // called on wipe bottom and left gesture
            wipeUpRight: false, // called on wipe top and right gesture
            wipeDownRight: false, // called on wipe bottom and right gesture
            wipeMove: false, // triggered whenever touchMove acts

            // DEPRECATED EVENTS
            wipeTopLeft: false, // USE WIPEUPLEFT
            wipeBottomLeft: false, // USE WIPEDOWNLEFT
            wipeTopRight: false, // USE WIPEUPRIGHT
            wipeBottomRight: false  // USE WIPEDOWNRIGHT
        };

        if (settings) {
            $.extend(config, settings);
        }

        this.each(function () {
            // ------------------------------------------------------------------------
            // INTERNAL VARIABLES
            // ------------------------------------------------------------------------

            var startX;                     // where touch has started, left
            var startY;                     // where touch has started, top
            var startDate = false;          // used to calculate timing and aprox. acceleration
            var curX;                       // keeps touch X position while moving on the screen
            var curY;                       // keeps touch Y position while moving on the screen
            var isMoving = false;           // is user touching and moving?
            var touchedElement = false;     // element which user has touched

            // These are for non-touch devices!
            var useMouseEvents = false;     // force using the mouse events to simulate touch
            var clickEvent = false;         // holds the click event of the target, when used hasn't clicked

            // ------------------------------------------------------------------------
            // TOUCH EVENTS
            // ------------------------------------------------------------------------

            // Called when user touches the screen.
            function onTouchStart(e) {

                if (!overrideCheck(e.target)) {
                    return;
                }

                var start = useMouseEvents || (e.originalEvent.touches && e.originalEvent.touches.length > 0);

                if (!isMoving && start) {
                    if (config.preventDefault) {
                        e.preventDefault();
                    }

                    // Temporary fix for deprecated events, these will be removed on next version!
                    if (config.allowDiagonal) {
                        if (!config.wipeDownLeft) {
                            config.wipeDownLeft = config.wipeBottomLeft;
                        }

                        if (!config.wipeDownRight) {
                            config.wipeDownRight = config.wipeBottomRight;
                        }

                        if (!config.wipeUpLeft) {
                            config.wipeUpLeft = config.wipeTopLeft;
                        }

                        if (!config.wipeUpRight) {
                            config.wipeUpRight = config.wipeTopRight;
                        }
                    }

                    // When touch events are not present, use mouse events.
                    if (useMouseEvents) {
                        startX = e.pageX;
                        startY = e.pageY;

                        $(this).bind("mousemove", onTouchMove);
                        $(this).one("mouseup", onTouchEnd);
                    }
                    else {
                        startX = e.originalEvent.touches[0].pageX;
                        startY = e.originalEvent.touches[0].pageY;

                        $(this).bind("touchmove", onTouchMove);
                    }

                    // Set the start date and current X/Y.
                    startDate = new Date().getTime();
                    curX = startX;
                    curY = startY;
                    isMoving = true;

                    touchedElement = $(e.target);
                }
            }

            // Called when user untouches the screen.
            function onTouchEnd(e) {

                if (!overrideCheck(e.target)) {
                    return;
                }

                if (config.preventDefault) {
                    e.preventDefault();
                }

                // When touch events are not present, use mouse events.
                if (useMouseEvents) {
                    $(this).unbind("mousemove", onTouchMove);
                }
                else {
                    $(this).unbind("touchmove", onTouchMove);
                }

                // If is moving then calculate the touch results, otherwise reset it.
                if (isMoving) {
                    touchCalculate(e);
                }
                else {
                    resetTouch();
                }
            }

            // Called when user is touching and moving on the screen.
            function onTouchMove(e) {

                if (!overrideCheck(e.target)) {
                    return;
                }


                if (config.preventDefault) {
                    e.preventDefault();
                }

                if (useMouseEvents && !isMoving) {
                    onTouchStart(e);
                }

                if (isMoving) {
                    if (useMouseEvents) {
                        curX = e.pageX;
                        curY = e.pageY;
                    }
                    else {
                        curX = e.originalEvent.touches[0].pageX;
                        curY = e.originalEvent.touches[0].pageY;
                    }

                    // If there's a wipeMove event, call it passing
                    // current X and Y position (curX and curY).
                    if (config.wipeMove) {
                        triggerEvent(config.wipeMove, {
                            curX: curX,
                            curY: curY
                        });
                    }
                }
            }

            // ------------------------------------------------------------------------
            // CALCULATE TOUCH AND TRIGGER
            // ------------------------------------------------------------------------

            function touchCalculate(e) {
                var endDate = new Date().getTime();     // current date to calculate timing
                var ms = startDate - endDate;           // duration of touch in milliseconds

                var x = curX;                           // current left position
                var y = curY;                           // current top position
                var dx = x - startX;                    // diff of current left to starting left
                var dy = y - startY;                    // diff of current top to starting top
                var ax = Math.abs(dx);                  // amount of horizontal movement
                var ay = Math.abs(dy);                  // amount of vertical movement

                // If moved less than 15 pixels, touch duration is less than 100ms,
                // and tapToClick is true then trigger a click event and stop processing.
                if (ax < 15 && ay < 15 && ms < 100) {
                    clickEvent = false;

                    if (config.preventDefault) {
                        resetTouch();

                        touchedElement.trigger("click");
                        return;
                    }
                }
                // When touch events are not present, use mouse events.
                else if (useMouseEvents) {
                    var evts = touchedElement.data("events");

                    if (evts) {
                        // Save click event to the temp clickEvent variable.
                        var clicks = evts.click;

                        if (clicks && clicks.length > 0) {
                            $.each(clicks, function (i, f) {
                                clickEvent = f;
                                return;
                            });

                            touchedElement.unbind("click");
                        }
                    }
                }

                // Is it moving to the right or left, top or bottom?
                var toright = dx > 0;
                var tobottom = dy > 0;

                // Calculate speed from 1 to 5, 1 being slower and 5 faster.
                var s = ((ax + ay) * 60) / ((ms) / 6 * (ms));

                if (s < 1) s = 1;
                if (s > 5) s = 5;

                var result = {
                    speed: parseInt(s),
                    x: ax,
                    y: ay,
                    source: touchedElement
                };

                if (ax >= config.moveX) {
                    // Check if it's allowed and trigger diagonal wipe events.
                    if (config.allowDiagonal && ay >= config.moveY) {
                        if (toright && tobottom) {
                            triggerEvent(config.wipeDownRight, result);
                        }
                        else if (toright && !tobottom) {
                            triggerEvent(config.wipeUpRight, result);
                        }
                        else if (!toright && tobottom) {
                            triggerEvent(config.wipeDownLeft, result);
                        }
                        else {
                            triggerEvent(config.wipeUpLeft, result);
                        }
                    }
                    // Otherwise trigger horizontal events if X > Y.
                    else if (ax >= ay) {
                        if (toright) {
                            triggerEvent(config.wipeRight, result);
                        }
                        else {
                            triggerEvent(config.wipeLeft, result);
                        }
                    }
                }
                // If Y > X and no diagonal, trigger vertical events.
                else if (ay >= config.moveY && ay > ax) {
                    if (tobottom) {
                        triggerEvent(config.wipeDown, result);
                    }
                    else {
                        triggerEvent(config.wipeUp, result);
                    }
                }

                resetTouch();
            }

            // Resets the cached variables.
            function resetTouch() {
                startX = false;
                startY = false;
                startDate = false;
                isMoving = false;

                // If there's a click event, bind after a few miliseconds.
                if (clickEvent) {
                    window.setTimeout(function () {
                        touchedElement.bind("click", clickEvent);
                        clickEvent = false;
                    }, 50);
                }
            }

            // Trigger a wipe event passing a result object with
            // speed from 1 to 5, x / y movement amount in pixels,
            // and the source element.
            function triggerEvent(wipeEvent, result) {
                if (wipeEvent) {
                    wipeEvent(result);
                }
            }

            function overrideCheck(target) {

                var override = true;

                if (DETECTION.isAndroid) {
                    if ($(target).is("input")) {
                        override = false;
                    }
                }

                return override;
            }

            // ------------------------------------------------------------------------
            // ADD TOUCHSTART AND TOUCHEND EVENT LISTENERS
            // ------------------------------------------------------------------------

            if ("ontouchstart" in document.documentElement) {
                $(this).bind("touchstart", onTouchStart);
                $(this).bind("touchend", onTouchEnd);
            }
            else {
                useMouseEvents = true;

                $(this).bind("mousedown", onTouchStart);
                $(this).bind("mouseout", onTouchEnd);
            }
        });

        return this;
    };
})(jQuery);
/*

 Copyright (C) 2011 by Yehuda Katz

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 */

// lib/handlebars/base.js

/*jshint eqnull:true*/
this.Handlebars = {};

(function (Handlebars) {

    Handlebars.VERSION = "1.0.0-rc.3";
    Handlebars.COMPILER_REVISION = 2;

    Handlebars.REVISION_CHANGES = {
        1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
        2: '>= 1.0.0-rc.3'
    };

    Handlebars.helpers = {};
    Handlebars.partials = {};

    Handlebars.registerHelper = function (name, fn, inverse) {
        if (inverse) {
            fn.not = inverse;
        }
        this.helpers[name] = fn;
    };

    Handlebars.registerPartial = function (name, str) {
        this.partials[name] = str;
    };

    Handlebars.registerHelper('helperMissing', function (arg) {
        if (arguments.length === 2) {
            return undefined;
        } else {
            throw new Error("Could not find property '" + arg + "'");
        }
    });

    var toString = Object.prototype.toString, functionType = "[object Function]";

    Handlebars.registerHelper('blockHelperMissing', function (context, options) {
        var inverse = options.inverse || function () {
        }, fn = options.fn;


        var ret = "";
        var type = toString.call(context);

        if (type === functionType) {
            context = context.call(this);
        }

        if (context === true) {
            return fn(this);
        } else if (context === false || context == null) {
            return inverse(this);
        } else if (type === "[object Array]") {
            if (context.length > 0) {
                return Handlebars.helpers.each(context, options);
            } else {
                return inverse(this);
            }
        } else {
            return fn(context);
        }
    });

    Handlebars.K = function () {
    };

    Handlebars.createFrame = Object.create || function (object) {
        Handlebars.K.prototype = object;
        var obj = new Handlebars.K();
        Handlebars.K.prototype = null;
        return obj;
    };

    Handlebars.logger = {
        DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3,

        methodMap: {0: 'debug', 1: 'info', 2: 'warn', 3: 'error'},

        // can be overridden in the host environment
        log: function (level, obj) {
            if (Handlebars.logger.level <= level) {
                var method = Handlebars.logger.methodMap[level];
                if (typeof console !== 'undefined' && console[method]) {
                    console[method].call(console, obj);
                }
            }
        }
    };

    Handlebars.log = function (level, obj) {
        Handlebars.logger.log(level, obj);
    };

    Handlebars.registerHelper('each', function (context, options) {
        var fn = options.fn, inverse = options.inverse;
        var i = 0, ret = "", data;

        if (options.data) {
            data = Handlebars.createFrame(options.data);
        }

        if (context && typeof context === 'object') {
            if (context instanceof Array) {
                for (var j = context.length; i < j; i++) {
                    if (data) {
                        data.index = i;
                    }
                    ret = ret + fn(context[i], { data: data });
                }
            } else {
                for (var key in context) {
                    if (context.hasOwnProperty(key)) {
                        if (data) {
                            data.key = key;
                        }
                        ret = ret + fn(context[key], {data: data});
                        i++;
                    }
                }
            }
        }

        if (i === 0) {
            ret = inverse(this);
        }

        return ret;
    });

    Handlebars.registerHelper('if', function (context, options) {
        var type = toString.call(context);
        if (type === functionType) {
            context = context.call(this);
        }

        if (!context || Handlebars.Utils.isEmpty(context)) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    });

    Handlebars.registerHelper('unless', function (context, options) {
        var fn = options.fn, inverse = options.inverse;
        options.fn = inverse;
        options.inverse = fn;

        return Handlebars.helpers['if'].call(this, context, options);
    });

    Handlebars.registerHelper('with', function (context, options) {
        return options.fn(context);
    });

    Handlebars.registerHelper('log', function (context, options) {
        var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
        Handlebars.log(level, context);
    });

}(this.Handlebars));
;
// lib/handlebars/compiler/parser.js
/* Jison generated parser */
var handlebars = (function () {
    var parser = {trace: function trace() {
    },
        yy: {},
        symbols_: {"error": 2, "root": 3, "program": 4, "EOF": 5, "simpleInverse": 6, "statements": 7, "statement": 8, "openInverse": 9, "closeBlock": 10, "openBlock": 11, "mustache": 12, "partial": 13, "CONTENT": 14, "COMMENT": 15, "OPEN_BLOCK": 16, "inMustache": 17, "CLOSE": 18, "OPEN_INVERSE": 19, "OPEN_ENDBLOCK": 20, "path": 21, "OPEN": 22, "OPEN_UNESCAPED": 23, "OPEN_PARTIAL": 24, "partialName": 25, "params": 26, "hash": 27, "DATA": 28, "param": 29, "STRING": 30, "INTEGER": 31, "BOOLEAN": 32, "hashSegments": 33, "hashSegment": 34, "ID": 35, "EQUALS": 36, "PARTIAL_NAME": 37, "pathSegments": 38, "SEP": 39, "$accept": 0, "$end": 1},
        terminals_: {2: "error", 5: "EOF", 14: "CONTENT", 15: "COMMENT", 16: "OPEN_BLOCK", 18: "CLOSE", 19: "OPEN_INVERSE", 20: "OPEN_ENDBLOCK", 22: "OPEN", 23: "OPEN_UNESCAPED", 24: "OPEN_PARTIAL", 28: "DATA", 30: "STRING", 31: "INTEGER", 32: "BOOLEAN", 35: "ID", 36: "EQUALS", 37: "PARTIAL_NAME", 39: "SEP"},
        productions_: [0, [3, 2], [4, 2], [4, 3], [4, 2], [4, 1], [4, 1], [4, 0], [7, 1], [7, 2], [8, 3], [8, 3], [8, 1], [8, 1], [8, 1], [8, 1], [11, 3], [9, 3], [10, 3], [12, 3], [12, 3], [13, 3], [13, 4], [6, 2], [17, 3], [17, 2], [17, 2], [17, 1], [17, 1], [26, 2], [26, 1], [29, 1], [29, 1], [29, 1], [29, 1], [29, 1], [27, 1], [33, 2], [33, 1], [34, 3], [34, 3], [34, 3], [34, 3], [34, 3], [25, 1], [21, 1], [38, 3], [38, 1]],
        performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {

            var $0 = $$.length - 1;
            switch (yystate) {
                case 1:
                    return $$[$0 - 1];
                    break;
                case 2:
                    this.$ = new yy.ProgramNode([], $$[$0]);
                    break;
                case 3:
                    this.$ = new yy.ProgramNode($$[$0 - 2], $$[$0]);
                    break;
                case 4:
                    this.$ = new yy.ProgramNode($$[$0 - 1], []);
                    break;
                case 5:
                    this.$ = new yy.ProgramNode($$[$0]);
                    break;
                case 6:
                    this.$ = new yy.ProgramNode([], []);
                    break;
                case 7:
                    this.$ = new yy.ProgramNode([]);
                    break;
                case 8:
                    this.$ = [$$[$0]];
                    break;
                case 9:
                    $$[$0 - 1].push($$[$0]);
                    this.$ = $$[$0 - 1];
                    break;
                case 10:
                    this.$ = new yy.BlockNode($$[$0 - 2], $$[$0 - 1].inverse, $$[$0 - 1], $$[$0]);
                    break;
                case 11:
                    this.$ = new yy.BlockNode($$[$0 - 2], $$[$0 - 1], $$[$0 - 1].inverse, $$[$0]);
                    break;
                case 12:
                    this.$ = $$[$0];
                    break;
                case 13:
                    this.$ = $$[$0];
                    break;
                case 14:
                    this.$ = new yy.ContentNode($$[$0]);
                    break;
                case 15:
                    this.$ = new yy.CommentNode($$[$0]);
                    break;
                case 16:
                    this.$ = new yy.MustacheNode($$[$0 - 1][0], $$[$0 - 1][1]);
                    break;
                case 17:
                    this.$ = new yy.MustacheNode($$[$0 - 1][0], $$[$0 - 1][1]);
                    break;
                case 18:
                    this.$ = $$[$0 - 1];
                    break;
                case 19:
                    this.$ = new yy.MustacheNode($$[$0 - 1][0], $$[$0 - 1][1]);
                    break;
                case 20:
                    this.$ = new yy.MustacheNode($$[$0 - 1][0], $$[$0 - 1][1], true);
                    break;
                case 21:
                    this.$ = new yy.PartialNode($$[$0 - 1]);
                    break;
                case 22:
                    this.$ = new yy.PartialNode($$[$0 - 2], $$[$0 - 1]);
                    break;
                case 23:
                    break;
                case 24:
                    this.$ = [[$$[$0 - 2]].concat($$[$0 - 1]), $$[$0]];
                    break;
                case 25:
                    this.$ = [[$$[$0 - 1]].concat($$[$0]), null];
                    break;
                case 26:
                    this.$ = [
                        [$$[$0 - 1]],
                        $$[$0]
                    ];
                    break;
                case 27:
                    this.$ = [
                        [$$[$0]],
                        null
                    ];
                    break;
                case 28:
                    this.$ = [
                        [new yy.DataNode($$[$0])],
                        null
                    ];
                    break;
                case 29:
                    $$[$0 - 1].push($$[$0]);
                    this.$ = $$[$0 - 1];
                    break;
                case 30:
                    this.$ = [$$[$0]];
                    break;
                case 31:
                    this.$ = $$[$0];
                    break;
                case 32:
                    this.$ = new yy.StringNode($$[$0]);
                    break;
                case 33:
                    this.$ = new yy.IntegerNode($$[$0]);
                    break;
                case 34:
                    this.$ = new yy.BooleanNode($$[$0]);
                    break;
                case 35:
                    this.$ = new yy.DataNode($$[$0]);
                    break;
                case 36:
                    this.$ = new yy.HashNode($$[$0]);
                    break;
                case 37:
                    $$[$0 - 1].push($$[$0]);
                    this.$ = $$[$0 - 1];
                    break;
                case 38:
                    this.$ = [$$[$0]];
                    break;
                case 39:
                    this.$ = [$$[$0 - 2], $$[$0]];
                    break;
                case 40:
                    this.$ = [$$[$0 - 2], new yy.StringNode($$[$0])];
                    break;
                case 41:
                    this.$ = [$$[$0 - 2], new yy.IntegerNode($$[$0])];
                    break;
                case 42:
                    this.$ = [$$[$0 - 2], new yy.BooleanNode($$[$0])];
                    break;
                case 43:
                    this.$ = [$$[$0 - 2], new yy.DataNode($$[$0])];
                    break;
                case 44:
                    this.$ = new yy.PartialNameNode($$[$0]);
                    break;
                case 45:
                    this.$ = new yy.IdNode($$[$0]);
                    break;
                case 46:
                    $$[$0 - 2].push($$[$0]);
                    this.$ = $$[$0 - 2];
                    break;
                case 47:
                    this.$ = [$$[$0]];
                    break;
            }
        },
        table: [
            {3: 1, 4: 2, 5: [2, 7], 6: 3, 7: 4, 8: 6, 9: 7, 11: 8, 12: 9, 13: 10, 14: [1, 11], 15: [1, 12], 16: [1, 13], 19: [1, 5], 22: [1, 14], 23: [1, 15], 24: [1, 16]},
            {1: [3]},
            {5: [1, 17]},
            {5: [2, 6], 7: 18, 8: 6, 9: 7, 11: 8, 12: 9, 13: 10, 14: [1, 11], 15: [1, 12], 16: [1, 13], 19: [1, 19], 20: [2, 6], 22: [1, 14], 23: [1, 15], 24: [1, 16]},
            {5: [2, 5], 6: 20, 8: 21, 9: 7, 11: 8, 12: 9, 13: 10, 14: [1, 11], 15: [1, 12], 16: [1, 13], 19: [1, 5], 20: [2, 5], 22: [1, 14], 23: [1, 15], 24: [1, 16]},
            {17: 23, 18: [1, 22], 21: 24, 28: [1, 25], 35: [1, 27], 38: 26},
            {5: [2, 8], 14: [2, 8], 15: [2, 8], 16: [2, 8], 19: [2, 8], 20: [2, 8], 22: [2, 8], 23: [2, 8], 24: [2, 8]},
            {4: 28, 6: 3, 7: 4, 8: 6, 9: 7, 11: 8, 12: 9, 13: 10, 14: [1, 11], 15: [1, 12], 16: [1, 13], 19: [1, 5], 20: [2, 7], 22: [1, 14], 23: [1, 15], 24: [1, 16]},
            {4: 29, 6: 3, 7: 4, 8: 6, 9: 7, 11: 8, 12: 9, 13: 10, 14: [1, 11], 15: [1, 12], 16: [1, 13], 19: [1, 5], 20: [2, 7], 22: [1, 14], 23: [1, 15], 24: [1, 16]},
            {5: [2, 12], 14: [2, 12], 15: [2, 12], 16: [2, 12], 19: [2, 12], 20: [2, 12], 22: [2, 12], 23: [2, 12], 24: [2, 12]},
            {5: [2, 13], 14: [2, 13], 15: [2, 13], 16: [2, 13], 19: [2, 13], 20: [2, 13], 22: [2, 13], 23: [2, 13], 24: [2, 13]},
            {5: [2, 14], 14: [2, 14], 15: [2, 14], 16: [2, 14], 19: [2, 14], 20: [2, 14], 22: [2, 14], 23: [2, 14], 24: [2, 14]},
            {5: [2, 15], 14: [2, 15], 15: [2, 15], 16: [2, 15], 19: [2, 15], 20: [2, 15], 22: [2, 15], 23: [2, 15], 24: [2, 15]},
            {17: 30, 21: 24, 28: [1, 25], 35: [1, 27], 38: 26},
            {17: 31, 21: 24, 28: [1, 25], 35: [1, 27], 38: 26},
            {17: 32, 21: 24, 28: [1, 25], 35: [1, 27], 38: 26},
            {25: 33, 37: [1, 34]},
            {1: [2, 1]},
            {5: [2, 2], 8: 21, 9: 7, 11: 8, 12: 9, 13: 10, 14: [1, 11], 15: [1, 12], 16: [1, 13], 19: [1, 19], 20: [2, 2], 22: [1, 14], 23: [1, 15], 24: [1, 16]},
            {17: 23, 21: 24, 28: [1, 25], 35: [1, 27], 38: 26},
            {5: [2, 4], 7: 35, 8: 6, 9: 7, 11: 8, 12: 9, 13: 10, 14: [1, 11], 15: [1, 12], 16: [1, 13], 19: [1, 19], 20: [2, 4], 22: [1, 14], 23: [1, 15], 24: [1, 16]},
            {5: [2, 9], 14: [2, 9], 15: [2, 9], 16: [2, 9], 19: [2, 9], 20: [2, 9], 22: [2, 9], 23: [2, 9], 24: [2, 9]},
            {5: [2, 23], 14: [2, 23], 15: [2, 23], 16: [2, 23], 19: [2, 23], 20: [2, 23], 22: [2, 23], 23: [2, 23], 24: [2, 23]},
            {18: [1, 36]},
            {18: [2, 27], 21: 41, 26: 37, 27: 38, 28: [1, 45], 29: 39, 30: [1, 42], 31: [1, 43], 32: [1, 44], 33: 40, 34: 46, 35: [1, 47], 38: 26},
            {18: [2, 28]},
            {18: [2, 45], 28: [2, 45], 30: [2, 45], 31: [2, 45], 32: [2, 45], 35: [2, 45], 39: [1, 48]},
            {18: [2, 47], 28: [2, 47], 30: [2, 47], 31: [2, 47], 32: [2, 47], 35: [2, 47], 39: [2, 47]},
            {10: 49, 20: [1, 50]},
            {10: 51, 20: [1, 50]},
            {18: [1, 52]},
            {18: [1, 53]},
            {18: [1, 54]},
            {18: [1, 55], 21: 56, 35: [1, 27], 38: 26},
            {18: [2, 44], 35: [2, 44]},
            {5: [2, 3], 8: 21, 9: 7, 11: 8, 12: 9, 13: 10, 14: [1, 11], 15: [1, 12], 16: [1, 13], 19: [1, 19], 20: [2, 3], 22: [1, 14], 23: [1, 15], 24: [1, 16]},
            {14: [2, 17], 15: [2, 17], 16: [2, 17], 19: [2, 17], 20: [2, 17], 22: [2, 17], 23: [2, 17], 24: [2, 17]},
            {18: [2, 25], 21: 41, 27: 57, 28: [1, 45], 29: 58, 30: [1, 42], 31: [1, 43], 32: [1, 44], 33: 40, 34: 46, 35: [1, 47], 38: 26},
            {18: [2, 26]},
            {18: [2, 30], 28: [2, 30], 30: [2, 30], 31: [2, 30], 32: [2, 30], 35: [2, 30]},
            {18: [2, 36], 34: 59, 35: [1, 60]},
            {18: [2, 31], 28: [2, 31], 30: [2, 31], 31: [2, 31], 32: [2, 31], 35: [2, 31]},
            {18: [2, 32], 28: [2, 32], 30: [2, 32], 31: [2, 32], 32: [2, 32], 35: [2, 32]},
            {18: [2, 33], 28: [2, 33], 30: [2, 33], 31: [2, 33], 32: [2, 33], 35: [2, 33]},
            {18: [2, 34], 28: [2, 34], 30: [2, 34], 31: [2, 34], 32: [2, 34], 35: [2, 34]},
            {18: [2, 35], 28: [2, 35], 30: [2, 35], 31: [2, 35], 32: [2, 35], 35: [2, 35]},
            {18: [2, 38], 35: [2, 38]},
            {18: [2, 47], 28: [2, 47], 30: [2, 47], 31: [2, 47], 32: [2, 47], 35: [2, 47], 36: [1, 61], 39: [2, 47]},
            {35: [1, 62]},
            {5: [2, 10], 14: [2, 10], 15: [2, 10], 16: [2, 10], 19: [2, 10], 20: [2, 10], 22: [2, 10], 23: [2, 10], 24: [2, 10]},
            {21: 63, 35: [1, 27], 38: 26},
            {5: [2, 11], 14: [2, 11], 15: [2, 11], 16: [2, 11], 19: [2, 11], 20: [2, 11], 22: [2, 11], 23: [2, 11], 24: [2, 11]},
            {14: [2, 16], 15: [2, 16], 16: [2, 16], 19: [2, 16], 20: [2, 16], 22: [2, 16], 23: [2, 16], 24: [2, 16]},
            {5: [2, 19], 14: [2, 19], 15: [2, 19], 16: [2, 19], 19: [2, 19], 20: [2, 19], 22: [2, 19], 23: [2, 19], 24: [2, 19]},
            {5: [2, 20], 14: [2, 20], 15: [2, 20], 16: [2, 20], 19: [2, 20], 20: [2, 20], 22: [2, 20], 23: [2, 20], 24: [2, 20]},
            {5: [2, 21], 14: [2, 21], 15: [2, 21], 16: [2, 21], 19: [2, 21], 20: [2, 21], 22: [2, 21], 23: [2, 21], 24: [2, 21]},
            {18: [1, 64]},
            {18: [2, 24]},
            {18: [2, 29], 28: [2, 29], 30: [2, 29], 31: [2, 29], 32: [2, 29], 35: [2, 29]},
            {18: [2, 37], 35: [2, 37]},
            {36: [1, 61]},
            {21: 65, 28: [1, 69], 30: [1, 66], 31: [1, 67], 32: [1, 68], 35: [1, 27], 38: 26},
            {18: [2, 46], 28: [2, 46], 30: [2, 46], 31: [2, 46], 32: [2, 46], 35: [2, 46], 39: [2, 46]},
            {18: [1, 70]},
            {5: [2, 22], 14: [2, 22], 15: [2, 22], 16: [2, 22], 19: [2, 22], 20: [2, 22], 22: [2, 22], 23: [2, 22], 24: [2, 22]},
            {18: [2, 39], 35: [2, 39]},
            {18: [2, 40], 35: [2, 40]},
            {18: [2, 41], 35: [2, 41]},
            {18: [2, 42], 35: [2, 42]},
            {18: [2, 43], 35: [2, 43]},
            {5: [2, 18], 14: [2, 18], 15: [2, 18], 16: [2, 18], 19: [2, 18], 20: [2, 18], 22: [2, 18], 23: [2, 18], 24: [2, 18]}
        ],
        defaultActions: {17: [2, 1], 25: [2, 28], 38: [2, 26], 57: [2, 24]},
        parseError: function parseError(str, hash) {
            throw new Error(str);
        },
        parse: function parse(input) {
            var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
            this.lexer.setInput(input);
            this.lexer.yy = this.yy;
            this.yy.lexer = this.lexer;
            this.yy.parser = this;
            if (typeof this.lexer.yylloc == "undefined")
                this.lexer.yylloc = {};
            var yyloc = this.lexer.yylloc;
            lstack.push(yyloc);
            var ranges = this.lexer.options && this.lexer.options.ranges;
            if (typeof this.yy.parseError === "function")
                this.parseError = this.yy.parseError;
            function popStack(n) {
                stack.length = stack.length - 2 * n;
                vstack.length = vstack.length - n;
                lstack.length = lstack.length - n;
            }

            function lex() {
                var token;
                token = self.lexer.lex() || 1;
                if (typeof token !== "number") {
                    token = self.symbols_[token] || token;
                }
                return token;
            }

            var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
            while (true) {
                state = stack[stack.length - 1];
                if (this.defaultActions[state]) {
                    action = this.defaultActions[state];
                } else {
                    if (symbol === null || typeof symbol == "undefined") {
                        symbol = lex();
                    }
                    action = table[state] && table[state][symbol];
                }
                if (typeof action === "undefined" || !action.length || !action[0]) {
                    var errStr = "";
                    if (!recovering) {
                        expected = [];
                        for (p in table[state])
                            if (this.terminals_[p] && p > 2) {
                                expected.push("'" + this.terminals_[p] + "'");
                            }
                        if (this.lexer.showPosition) {
                            errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                        } else {
                            errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1 ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
                        }
                        this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
                    }
                }
                if (action[0] instanceof Array && action.length > 1) {
                    throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
                }
                switch (action[0]) {
                    case 1:
                        stack.push(symbol);
                        vstack.push(this.lexer.yytext);
                        lstack.push(this.lexer.yylloc);
                        stack.push(action[1]);
                        symbol = null;
                        if (!preErrorSymbol) {
                            yyleng = this.lexer.yyleng;
                            yytext = this.lexer.yytext;
                            yylineno = this.lexer.yylineno;
                            yyloc = this.lexer.yylloc;
                            if (recovering > 0)
                                recovering--;
                        } else {
                            symbol = preErrorSymbol;
                            preErrorSymbol = null;
                        }
                        break;
                    case 2:
                        len = this.productions_[action[1]][1];
                        yyval.$ = vstack[vstack.length - len];
                        yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
                        if (ranges) {
                            yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
                        }
                        r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
                        if (typeof r !== "undefined") {
                            return r;
                        }
                        if (len) {
                            stack = stack.slice(0, -1 * len * 2);
                            vstack = vstack.slice(0, -1 * len);
                            lstack = lstack.slice(0, -1 * len);
                        }
                        stack.push(this.productions_[action[1]][0]);
                        vstack.push(yyval.$);
                        lstack.push(yyval._$);
                        newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                        stack.push(newState);
                        break;
                    case 3:
                        return true;
                }
            }
            return true;
        }
    };
    /* Jison generated lexer */
    var lexer = (function () {
        var lexer = ({EOF: 1,
            parseError: function parseError(str, hash) {
                if (this.yy.parser) {
                    this.yy.parser.parseError(str, hash);
                } else {
                    throw new Error(str);
                }
            },
            setInput: function (input) {
                this._input = input;
                this._more = this._less = this.done = false;
                this.yylineno = this.yyleng = 0;
                this.yytext = this.matched = this.match = '';
                this.conditionStack = ['INITIAL'];
                this.yylloc = {first_line: 1, first_column: 0, last_line: 1, last_column: 0};
                if (this.options.ranges) this.yylloc.range = [0, 0];
                this.offset = 0;
                return this;
            },
            input: function () {
                var ch = this._input[0];
                this.yytext += ch;
                this.yyleng++;
                this.offset++;
                this.match += ch;
                this.matched += ch;
                var lines = ch.match(/(?:\r\n?|\n).*/g);
                if (lines) {
                    this.yylineno++;
                    this.yylloc.last_line++;
                } else {
                    this.yylloc.last_column++;
                }
                if (this.options.ranges) this.yylloc.range[1]++;

                this._input = this._input.slice(1);
                return ch;
            },
            unput: function (ch) {
                var len = ch.length;
                var lines = ch.split(/(?:\r\n?|\n)/g);

                this._input = ch + this._input;
                this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
                //this.yyleng -= len;
                this.offset -= len;
                var oldLines = this.match.split(/(?:\r\n?|\n)/g);
                this.match = this.match.substr(0, this.match.length - 1);
                this.matched = this.matched.substr(0, this.matched.length - 1);

                if (lines.length - 1) this.yylineno -= lines.length - 1;
                var r = this.yylloc.range;

                this.yylloc = {first_line: this.yylloc.first_line,
                    last_line: this.yylineno + 1,
                    first_column: this.yylloc.first_column,
                    last_column: lines ?
                        (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length :
                        this.yylloc.first_column - len
                };

                if (this.options.ranges) {
                    this.yylloc.range = [r[0], r[0] + this.yyleng - len];
                }
                return this;
            },
            more: function () {
                this._more = true;
                return this;
            },
            less: function (n) {
                this.unput(this.match.slice(n));
            },
            pastInput: function () {
                var past = this.matched.substr(0, this.matched.length - this.match.length);
                return (past.length > 20 ? '...' : '') + past.substr(-20).replace(/\n/g, "");
            },
            upcomingInput: function () {
                var next = this.match;
                if (next.length < 20) {
                    next += this._input.substr(0, 20 - next.length);
                }
                return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
            },
            showPosition: function () {
                var pre = this.pastInput();
                var c = new Array(pre.length + 1).join("-");
                return pre + this.upcomingInput() + "\n" + c + "^";
            },
            next: function () {
                if (this.done) {
                    return this.EOF;
                }
                if (!this._input) this.done = true;

                var token,
                    match,
                    tempMatch,
                    index,
                    col,
                    lines;
                if (!this._more) {
                    this.yytext = '';
                    this.match = '';
                }
                var rules = this._currentRules();
                for (var i = 0; i < rules.length; i++) {
                    tempMatch = this._input.match(this.rules[rules[i]]);
                    if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                        match = tempMatch;
                        index = i;
                        if (!this.options.flex) break;
                    }
                }
                if (match) {
                    lines = match[0].match(/(?:\r\n?|\n).*/g);
                    if (lines) this.yylineno += lines.length;
                    this.yylloc = {first_line: this.yylloc.last_line,
                        last_line: this.yylineno + 1,
                        first_column: this.yylloc.last_column,
                        last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
                    this.yytext += match[0];
                    this.match += match[0];
                    this.matches = match;
                    this.yyleng = this.yytext.length;
                    if (this.options.ranges) {
                        this.yylloc.range = [this.offset, this.offset += this.yyleng];
                    }
                    this._more = false;
                    this._input = this._input.slice(match[0].length);
                    this.matched += match[0];
                    token = this.performAction.call(this, this.yy, this, rules[index], this.conditionStack[this.conditionStack.length - 1]);
                    if (this.done && this._input) this.done = false;
                    if (token) return token;
                    else return;
                }
                if (this._input === "") {
                    return this.EOF;
                } else {
                    return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(),
                        {text: "", token: null, line: this.yylineno});
                }
            },
            lex: function lex() {
                var r = this.next();
                if (typeof r !== 'undefined') {
                    return r;
                } else {
                    return this.lex();
                }
            },
            begin: function begin(condition) {
                this.conditionStack.push(condition);
            },
            popState: function popState() {
                return this.conditionStack.pop();
            },
            _currentRules: function _currentRules() {
                return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
            },
            topState: function () {
                return this.conditionStack[this.conditionStack.length - 2];
            },
            pushState: function begin(condition) {
                this.begin(condition);
            }});
        lexer.options = {};
        lexer.performAction = function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {

            var YYSTATE = YY_START
            switch ($avoiding_name_collisions) {
                case 0:
                    if (yy_.yytext.slice(-1) !== "\\") this.begin("mu");
                    if (yy_.yytext.slice(-1) === "\\") yy_.yytext = yy_.yytext.substr(0, yy_.yyleng - 1), this.begin("emu");
                    if (yy_.yytext) return 14;

                    break;
                case 1:
                    return 14;
                    break;
                case 2:
                    if (yy_.yytext.slice(-1) !== "\\") this.popState();
                    if (yy_.yytext.slice(-1) === "\\") yy_.yytext = yy_.yytext.substr(0, yy_.yyleng - 1);
                    return 14;

                    break;
                case 3:
                    yy_.yytext = yy_.yytext.substr(0, yy_.yyleng - 4);
                    this.popState();
                    return 15;
                    break;
                case 4:
                    this.begin("par");
                    return 24;
                    break;
                case 5:
                    return 16;
                    break;
                case 6:
                    return 20;
                    break;
                case 7:
                    return 19;
                    break;
                case 8:
                    return 19;
                    break;
                case 9:
                    return 23;
                    break;
                case 10:
                    return 23;
                    break;
                case 11:
                    this.popState();
                    this.begin('com');
                    break;
                case 12:
                    yy_.yytext = yy_.yytext.substr(3, yy_.yyleng - 5);
                    this.popState();
                    return 15;
                    break;
                case 13:
                    return 22;
                    break;
                case 14:
                    return 36;
                    break;
                case 15:
                    return 35;
                    break;
                case 16:
                    return 35;
                    break;
                case 17:
                    return 39;
                    break;
                case 18: /*ignore whitespace*/
                    break;
                case 19:
                    this.popState();
                    return 18;
                    break;
                case 20:
                    this.popState();
                    return 18;
                    break;
                case 21:
                    yy_.yytext = yy_.yytext.substr(1, yy_.yyleng - 2).replace(/\\"/g, '"');
                    return 30;
                    break;
                case 22:
                    yy_.yytext = yy_.yytext.substr(1, yy_.yyleng - 2).replace(/\\'/g, "'");
                    return 30;
                    break;
                case 23:
                    yy_.yytext = yy_.yytext.substr(1);
                    return 28;
                    break;
                case 24:
                    return 32;
                    break;
                case 25:
                    return 32;
                    break;
                case 26:
                    return 31;
                    break;
                case 27:
                    return 35;
                    break;
                case 28:
                    yy_.yytext = yy_.yytext.substr(1, yy_.yyleng - 2);
                    return 35;
                    break;
                case 29:
                    return 'INVALID';
                    break;
                case 30: /*ignore whitespace*/
                    break;
                case 31:
                    this.popState();
                    return 37;
                    break;
                case 32:
                    return 5;
                    break;
            }
        };
        lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|$)))/, /^(?:[\s\S]*?--\}\})/, /^(?:\{\{>)/, /^(?:\{\{#)/, /^(?:\{\{\/)/, /^(?:\{\{\^)/, /^(?:\{\{\s*else\b)/, /^(?:\{\{\{)/, /^(?:\{\{&)/, /^(?:\{\{!--)/, /^(?:\{\{![\s\S]*?\}\})/, /^(?:\{\{)/, /^(?:=)/, /^(?:\.(?=[} ]))/, /^(?:\.\.)/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}\}\})/, /^(?:\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@[a-zA-Z]+)/, /^(?:true(?=[}\s]))/, /^(?:false(?=[}\s]))/, /^(?:[0-9]+(?=[}\s]))/, /^(?:[a-zA-Z0-9_$-]+(?=[=}\s\/.]))/, /^(?:\[[^\]]*\])/, /^(?:.)/, /^(?:\s+)/, /^(?:[a-zA-Z0-9_$-/]+)/, /^(?:$)/];
        lexer.conditions = {"mu": {"rules": [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 32], "inclusive": false}, "emu": {"rules": [2], "inclusive": false}, "com": {"rules": [3], "inclusive": false}, "par": {"rules": [30, 31], "inclusive": false}, "INITIAL": {"rules": [0, 1, 32], "inclusive": true}};
        return lexer;
    })()
    parser.lexer = lexer;
    function Parser() {
        this.yy = {};
    }

    Parser.prototype = parser;
    parser.Parser = Parser;
    return new Parser;
})();
;
// lib/handlebars/compiler/base.js
Handlebars.Parser = handlebars;

Handlebars.parse = function (input) {

    // Just return if an already-compile AST was passed in.
    if (input.constructor === Handlebars.AST.ProgramNode) {
        return input;
    }

    Handlebars.Parser.yy = Handlebars.AST;
    return Handlebars.Parser.parse(input);
};

Handlebars.print = function (ast) {
    return new Handlebars.PrintVisitor().accept(ast);
};
;
// lib/handlebars/compiler/ast.js
(function () {

    Handlebars.AST = {};

    Handlebars.AST.ProgramNode = function (statements, inverse) {
        this.type = "program";
        this.statements = statements;
        if (inverse) {
            this.inverse = new Handlebars.AST.ProgramNode(inverse);
        }
    };

    Handlebars.AST.MustacheNode = function (rawParams, hash, unescaped) {
        this.type = "mustache";
        this.escaped = !unescaped;
        this.hash = hash;

        var id = this.id = rawParams[0];
        var params = this.params = rawParams.slice(1);

        // a mustache is an eligible helper if:
        // * its id is simple (a single part, not `this` or `..`)
        var eligibleHelper = this.eligibleHelper = id.isSimple;

        // a mustache is definitely a helper if:
        // * it is an eligible helper, and
        // * it has at least one parameter or hash segment
        this.isHelper = eligibleHelper && (params.length || hash);

        // if a mustache is an eligible helper but not a definite
        // helper, it is ambiguous, and will be resolved in a later
        // pass or at runtime.
    };

    Handlebars.AST.PartialNode = function (partialName, context) {
        this.type = "partial";
        this.partialName = partialName;
        this.context = context;
    };

    var verifyMatch = function (open, close) {
        if (open.original !== close.original) {
            throw new Handlebars.Exception(open.original + " doesn't match " + close.original);
        }
    };

    Handlebars.AST.BlockNode = function (mustache, program, inverse, close) {
        verifyMatch(mustache.id, close);
        this.type = "block";
        this.mustache = mustache;
        this.program = program;
        this.inverse = inverse;

        if (this.inverse && !this.program) {
            this.isInverse = true;
        }
    };

    Handlebars.AST.ContentNode = function (string) {
        this.type = "content";
        this.string = string;
    };

    Handlebars.AST.HashNode = function (pairs) {
        this.type = "hash";
        this.pairs = pairs;
    };

    Handlebars.AST.IdNode = function (parts) {
        this.type = "ID";
        this.original = parts.join(".");

        var dig = [], depth = 0;

        for (var i = 0, l = parts.length; i < l; i++) {
            var part = parts[i];

            if (part === ".." || part === "." || part === "this") {
                if (dig.length > 0) {
                    throw new Handlebars.Exception("Invalid path: " + this.original);
                }
                else if (part === "..") {
                    depth++;
                }
                else {
                    this.isScoped = true;
                }
            }
            else {
                dig.push(part);
            }
        }

        this.parts = dig;
        this.string = dig.join('.');
        this.depth = depth;

        // an ID is simple if it only has one part, and that part is not
        // `..` or `this`.
        this.isSimple = parts.length === 1 && !this.isScoped && depth === 0;

        this.stringModeValue = this.string;
    };

    Handlebars.AST.PartialNameNode = function (name) {
        this.type = "PARTIAL_NAME";
        this.name = name;
    };

    Handlebars.AST.DataNode = function (id) {
        this.type = "DATA";
        this.id = id;
    };

    Handlebars.AST.StringNode = function (string) {
        this.type = "STRING";
        this.string = string;
        this.stringModeValue = string;
    };

    Handlebars.AST.IntegerNode = function (integer) {
        this.type = "INTEGER";
        this.integer = integer;
        this.stringModeValue = Number(integer);
    };

    Handlebars.AST.BooleanNode = function (bool) {
        this.type = "BOOLEAN";
        this.bool = bool;
        this.stringModeValue = bool === "true";
    };

    Handlebars.AST.CommentNode = function (comment) {
        this.type = "comment";
        this.comment = comment;
    };

})();
;
// lib/handlebars/utils.js

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

Handlebars.Exception = function (message) {
    var tmp = Error.prototype.constructor.apply(this, arguments);

    // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
    for (var idx = 0; idx < errorProps.length; idx++) {
        this[errorProps[idx]] = tmp[errorProps[idx]];
    }
};
Handlebars.Exception.prototype = new Error();

// Build out our basic SafeString type
Handlebars.SafeString = function (string) {
    this.string = string;
};
Handlebars.SafeString.prototype.toString = function () {
    return this.string.toString();
};

(function () {
    var escape = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "`": "&#x60;"
    };

    var badChars = /[&<>"'`]/g;
    var possible = /[&<>"'`]/;

    var escapeChar = function (chr) {
        return escape[chr] || "&amp;";
    };

    Handlebars.Utils = {
        escapeExpression: function (string) {
            // don't escape SafeStrings, since they're already safe
            if (string instanceof Handlebars.SafeString) {
                return string.toString();
            } else if (string == null || string === false) {
                return "";
            }

            if (!possible.test(string)) {
                return string;
            }
            return string.replace(badChars, escapeChar);
        },

        isEmpty: function (value) {
            if (!value && value !== 0) {
                return true;
            } else if (Object.prototype.toString.call(value) === "[object Array]" && value.length === 0) {
                return true;
            } else {
                return false;
            }
        }
    };
})();
;
// lib/handlebars/compiler/compiler.js

/*jshint eqnull:true*/
Handlebars.Compiler = function () {
};
Handlebars.JavaScriptCompiler = function () {
};

(function (Compiler, JavaScriptCompiler) {
    // the foundHelper register will disambiguate helper lookup from finding a
    // function in a context. This is necessary for mustache compatibility, which
    // requires that context functions in blocks are evaluated by blockHelperMissing,
    // and then proceed as if the resulting value was provided to blockHelperMissing.

    Compiler.prototype = {
        compiler: Compiler,

        disassemble: function () {
            var opcodes = this.opcodes, opcode, out = [], params, param;

            for (var i = 0, l = opcodes.length; i < l; i++) {
                opcode = opcodes[i];

                if (opcode.opcode === 'DECLARE') {
                    out.push("DECLARE " + opcode.name + "=" + opcode.value);
                } else {
                    params = [];
                    for (var j = 0; j < opcode.args.length; j++) {
                        param = opcode.args[j];
                        if (typeof param === "string") {
                            param = "\"" + param.replace("\n", "\\n") + "\"";
                        }
                        params.push(param);
                    }
                    out.push(opcode.opcode + " " + params.join(" "));
                }
            }

            return out.join("\n");
        },
        equals: function (other) {
            var len = this.opcodes.length;
            if (other.opcodes.length !== len) {
                return false;
            }

            for (var i = 0; i < len; i++) {
                var opcode = this.opcodes[i],
                    otherOpcode = other.opcodes[i];
                if (opcode.opcode !== otherOpcode.opcode || opcode.args.length !== otherOpcode.args.length) {
                    return false;
                }
                for (var j = 0; j < opcode.args.length; j++) {
                    if (opcode.args[j] !== otherOpcode.args[j]) {
                        return false;
                    }
                }
            }
            return true;
        },

        guid: 0,

        compile: function (program, options) {
            this.children = [];
            this.depths = {list: []};
            this.options = options;

            // These changes will propagate to the other compiler components
            var knownHelpers = this.options.knownHelpers;
            this.options.knownHelpers = {
                'helperMissing': true,
                'blockHelperMissing': true,
                'each': true,
                'if': true,
                'unless': true,
                'with': true,
                'log': true
            };
            if (knownHelpers) {
                for (var name in knownHelpers) {
                    this.options.knownHelpers[name] = knownHelpers[name];
                }
            }

            return this.program(program);
        },

        accept: function (node) {
            return this[node.type](node);
        },

        program: function (program) {
            var statements = program.statements, statement;
            this.opcodes = [];

            for (var i = 0, l = statements.length; i < l; i++) {
                statement = statements[i];
                this[statement.type](statement);
            }
            this.isSimple = l === 1;

            this.depths.list = this.depths.list.sort(function (a, b) {
                return a - b;
            });

            return this;
        },

        compileProgram: function (program) {
            var result = new this.compiler().compile(program, this.options);
            var guid = this.guid++, depth;

            this.usePartial = this.usePartial || result.usePartial;

            this.children[guid] = result;

            for (var i = 0, l = result.depths.list.length; i < l; i++) {
                depth = result.depths.list[i];

                if (depth < 2) {
                    continue;
                }
                else {
                    this.addDepth(depth - 1);
                }
            }

            return guid;
        },

        block: function (block) {
            var mustache = block.mustache,
                program = block.program,
                inverse = block.inverse;

            if (program) {
                program = this.compileProgram(program);
            }

            if (inverse) {
                inverse = this.compileProgram(inverse);
            }

            var type = this.classifyMustache(mustache);

            if (type === "helper") {
                this.helperMustache(mustache, program, inverse);
            } else if (type === "simple") {
                this.simpleMustache(mustache);

                // now that the simple mustache is resolved, we need to
                // evaluate it by executing `blockHelperMissing`
                this.opcode('pushProgram', program);
                this.opcode('pushProgram', inverse);
                this.opcode('emptyHash');
                this.opcode('blockValue');
            } else {
                this.ambiguousMustache(mustache, program, inverse);

                // now that the simple mustache is resolved, we need to
                // evaluate it by executing `blockHelperMissing`
                this.opcode('pushProgram', program);
                this.opcode('pushProgram', inverse);
                this.opcode('emptyHash');
                this.opcode('ambiguousBlockValue');
            }

            this.opcode('append');
        },

        hash: function (hash) {
            var pairs = hash.pairs, pair, val;

            this.opcode('pushHash');

            for (var i = 0, l = pairs.length; i < l; i++) {
                pair = pairs[i];
                val = pair[1];

                if (this.options.stringParams) {
                    this.opcode('pushStringParam', val.stringModeValue, val.type);
                } else {
                    this.accept(val);
                }

                this.opcode('assignToHash', pair[0]);
            }
            this.opcode('popHash');
        },

        partial: function (partial) {
            var partialName = partial.partialName;
            this.usePartial = true;

            if (partial.context) {
                this.ID(partial.context);
            } else {
                this.opcode('push', 'depth0');
            }

            this.opcode('invokePartial', partialName.name);
            this.opcode('append');
        },

        content: function (content) {
            this.opcode('appendContent', content.string);
        },

        mustache: function (mustache) {
            var options = this.options;
            var type = this.classifyMustache(mustache);

            if (type === "simple") {
                this.simpleMustache(mustache);
            } else if (type === "helper") {
                this.helperMustache(mustache);
            } else {
                this.ambiguousMustache(mustache);
            }

            if (mustache.escaped && !options.noEscape) {
                this.opcode('appendEscaped');
            } else {
                this.opcode('append');
            }
        },

        ambiguousMustache: function (mustache, program, inverse) {
            var id = mustache.id,
                name = id.parts[0],
                isBlock = program != null || inverse != null;

            this.opcode('getContext', id.depth);

            this.opcode('pushProgram', program);
            this.opcode('pushProgram', inverse);

            this.opcode('invokeAmbiguous', name, isBlock);
        },

        simpleMustache: function (mustache) {
            var id = mustache.id;

            if (id.type === 'DATA') {
                this.DATA(id);
            } else if (id.parts.length) {
                this.ID(id);
            } else {
                // Simplified ID for `this`
                this.addDepth(id.depth);
                this.opcode('getContext', id.depth);
                this.opcode('pushContext');
            }

            this.opcode('resolvePossibleLambda');
        },

        helperMustache: function (mustache, program, inverse) {
            var params = this.setupFullMustacheParams(mustache, program, inverse),
                name = mustache.id.parts[0];

            if (this.options.knownHelpers[name]) {
                this.opcode('invokeKnownHelper', params.length, name);
            } else if (this.knownHelpersOnly) {
                throw new Error("You specified knownHelpersOnly, but used the unknown helper " + name);
            } else {
                this.opcode('invokeHelper', params.length, name);
            }
        },

        ID: function (id) {
            this.addDepth(id.depth);
            this.opcode('getContext', id.depth);

            var name = id.parts[0];
            if (!name) {
                this.opcode('pushContext');
            } else {
                this.opcode('lookupOnContext', id.parts[0]);
            }

            for (var i = 1, l = id.parts.length; i < l; i++) {
                this.opcode('lookup', id.parts[i]);
            }
        },

        DATA: function (data) {
            this.options.data = true;
            this.opcode('lookupData', data.id);
        },

        STRING: function (string) {
            this.opcode('pushString', string.string);
        },

        INTEGER: function (integer) {
            this.opcode('pushLiteral', integer.integer);
        },

        BOOLEAN: function (bool) {
            this.opcode('pushLiteral', bool.bool);
        },

        comment: function () {
        },

        // HELPERS
        opcode: function (name) {
            this.opcodes.push({ opcode: name, args: [].slice.call(arguments, 1) });
        },

        declare: function (name, value) {
            this.opcodes.push({ opcode: 'DECLARE', name: name, value: value });
        },

        addDepth: function (depth) {
            if (isNaN(depth)) {
                throw new Error("EWOT");
            }
            if (depth === 0) {
                return;
            }

            if (!this.depths[depth]) {
                this.depths[depth] = true;
                this.depths.list.push(depth);
            }
        },

        classifyMustache: function (mustache) {
            var isHelper = mustache.isHelper;
            var isEligible = mustache.eligibleHelper;
            var options = this.options;

            // if ambiguous, we can possibly resolve the ambiguity now
            if (isEligible && !isHelper) {
                var name = mustache.id.parts[0];

                if (options.knownHelpers[name]) {
                    isHelper = true;
                } else if (options.knownHelpersOnly) {
                    isEligible = false;
                }
            }

            if (isHelper) {
                return "helper";
            }
            else if (isEligible) {
                return "ambiguous";
            }
            else {
                return "simple";
            }
        },

        pushParams: function (params) {
            var i = params.length, param;

            while (i--) {
                param = params[i];

                if (this.options.stringParams) {
                    if (param.depth) {
                        this.addDepth(param.depth);
                    }

                    this.opcode('getContext', param.depth || 0);
                    this.opcode('pushStringParam', param.stringModeValue, param.type);
                } else {
                    this[param.type](param);
                }
            }
        },

        setupMustacheParams: function (mustache) {
            var params = mustache.params;
            this.pushParams(params);

            if (mustache.hash) {
                this.hash(mustache.hash);
            } else {
                this.opcode('emptyHash');
            }

            return params;
        },

        // this will replace setupMustacheParams when we're done
        setupFullMustacheParams: function (mustache, program, inverse) {
            var params = mustache.params;
            this.pushParams(params);

            this.opcode('pushProgram', program);
            this.opcode('pushProgram', inverse);

            if (mustache.hash) {
                this.hash(mustache.hash);
            } else {
                this.opcode('emptyHash');
            }

            return params;
        }
    };

    var Literal = function (value) {
        this.value = value;
    };

    JavaScriptCompiler.prototype = {
        // PUBLIC API: You can override these methods in a subclass to provide
        // alternative compiled forms for name lookup and buffering semantics
        nameLookup: function (parent, name /* , type*/) {
            if (/^[0-9]+$/.test(name)) {
                return parent + "[" + name + "]";
            } else if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
                return parent + "." + name;
            }
            else {
                return parent + "['" + name + "']";
            }
        },

        appendToBuffer: function (string) {
            if (this.environment.isSimple) {
                return "return " + string + ";";
            } else {
                return {
                    appendToBuffer: true,
                    content: string,
                    toString: function () {
                        return "buffer += " + string + ";";
                    }
                };
            }
        },

        initializeBuffer: function () {
            return this.quotedString("");
        },

        namespace: "Handlebars",
        // END PUBLIC API

        compile: function (environment, options, context, asObject) {
            this.environment = environment;
            this.options = options || {};

            Handlebars.log(Handlebars.logger.DEBUG, this.environment.disassemble() + "\n\n");

            this.name = this.environment.name;
            this.isChild = !!context;
            this.context = context || {
                programs: [],
                environments: [],
                aliases: { }
            };

            this.preamble();

            this.stackSlot = 0;
            this.stackVars = [];
            this.registers = { list: [] };
            this.compileStack = [];
            this.inlineStack = [];

            this.compileChildren(environment, options);

            var opcodes = environment.opcodes, opcode;

            this.i = 0;

            for (l = opcodes.length; this.i < l; this.i++) {
                opcode = opcodes[this.i];

                if (opcode.opcode === 'DECLARE') {
                    this[opcode.name] = opcode.value;
                } else {
                    this[opcode.opcode].apply(this, opcode.args);
                }
            }

            return this.createFunctionContext(asObject);
        },

        nextOpcode: function () {
            var opcodes = this.environment.opcodes;
            return opcodes[this.i + 1];
        },

        eat: function () {
            this.i = this.i + 1;
        },

        preamble: function () {
            var out = [];

            if (!this.isChild) {
                var namespace = this.namespace;
                var copies = "helpers = helpers || " + namespace + ".helpers;";
                if (this.environment.usePartial) {
                    copies = copies + " partials = partials || " + namespace + ".partials;";
                }
                if (this.options.data) {
                    copies = copies + " data = data || {};";
                }
                out.push(copies);
            } else {
                out.push('');
            }

            if (!this.environment.isSimple) {
                out.push(", buffer = " + this.initializeBuffer());
            } else {
                out.push("");
            }

            // track the last context pushed into place to allow skipping the
            // getContext opcode when it would be a noop
            this.lastContext = 0;
            this.source = out;
        },

        createFunctionContext: function (asObject) {
            var locals = this.stackVars.concat(this.registers.list);

            if (locals.length > 0) {
                this.source[1] = this.source[1] + ", " + locals.join(", ");
            }

            // Generate minimizer alias mappings
            if (!this.isChild) {
                for (var alias in this.context.aliases) {
                    this.source[1] = this.source[1] + ', ' + alias + '=' + this.context.aliases[alias];
                }
            }

            if (this.source[1]) {
                this.source[1] = "var " + this.source[1].substring(2) + ";";
            }

            // Merge children
            if (!this.isChild) {
                this.source[1] += '\n' + this.context.programs.join('\n') + '\n';
            }

            if (!this.environment.isSimple) {
                this.source.push("return buffer;");
            }

            var params = this.isChild ? ["depth0", "data"] : ["Handlebars", "depth0", "helpers", "partials", "data"];

            for (var i = 0, l = this.environment.depths.list.length; i < l; i++) {
                params.push("depth" + this.environment.depths.list[i]);
            }

            // Perform a second pass over the output to merge content when possible
            var source = this.mergeSource();

            if (!this.isChild) {
                var revision = Handlebars.COMPILER_REVISION,
                    versions = Handlebars.REVISION_CHANGES[revision];
                source = "this.compilerInfo = [" + revision + ",'" + versions + "'];\n" + source;
            }

            if (asObject) {
                params.push(source);

                return Function.apply(this, params);
            } else {
                var functionSource = 'function ' + (this.name || '') + '(' + params.join(',') + ') {\n  ' + source + '}';
                Handlebars.log(Handlebars.logger.DEBUG, functionSource + "\n\n");
                return functionSource;
            }
        },
        mergeSource: function () {
            // WARN: We are not handling the case where buffer is still populated as the source should
            // not have buffer append operations as their final action.
            var source = '',
                buffer;
            for (var i = 0, len = this.source.length; i < len; i++) {
                var line = this.source[i];
                if (line.appendToBuffer) {
                    if (buffer) {
                        buffer = buffer + '\n    + ' + line.content;
                    } else {
                        buffer = line.content;
                    }
                } else {
                    if (buffer) {
                        source += 'buffer += ' + buffer + ';\n  ';
                        buffer = undefined;
                    }
                    source += line + '\n  ';
                }
            }
            return source;
        },

        // [blockValue]
        //
        // On stack, before: hash, inverse, program, value
        // On stack, after: return value of blockHelperMissing
        //
        // The purpose of this opcode is to take a block of the form
        // `{{#foo}}...{{/foo}}`, resolve the value of `foo`, and
        // replace it on the stack with the result of properly
        // invoking blockHelperMissing.
        blockValue: function () {
            this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

            var params = ["depth0"];
            this.setupParams(0, params);

            this.replaceStack(function (current) {
                params.splice(1, 0, current);
                return "blockHelperMissing.call(" + params.join(", ") + ")";
            });
        },

        // [ambiguousBlockValue]
        //
        // On stack, before: hash, inverse, program, value
        // Compiler value, before: lastHelper=value of last found helper, if any
        // On stack, after, if no lastHelper: same as [blockValue]
        // On stack, after, if lastHelper: value
        ambiguousBlockValue: function () {
            this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

            var params = ["depth0"];
            this.setupParams(0, params);

            var current = this.topStack();
            params.splice(1, 0, current);

            // Use the options value generated from the invocation
            params[params.length - 1] = 'options';

            this.source.push("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
        },

        // [appendContent]
        //
        // On stack, before: ...
        // On stack, after: ...
        //
        // Appends the string value of `content` to the current buffer
        appendContent: function (content) {
            this.source.push(this.appendToBuffer(this.quotedString(content)));
        },

        // [append]
        //
        // On stack, before: value, ...
        // On stack, after: ...
        //
        // Coerces `value` to a String and appends it to the current buffer.
        //
        // If `value` is truthy, or 0, it is coerced into a string and appended
        // Otherwise, the empty string is appended
        append: function () {
            // Force anything that is inlined onto the stack so we don't have duplication
            // when we examine local
            this.flushInline();
            var local = this.popStack();
            this.source.push("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }");
            if (this.environment.isSimple) {
                this.source.push("else { " + this.appendToBuffer("''") + " }");
            }
        },

        // [appendEscaped]
        //
        // On stack, before: value, ...
        // On stack, after: ...
        //
        // Escape `value` and append it to the buffer
        appendEscaped: function () {
            this.context.aliases.escapeExpression = 'this.escapeExpression';

            this.source.push(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
        },

        // [getContext]
        //
        // On stack, before: ...
        // On stack, after: ...
        // Compiler value, after: lastContext=depth
        //
        // Set the value of the `lastContext` compiler value to the depth
        getContext: function (depth) {
            if (this.lastContext !== depth) {
                this.lastContext = depth;
            }
        },

        // [lookupOnContext]
        //
        // On stack, before: ...
        // On stack, after: currentContext[name], ...
        //
        // Looks up the value of `name` on the current context and pushes
        // it onto the stack.
        lookupOnContext: function (name) {
            this.push(this.nameLookup('depth' + this.lastContext, name, 'context'));
        },

        // [pushContext]
        //
        // On stack, before: ...
        // On stack, after: currentContext, ...
        //
        // Pushes the value of the current context onto the stack.
        pushContext: function () {
            this.pushStackLiteral('depth' + this.lastContext);
        },

        // [resolvePossibleLambda]
        //
        // On stack, before: value, ...
        // On stack, after: resolved value, ...
        //
        // If the `value` is a lambda, replace it on the stack by
        // the return value of the lambda
        resolvePossibleLambda: function () {
            this.context.aliases.functionType = '"function"';

            this.replaceStack(function (current) {
                return "typeof " + current + " === functionType ? " + current + ".apply(depth0) : " + current;
            });
        },

        // [lookup]
        //
        // On stack, before: value, ...
        // On stack, after: value[name], ...
        //
        // Replace the value on the stack with the result of looking
        // up `name` on `value`
        lookup: function (name) {
            this.replaceStack(function (current) {
                return current + " == null || " + current + " === false ? " + current + " : " + this.nameLookup(current, name, 'context');
            });
        },

        // [lookupData]
        //
        // On stack, before: ...
        // On stack, after: data[id], ...
        //
        // Push the result of looking up `id` on the current data
        lookupData: function (id) {
            this.push(this.nameLookup('data', id, 'data'));
        },

        // [pushStringParam]
        //
        // On stack, before: ...
        // On stack, after: string, currentContext, ...
        //
        // This opcode is designed for use in string mode, which
        // provides the string value of a parameter along with its
        // depth rather than resolving it immediately.
        pushStringParam: function (string, type) {
            this.pushStackLiteral('depth' + this.lastContext);

            this.pushString(type);

            if (typeof string === 'string') {
                this.pushString(string);
            } else {
                this.pushStackLiteral(string);
            }
        },

        emptyHash: function () {
            this.pushStackLiteral('{}');

            if (this.options.stringParams) {
                this.register('hashTypes', '{}');
            }
        },
        pushHash: function () {
            this.hash = {values: [], types: []};
        },
        popHash: function () {
            var hash = this.hash;
            this.hash = undefined;

            if (this.options.stringParams) {
                this.register('hashTypes', '{' + hash.types.join(',') + '}');
            }
            this.push('{\n    ' + hash.values.join(',\n    ') + '\n  }');
        },

        // [pushString]
        //
        // On stack, before: ...
        // On stack, after: quotedString(string), ...
        //
        // Push a quoted version of `string` onto the stack
        pushString: function (string) {
            this.pushStackLiteral(this.quotedString(string));
        },

        // [push]
        //
        // On stack, before: ...
        // On stack, after: expr, ...
        //
        // Push an expression onto the stack
        push: function (expr) {
            this.inlineStack.push(expr);
            return expr;
        },

        // [pushLiteral]
        //
        // On stack, before: ...
        // On stack, after: value, ...
        //
        // Pushes a value onto the stack. This operation prevents
        // the compiler from creating a temporary variable to hold
        // it.
        pushLiteral: function (value) {
            this.pushStackLiteral(value);
        },

        // [pushProgram]
        //
        // On stack, before: ...
        // On stack, after: program(guid), ...
        //
        // Push a program expression onto the stack. This takes
        // a compile-time guid and converts it into a runtime-accessible
        // expression.
        pushProgram: function (guid) {
            if (guid != null) {
                this.pushStackLiteral(this.programExpression(guid));
            } else {
                this.pushStackLiteral(null);
            }
        },

        // [invokeHelper]
        //
        // On stack, before: hash, inverse, program, params..., ...
        // On stack, after: result of helper invocation
        //
        // Pops off the helper's parameters, invokes the helper,
        // and pushes the helper's return value onto the stack.
        //
        // If the helper is not found, `helperMissing` is called.
        invokeHelper: function (paramSize, name) {
            this.context.aliases.helperMissing = 'helpers.helperMissing';

            var helper = this.lastHelper = this.setupHelper(paramSize, name, true);

            this.push(helper.name);
            this.replaceStack(function (name) {
                return name + ' ? ' + name + '.call(' +
                    helper.callParams + ") " + ": helperMissing.call(" +
                    helper.helperMissingParams + ")";
            });
        },

        // [invokeKnownHelper]
        //
        // On stack, before: hash, inverse, program, params..., ...
        // On stack, after: result of helper invocation
        //
        // This operation is used when the helper is known to exist,
        // so a `helperMissing` fallback is not required.
        invokeKnownHelper: function (paramSize, name) {
            var helper = this.setupHelper(paramSize, name);
            this.push(helper.name + ".call(" + helper.callParams + ")");
        },

        // [invokeAmbiguous]
        //
        // On stack, before: hash, inverse, program, params..., ...
        // On stack, after: result of disambiguation
        //
        // This operation is used when an expression like `{{foo}}`
        // is provided, but we don't know at compile-time whether it
        // is a helper or a path.
        //
        // This operation emits more code than the other options,
        // and can be avoided by passing the `knownHelpers` and
        // `knownHelpersOnly` flags at compile-time.
        invokeAmbiguous: function (name, helperCall) {
            this.context.aliases.functionType = '"function"';

            this.pushStackLiteral('{}');    // Hash value
            var helper = this.setupHelper(0, name, helperCall);

            var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

            var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');
            var nextStack = this.nextStack();

            this.source.push('if (' + nextStack + ' = ' + helperName + ') { ' + nextStack + ' = ' + nextStack + '.call(' + helper.callParams + '); }');
            this.source.push('else { ' + nextStack + ' = ' + nonHelper + '; ' + nextStack + ' = typeof ' + nextStack + ' === functionType ? ' + nextStack + '.apply(depth0) : ' + nextStack + '; }');
        },

        // [invokePartial]
        //
        // On stack, before: context, ...
        // On stack after: result of partial invocation
        //
        // This operation pops off a context, invokes a partial with that context,
        // and pushes the result of the invocation back.
        invokePartial: function (name) {
            var params = [this.nameLookup('partials', name, 'partial'), "'" + name + "'", this.popStack(), "helpers", "partials"];

            if (this.options.data) {
                params.push("data");
            }

            this.context.aliases.self = "this";
            this.push("self.invokePartial(" + params.join(", ") + ")");
        },

        // [assignToHash]
        //
        // On stack, before: value, hash, ...
        // On stack, after: hash, ...
        //
        // Pops a value and hash off the stack, assigns `hash[key] = value`
        // and pushes the hash back onto the stack.
        assignToHash: function (key) {
            var value = this.popStack(),
                type;

            if (this.options.stringParams) {
                type = this.popStack();
                this.popStack();
            }

            var hash = this.hash;
            if (type) {
                hash.types.push("'" + key + "': " + type);
            }
            hash.values.push("'" + key + "': (" + value + ")");
        },

        // HELPERS

        compiler: JavaScriptCompiler,

        compileChildren: function (environment, options) {
            var children = environment.children, child, compiler;

            for (var i = 0, l = children.length; i < l; i++) {
                child = children[i];
                compiler = new this.compiler();

                var index = this.matchExistingProgram(child);

                if (index == null) {
                    this.context.programs.push('');     // Placeholder to prevent name conflicts for nested children
                    index = this.context.programs.length;
                    child.index = index;
                    child.name = 'program' + index;
                    this.context.programs[index] = compiler.compile(child, options, this.context);
                    this.context.environments[index] = child;
                } else {
                    child.index = index;
                    child.name = 'program' + index;
                }
            }
        },
        matchExistingProgram: function (child) {
            for (var i = 0, len = this.context.environments.length; i < len; i++) {
                var environment = this.context.environments[i];
                if (environment && environment.equals(child)) {
                    return i;
                }
            }
        },

        programExpression: function (guid) {
            this.context.aliases.self = "this";

            if (guid == null) {
                return "self.noop";
            }

            var child = this.environment.children[guid],
                depths = child.depths.list, depth;

            var programParams = [child.index, child.name, "data"];

            for (var i = 0, l = depths.length; i < l; i++) {
                depth = depths[i];

                if (depth === 1) {
                    programParams.push("depth0");
                }
                else {
                    programParams.push("depth" + (depth - 1));
                }
            }

            if (depths.length === 0) {
                return "self.program(" + programParams.join(", ") + ")";
            } else {
                programParams.shift();
                return "self.programWithDepth(" + programParams.join(", ") + ")";
            }
        },

        register: function (name, val) {
            this.useRegister(name);
            this.source.push(name + " = " + val + ";");
        },

        useRegister: function (name) {
            if (!this.registers[name]) {
                this.registers[name] = true;
                this.registers.list.push(name);
            }
        },

        pushStackLiteral: function (item) {
            return this.push(new Literal(item));
        },

        pushStack: function (item) {
            this.flushInline();

            var stack = this.incrStack();
            if (item) {
                this.source.push(stack + " = " + item + ";");
            }
            this.compileStack.push(stack);
            return stack;
        },

        replaceStack: function (callback) {
            var prefix = '',
                inline = this.isInline(),
                stack;

            // If we are currently inline then we want to merge the inline statement into the
            // replacement statement via ','
            if (inline) {
                var top = this.popStack(true);

                if (top instanceof Literal) {
                    // Literals do not need to be inlined
                    stack = top.value;
                } else {
                    // Get or create the current stack name for use by the inline
                    var name = this.stackSlot ? this.topStackName() : this.incrStack();

                    prefix = '(' + this.push(name) + ' = ' + top + '),';
                    stack = this.topStack();
                }
            } else {
                stack = this.topStack();
            }

            var item = callback.call(this, stack);

            if (inline) {
                if (this.inlineStack.length || this.compileStack.length) {
                    this.popStack();
                }
                this.push('(' + prefix + item + ')');
            } else {
                // Prevent modification of the context depth variable. Through replaceStack
                if (!/^stack/.test(stack)) {
                    stack = this.nextStack();
                }

                this.source.push(stack + " = (" + prefix + item + ");");
            }
            return stack;
        },

        nextStack: function () {
            return this.pushStack();
        },

        incrStack: function () {
            this.stackSlot++;
            if (this.stackSlot > this.stackVars.length) {
                this.stackVars.push("stack" + this.stackSlot);
            }
            return this.topStackName();
        },
        topStackName: function () {
            return "stack" + this.stackSlot;
        },
        flushInline: function () {
            var inlineStack = this.inlineStack;
            if (inlineStack.length) {
                this.inlineStack = [];
                for (var i = 0, len = inlineStack.length; i < len; i++) {
                    var entry = inlineStack[i];
                    if (entry instanceof Literal) {
                        this.compileStack.push(entry);
                    } else {
                        this.pushStack(entry);
                    }
                }
            }
        },
        isInline: function () {
            return this.inlineStack.length;
        },

        popStack: function (wrapped) {
            var inline = this.isInline(),
                item = (inline ? this.inlineStack : this.compileStack).pop();

            if (!wrapped && (item instanceof Literal)) {
                return item.value;
            } else {
                if (!inline) {
                    this.stackSlot--;
                }
                return item;
            }
        },

        topStack: function (wrapped) {
            var stack = (this.isInline() ? this.inlineStack : this.compileStack),
                item = stack[stack.length - 1];

            if (!wrapped && (item instanceof Literal)) {
                return item.value;
            } else {
                return item;
            }
        },

        quotedString: function (str) {
            return '"' + str
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r') + '"';
        },

        setupHelper: function (paramSize, name, missingParams) {
            var params = [];
            this.setupParams(paramSize, params, missingParams);
            var foundHelper = this.nameLookup('helpers', name, 'helper');

            return {
                params: params,
                name: foundHelper,
                callParams: ["depth0"].concat(params).join(", "),
                helperMissingParams: missingParams && ["depth0", this.quotedString(name)].concat(params).join(", ")
            };
        },

        // the params and contexts arguments are passed in arrays
        // to fill in
        setupParams: function (paramSize, params, useRegister) {
            var options = [], contexts = [], types = [], param, inverse, program;

            options.push("hash:" + this.popStack());

            inverse = this.popStack();
            program = this.popStack();

            // Avoid setting fn and inverse if neither are set. This allows
            // helpers to do a check for `if (options.fn)`
            if (program || inverse) {
                if (!program) {
                    this.context.aliases.self = "this";
                    program = "self.noop";
                }

                if (!inverse) {
                    this.context.aliases.self = "this";
                    inverse = "self.noop";
                }

                options.push("inverse:" + inverse);
                options.push("fn:" + program);
            }

            for (var i = 0; i < paramSize; i++) {
                param = this.popStack();
                params.push(param);

                if (this.options.stringParams) {
                    types.push(this.popStack());
                    contexts.push(this.popStack());
                }
            }

            if (this.options.stringParams) {
                options.push("contexts:[" + contexts.join(",") + "]");
                options.push("types:[" + types.join(",") + "]");
                options.push("hashTypes:hashTypes");
            }

            if (this.options.data) {
                options.push("data:data");
            }

            options = "{" + options.join(",") + "}";
            if (useRegister) {
                this.register('options', options);
                params.push('options');
            } else {
                params.push(options);
            }
            return params.join(", ");
        }
    };

    var reservedWords = (
        "break else new var" +
            " case finally return void" +
            " catch for switch while" +
            " continue function this with" +
            " default if throw" +
            " delete in try" +
            " do instanceof typeof" +
            " abstract enum int short" +
            " boolean export interface static" +
            " byte extends long super" +
            " char final native synchronized" +
            " class float package throws" +
            " const goto private transient" +
            " debugger implements protected volatile" +
            " double import public let yield"
        ).split(" ");

    var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

    for (var i = 0, l = reservedWords.length; i < l; i++) {
        compilerWords[reservedWords[i]] = true;
    }

    JavaScriptCompiler.isValidJavaScriptVariableName = function (name) {
        if (!JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]+$/.test(name)) {
            return true;
        }
        return false;
    };

})(Handlebars.Compiler, Handlebars.JavaScriptCompiler);

Handlebars.precompile = function (input, options) {
    if (!input || (typeof input !== 'string' && input.constructor !== Handlebars.AST.ProgramNode)) {
        throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
    }

    options = options || {};
    if (!('data' in options)) {
        options.data = true;
    }
    var ast = Handlebars.parse(input);
    var environment = new Handlebars.Compiler().compile(ast, options);
    return new Handlebars.JavaScriptCompiler().compile(environment, options);
};

Handlebars.compile = function (input, options) {
    if (!input || (typeof input !== 'string' && input.constructor !== Handlebars.AST.ProgramNode)) {
        throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
    }

    options = options || {};
    if (!('data' in options)) {
        options.data = true;
    }
    var compiled;

    function compile() {
        var ast = Handlebars.parse(input);
        var environment = new Handlebars.Compiler().compile(ast, options);
        var templateSpec = new Handlebars.JavaScriptCompiler().compile(environment, options, undefined, true);
        return Handlebars.template(templateSpec);
    }

    // Template is only compiled on first use and cached after that point.
    return function (context, options) {
        if (!compiled) {
            compiled = compile();
        }
        return compiled.call(this, context, options);
    };
};
;
// lib/handlebars/runtime.js
Handlebars.VM = {
    template: function (templateSpec) {
        // Just add water
        var container = {
            escapeExpression: Handlebars.Utils.escapeExpression,
            invokePartial: Handlebars.VM.invokePartial,
            programs: [],
            program: function (i, fn, data) {
                var programWrapper = this.programs[i];
                if (data) {
                    return Handlebars.VM.program(fn, data);
                } else if (programWrapper) {
                    return programWrapper;
                } else {
                    programWrapper = this.programs[i] = Handlebars.VM.program(fn);
                    return programWrapper;
                }
            },
            programWithDepth: Handlebars.VM.programWithDepth,
            noop: Handlebars.VM.noop,
            compilerInfo: null
        };

        return function (context, options) {
            options = options || {};
            var result = templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);

            var compilerInfo = container.compilerInfo || [],
                compilerRevision = compilerInfo[0] || 1,
                currentRevision = Handlebars.COMPILER_REVISION;

            if (compilerRevision !== currentRevision) {
                if (compilerRevision < currentRevision) {
                    var runtimeVersions = Handlebars.REVISION_CHANGES[currentRevision],
                        compilerVersions = Handlebars.REVISION_CHANGES[compilerRevision];
                    throw "Template was precompiled with an older version of Handlebars than the current runtime. " +
                        "Please update your precompiler to a newer version (" + runtimeVersions + ") or downgrade your runtime to an older version (" + compilerVersions + ").";
                } else {
                    // Use the embedded version info since the runtime doesn't know about this revision yet
                    throw "Template was precompiled with a newer version of Handlebars than the current runtime. " +
                        "Please update your runtime to a newer version (" + compilerInfo[1] + ").";
                }
            }

            return result;
        };
    },

    programWithDepth: function (fn, data, $depth) {
        var args = Array.prototype.slice.call(arguments, 2);

        return function (context, options) {
            options = options || {};

            return fn.apply(this, [context, options.data || data].concat(args));
        };
    },
    program: function (fn, data) {
        return function (context, options) {
            options = options || {};

            return fn(context, options.data || data);
        };
    },
    noop: function () {
        return "";
    },
    invokePartial: function (partial, name, context, helpers, partials, data) {
        var options = { helpers: helpers, partials: partials, data: data };

        if (partial === undefined) {
            throw new Handlebars.Exception("The partial " + name + " could not be found");
        } else if (partial instanceof Function) {
            return partial(context, options);
        } else if (!Handlebars.compile) {
            throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
        } else {
            partials[name] = Handlebars.compile(partial, {data: data !== undefined});
            return partials[name](context, options);
        }
    }
};

Handlebars.template = Handlebars.VM.template;
;
// Avoid `console` errors in browsers that lack a console.
(function () {
    var method;
    var noop = function () {
    };
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

//request animation frame polyfil
(function () {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());
//global vars
var curLang = "en";
var curLayoutTag = null;
var isMobile = false;


function mainInit() {


    DETECTION.init();

    //initializing classes
    TEMPLATE.init();
    LAYOUT.init();
    PRELOAD.init();

    //initializing views
    VIEWS.init();


    if (DETECTION.isTouchDevice) {

        $(document).wipetouch({
            tapToClick: true
        });

        touchEvents();
    }
    else {
        mouseEvents();
    }

    //begin render loop
    animate();

    keyEvents();

    //resize
    $(window).resize();

}

//animate

function animate() {
    window.requestAnimationFrame(animate);
    renderLoop();
}

function renderLoop() {
    //render classes here
    VIEWS.animate();
}


function mouseEvents() {


    //global
    $("#content").mousedown(function (e) {
        getMousePoints(e);
        mouseTouchStart();
    });

    $("#content").mousemove(function (e) {
        getMousePoints(e);
        mouseTouchMove();
    });

    $("#content").mouseup(function (e) {
        getMousePoints(e);
        mouseTouchEnd();
    });

    function getMousePoints(e) {
        var mouseX = e.pageX;
        var mouseY = e.pageY;
        setMousePoints(mouseX, mouseY);
    }
}

function touchEvents() {

    document.ontouchstart = function (e) {

        var touchY = e.touches[0].pageY;
        var touchX = e.touches[0].pageX;
        setMousePoints(touchX, touchY);
        mouseTouchStart();

    };
    document.ontouchmove = function (e) {

        // console.log(e.touches[0].screenX)
        var touchY = e.touches[0].pageY;
        var touchX = e.touches[0].pageX;
        setMousePoints(touchX, touchY);
        mouseTouchMove();
    };
    document.ontouchend = function (e) {
        // var touchY = e.screenY;
        // var touchX = e.screenX;
        // setMousePoints(touchX, touchY);
        mouseTouchEnd();
    };
}

function setMousePoints(x, y) {
    CONFIG.mouseX = x;

    CONFIG.mouseY = y;
    // console.log(x , y )
}


//global mouse/touch triggers
function mouseTouchStart() {
    VIEWS.mousedown();
}

function mouseTouchEnd() {
    VIEWS.mouseup();
}

function mouseTouchMove() {
    VIEWS.mousemove();
}

//keyboard events
function keyEvents() {

    $(window).keyup(function (e) {
        //console.log("KEY PRESSED");
        var charCode = e.which;
        console.log(charCode);
        if (charCode == 78) {
            // goButtonClick();
            plinkoView.reset();
        }
    });
}

//resize logic

$(window).resize(function () {



    //resize this first
    LAYOUT.preResize();
    DETECTION.resize();

    //then other things
    LAYOUT.resize();

    //resizing views
    VIEWS.resize();

});


var CONFIG = CONFIG || {};

(function configClass() {

    var self = CONFIG;

    self.curURL = document.URL;

    //config
    self.assetPath = "" + "assets";
    self.imagePath = self.assetPath + "/img/";
    self.videoPath = "";
    self.AWSPath = "";
    self.prodURL = "";
    self.FBAppId = "485648611506722";  // Production facebook app id

    //global
    self.windowHeight = 0;
    self.windowWidth = 0;

    self.contentHeight = 0;
    self.contentWidth = 0;

    self.mouseX = 0;
    self.mouseY = 0;

    //debug variables
    self.isDev = false;


    function init() {
        isDebug();
        URLConditions();
    }

    function isDebug() {
        var debugHostArray = ["locaasdslhost"];
        for (var i = 0; i < debugHostArray.length; i++) {
            if (checkConfigString(debugHostArray[i], self.curURL)) {
                self.isDev = true;
            }
        }
    }

    function URLConditions() {
        var curURL = self.curURL;

        //prod exceptions

    }

    function checkConfigString(checkString, targetString) {
        var contains = false;
        var index = targetString.indexOf(checkString);
        if (index >= 0) {
            return { "index": index }
        }
        else {
            return false;
        }
    }

    init();

})(CONFIG)


var preloadData = {
    //config
    defaultSections: ["global"],
    imagePath: CONFIG.imagePath,

    sections: {
        "global": []
    }

}


var imageGroups = {

    "plinko": {
        type: "list",
        data: [
            { name: "bg", url: "views/plinko/bg.jpg" },
            { name: "disk", url: "views/plinko/disk.png" },
            { name: "board", url: "views/plinko/board.png" },
            { name: "nail", url: "views/plinko/nail.png" },
            { name: "bucket-front", url: "views/plinko/bucket-front.png" },
            { name: "bucket-back", url: "views/plinko/bucket-back.png" },
            { name: "title", url: "views/plinko/title.png" },

            { name: "social-facebook", url: "views/plinko/social-icon-facebook.png" },
            { name: "social-twitter", url: "views/plinko/social-icon-twitter.png" },
            { name: "social-mail", url: "views/plinko/social-icon-mail.png" }


        ]
    },
    "mrPeanut": {
        type: "sequence",
        data: {
            url: "views/plinko/mrPeanut_sequence/plinko_",
            padding: 3,
            numImages: 38,
            extension: "png",
            skipFrames: 0
        }
    }
}


var copyData = {

    "global": {
        // to use : {{global "name"}}
        // videoDisabled : "this camera is clogged with toppings!"
    },

    "test": {
        "array": [
            {
                test1: "copy",
                test2: "copy"
            }
        ]
    },
    "social": {
        fb: {
            title: "plinko",
            body: "plinko"
        },
        tw: 'plinko',
        mail: {
            subject: "You have been sent a little GO-tivation",
            body: 'Hey there space cadet, lost in the stars as of late? Well no longer, because Mr. Peanut’s new mini-game, “Shoot for the Moon” is destined to bring you back down to Earth, then send you back into the stratosphere. This time with a rocket-fueled jetpack of energy.  Play at'
        }

    },
    "instructions": {
        title: "Mr. Peanut\'s Peg-O-Energy",
        body: "Step right up folks, I've got energy prizes just waiting to be won by someone just like you. And by someone I mean anyone, because this is all luck. There's actually very little skill involved, but hey, I won't tell anyone.",
        buttonCopy: "play",
        instructions: [
            "1. Mouse over the top to get your chip.",
            "2. Move your chip left/right with your cursor and click to drop.",
            "3. Wait to see if you're a winner. At this point, you'll either high-five the computer screen or sob uncontrollably at your desk."
        ]
    }
}
function sequencerClass(_config) {
    var self = this;

    var imgArray = null;
    var el = null;
    var curImg = -1;
    var numImages = 0;
    var dim = null;
    var newDim = null;

    var playInterval = null;

    var isPaused = false;
    var isPlaying = false;

    var canvasRef = null;
    var ctxRef = null;
    var canvasContainer = null;

    var scale = 1;

    var config = {
        "loop": true,
        "autoplay": true,
        "playInterval": 40,
        "transparent": false,
        "specialHeight": false,
        "element": null,
        "showFirstFrame": true
    }

    self.init = function (_imgArray) {

        //mergin config
        for (key in _config)
            config[key] = _config[key];

        //global variables
        imgArray = _imgArray;
        el = config.element;
        numImages = imgArray.length;
        dim = imgArray[0].imgDim;
        console.log(dim)

        if (el == null) {
            //console.log("SEQUENCER :: no element provided")
        }

        //trigering load
        $(self).trigger(self.VIDEO_LOADED);

        createCanvas();

        applyCSS();

        self.resize();
        showImage(0);

        if (config.autoplay)
            self.play();

        if (config.showFirstFrame)
            showPlayer();
        else
            hidePlayer();

        $(window).resize(function () {
            self.resize();
        });


    }
    //getters

    self.getElement = function () {
        return el;
    }

    self.getImageDim = function () {
        console.log("AAHHH")
        console.log(dim)
        return dim;
    }

    self.getDim = function () {
        return newDim;
    }

    //controls

    self.play = function () {

        if (playInterval == null)
            playInterval = setInterval(nextImage, config.playInterval);

        isPlaying = true;

        showPlayer();

    }

    self.stop = function () {
        isPlaying = false;
        clearInterval(playInterval);
        playInterval = null;
    }

    self.pause = function () {
        self.stop();
    }

    self.reset = function () {
        curImg = -1;
    }

    self.destroy = function () {
        self.reset();
    }

    function applyCSS() {
        canvasContainer.css({
            "position": "absolute"
        });

        canvasContainer.find("canvas").css({
            "position": "absolute",
            "width": "100%",
            "height": "100%"
        });

    }

    function showPlayer() {
        canvasContainer.css({
            "visibility": "visible",
            "left": "0px"
        });
        self.resize();
    }

    function hidePlayer() {
        canvasContainer.css({
            "visibility": "hidden",
            "left": "-9999px"
        })
    }

    function nextImage() {

        if (!isPlaying)
            return

        if (config.transparent) {
            ctxRef.clearRect(0, 0, canvasRef.width, canvasRef.height);
        }

        if (curImg < numImages - 1) {
            curImg++;
        }
        else {
            $(self).trigger(self.VIDEO_FINISHED);
            if (config.loop)
                curImg = 0
            else
                self.stop();
        }
        showImage(curImg);
    }

    function createCanvas() {

        canvasRef = UTILS.generateCanvas(dim);

        ctxRef = canvasRef.getContext("2d");

        canvasContainer = $("<div>", {
            "class": "canvas-container"
        })

        canvasContainer.html(canvasRef);

        el.html(canvasContainer)
    }

    function showImage(index) {
        if (index >= 0 && index < imgArray.length) {
            ctxRef.drawImage(imgArray[index], 0, 0);
        }
    }


    self.scaleResize = function (_scale) {
        if (canvasRef) {
            scale = _scale;
            self.resize();
        }
    }


    self.resize = function () {
        if (!dim || !canvasRef)
            return;

        var destW = el.width();
        var destH = el.height();

        newDim = UTILS.resizeWithExcessCalc(dim.w, dim.h, 0, destW, destH);

        var newW = newDim.w * scale;
        var newH = newDim.h * scale;

        canvasContainer.css({
            "width": newW,
            "height": newH,
            "top": (destH - newH ) / 2,
            "left": (destW - newW ) / 2
        })
    }


}

sequencerClass.prototype.VIDEO_FINISHED = "videoFinished";
sequencerClass.prototype.VIDEO_LOADED = "videoLoaded";

var UTILS = UTILS || {};

(function () {

    var self = UTILS;

    self.mouseOverObjectHash = {};
    self.mouseOverObjectArray = [];

    self.mouseOverObject = function (obj) {

        var name = obj.attr("id");
        var curObj = self.mouseOverObjectHash[name];

        if (!curObj) {
            curObj = {};

            curObj.el = obj;

            self.mouseOverObjectHash[name] = curObj;
            self.mouseOverObjectArray.push(name);

        }

        curObj.u = curObj.el.offset().top;
        curObj.l = curObj.el.offset().left;
        curObj.d = curObj.u + curObj.el.height();
        curObj.r = curObj.l + curObj.el.width();

        var u, r, d, l;

        u = curObj.u;
        r = curObj.r;
        d = curObj.d;
        l = curObj.l;

        var mouseX = CONFIG.mouseX;
        var mouseY = CONFIG.mouseY;


        if (mouseX > l && mouseX < r && mouseY > u && mouseY < d) {
            return true
        }
        else {
            return false
        }

    }

    self.mousePosOnObject = function (name) {

        var mouseX = CONFIG.mouseX;
        var mouseY = CONFIG.mouseY;

        var objX = self.mouseOverObjectHash[name].l;
        var objY = self.mouseOverObjectHash[name].u;

        var drawX = mouseX - objX;
        var drawY = mouseY - objY;

        var drawObj = {"x": drawX, "y": drawY };
        return drawObj

    }

    self.mousePosOnHitArea = function (coords) {

        var l, u, w, h;

        l = coords[0] * CONFIG.windowWidth;
        u = coords[1] * CONFIG.windowHeight;
        w = coords[2] * CONFIG.windowWidth;
        h = coords[3] * CONFIG.windowHeight;

        var mouseX = CONFIG.mouseX;
        var mouseY = CONFIG.mouseY;

        if (mouseX > l && mouseX < l + w && mouseY > u && mouseY < u + h) {
            return true
        }
        else {
            return false
        }
    }

    self.mouseOnRect = function (_rect) {

        var l, u, w, h;

        l = _rect.x;
        u = _rect.y;
        w = _rect.w;
        h = _rect.h;

        var mouseX = CONFIG.mouseX;
        var mouseY = CONFIG.mouseY;

        if (mouseX > l && mouseX < l + w && mouseY > u && mouseY < u + h) {
            return true
        }
        else {
            return false
        }
    }

    self.resizeWithExcessCalc = function (imgW, imgH, _excess, toW, toH) {

        var boundH;
        var boundW;

        if (!toW && !toH) {
            boundH = CONFIG.windowHeight;
            boundW = CONFIG.windowWidth;
        }
        else {
            boundH = toH;
            boundW = toW;
        }

        var newWidth;
        var newHeight;
        var excess = _excess;
        var hExcess;
        var wExcess;

        //fitting image to smallest orientation
        var whRatio = imgW - imgH;

        if (whRatio > 0) {
            wExcess = excess;
            hExcess = imgH / imgW * excess;
            newHeight = boundH;
            newWidth = imgW / ( imgH / newHeight );

        }
        else {
            hExcess = excess;
            wExcess = imgW / imgH * excess;
            newWidth = boundW;
            newHeight = imgH / ( imgW / newWidth );
        }

        //scaling up if one orientation isnt contained

        var wRatio = newWidth / boundW;
        var hRatio = newHeight / boundH;

        var excessNeeded = 1;

        if (wRatio < 1) {
            excessNeeded = wRatio;
        }
        if (hRatio < 1) {
            excessNeeded = hRatio;
        }

        var returnHeight = newHeight / (excessNeeded) + hExcess;
        var returnWidth = newWidth / (excessNeeded) + wExcess;
        var returnLeft = (boundW - returnWidth ) / 2;
        var returnTop = (boundH - returnHeight ) / 2;

        return { "h": Math.round(returnHeight), "w": Math.round(returnWidth), "l": Math.round(returnLeft), "t": Math.round(returnTop) }

    }

    self.fitToSmallest = function (w1, h1, w2, h2) {

        var whRatio = w1 - h1;
        var newHeight , newWidth;

        if (whRatio > 0) {
            newHeight = h2;
            newWidth = w1 / ( h1 / newHeight );

        }
        else {
            newWidth = w2;
            newHeight = h1 / ( w1 / newWidth );
        }

        return( {"w": newWidth, "h": newHeight, "l": (w2 - newWidth) / 2, "t": (h2 - newHeight) / 2 } )
    }

    //math


    self.clamp = function (val, min, max) {

        return Math.max(min, Math.min(max, val));

    }

    self.getDist = function (x1, x2, y1, y2) {
        var distX = Math.abs(x2 - x1);
        var distY = Math.abs(y2 - y1);
        var dist = Math.sqrt(distX * distX + distY * distY);

        var distObj = { "x": distX, "y": distY, "total": dist}


        return distObj;
    }

    self.reflectVel = function (p1, p2, v) {
        var damp = .5;
        var offset = {
            x: p2.x - p1.x,
            y: p2.y - p1.y
        };

        var reverseVel = {
            x: -v.x,
            y: -v.y
        };

        var offsetMagnitude = Math.sqrt(offset.x * offset.x + offset.y * offset.y);
        var reverseVelMagnitude = Math.sqrt(reverseVel.x * reverseVel.x + reverseVel.y * reverseVel.y);
        var dotProd = offset.x * reverseVel.x + offset.y * reverseVel.y;
        var theta = Math.acos(dotProd / (offsetMagnitude * reverseVelMagnitude));
        var normalDir = offset.x < 0 ? -1 : 1;
        var unitNormal = {
            x: -offset.y / offsetMagnitude * normalDir,
            y: offset.x / offsetMagnitude * normalDir
        };

        var orthMag = Math.sin(theta) * reverseVelMagnitude;
        var velDiff = {
            x: unitNormal.x * 2 * orthMag,
            y: unitNormal.y * 2 * orthMag
        }

        var rotVel = .5 * orthMag * 2 / 20 * normalDir;

        return {x: damp * (reverseVel.x + velDiff.x), y: damp * (reverseVel.y + velDiff.y), rot: rotVel}
    }

    self.getAngle = function (p1x, p1y, p2x, p2y) {

        var deltaX = p1x - p2x;
        var deltaY = p1y - p2y;

        var angleInDegrees = Math.atan2(deltaY, deltaX);//  * 180 / Math.PI ;

        if (angleInDegrees < 0) {
            angleInDegrees = 2 * Math.PI - Math.abs(angleInDegrees);
        }
        // else if(angleInDegrees > (2 * Math.PI) )
        // {
        //   angleInDegrees = angleInDegrees - (2*Math.PI);
        // }
        return angleInDegrees
    }

    self.getRand = function (v1, v2) {
        return (v1 + Math.random() * ( v2 - v1) )
    }

    self.getRandFloored = function (v1, v2) {
        return Math.floor((v1 + Math.random() * ( v2 - v1) ))
    }

    self.weightedRoll = function (_rA) {
        var total = 0;
        for (var i = 0; i < _rA.length; i++) {
            total += _rA[i];
        }


        var rand = Math.random() * total;

        // console.log(rand);

        var comul = 0;
        var lastIndex = 0;

        for (var i = 0; i < _rA.length; i++) {
            comul += _rA[i]
            if (comul >= rand) {
                lastIndex = i;
                break;
            }
        }

        return i;

    }

    //making objects
    self.makePoint = function (x, y) {
        return { "x": x, "y": y }
    }

    self.makeRect = function (x, y, w, h) {
        return { "x": x, "y": y, "w": w, "h": h}
    }


    //color

    self.hexToRgb = function (hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    self.createColor = function (r, g, b) {
        return ( { "r": r, "g": g, "b": g }  );
    }

    //array utils

    self.shuffleArray = function (o) { //v1.0
        for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

    self.swapArrayElements = function (index1, index2, array) {
        var b = array[index1];
        array[index1] = array[index2];
        array[index2] = b;

        return array;
    }

    self.randomArrayElement = function (array) {
        return array[ Math.floor(array.length * Math.random()) ]
    }


    self.tryMethodOnArray = function (methodName, array) {
        for (var i = 0; i < array.length; i++) {
            var tA = array[i];

            if (tA[methodName]) {
                tA[methodName]();
            }
        }
    }

    self.checkString = function (checkString, targetString) {
        var contains = false;
        var index = targetString.indexOf(checkString);
        if (index >= 0) {
            return { "index": index }
        }
        else {
            return false;
        }
    }

    //string manipulation utils
    self.zeroPad = function (num, size) {
        var s = "000000000000" + num;
        return s.substr(s.length - size);
    }

    //canvas utils

    self.getPixel = function (imgData, x, y) {
        var offset = (x + y * imgData.width) * 4;
        var r = imgData.data[offset + 0];
        var g = imgData.data[offset + 1];
        var b = imgData.data[offset + 2];
        var a = imgData.data[offset + 3];

        return [r, g, b, a];
    }


    self.createCanvasTexture = function (type, size, size2) {
        var tempC = document.createElement('canvas');
        var tempCtx = tempC.getContext("2d");

        tempC.width = tempCtx.width = size;
        tempC.height = tempCtx.height = size;

        if (type == "circle") {
            tempCtx.fillStyle = "#000000";
            tempCtx.beginPath();
            tempCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
            tempCtx.closePath();
            tempCtx.fill();
        }
        else if (type == "rect") {
            tempCtx.fillStyle = "#000000";
            tempCtx.fillRect(0, 0, size, size2);
        }

        return tempC
    }


    self.createCanvasDefault = function (type, _config) {


        config = {
            width: 0,
            height: 0,
            radius: 0,
            color: "#000000"
        }

        for (key in _config) {
            config[key] = _config[key]
        }

        var sizeW = config.width || config.radius * 2;
        var sizeH = config.height || config.radius * 2;

        var tempC = document.createElement('canvas');
        var tempCtx = tempC.getContext("2d");

        tempC.width = tempCtx.width = sizeW;
        tempC.height = tempCtx.height = sizeH;

        tempCtx.fillStyle = config.color;

        if (type == "circle") {
            tempCtx.beginPath();
            tempCtx.arc(config.radius, config.radius, config.radius, 0, Math.PI * 2, true);
            tempCtx.closePath();
            tempCtx.fill();
        }
        else if (type == "rect") {
            tempCtx.fillRect(0, 0, config.width, config.height);
        }

        return tempC
    }

    self.generateCanvas = function (dim) {

        var tempC = document.createElement('canvas');
        var tempCtx = tempC.getContext("2d");

        tempC.width = tempCtx.width = dim.w;
        tempC.height = tempCtx.height = dim.h;


        return tempC
    }


    self.imgToCanvas = function (img, w, h) {
        var tempC = document.createElement('canvas');
        var tempCtx = tempC.getContext("2d");

        tempC.width = tempCtx.width = w;
        tempC.height = tempCtx.height = h;

        tempCtx.drawImage(img, 0, 0, w, h);

        return tempC
    }


})(UTILS)
var DETECTION = DETECTION || {};

(function detectionClass() {

    var self = DETECTION;

    self.isMobile = null;
    self.isTouchDevice = null;

    self.isIpad = null;
    self.isIphone = null;
    self.isIE8 = null;
    self.isIE9 = null;

    self.supportType = null;

    //browser detect
    self.appVersion = null;
    self.browser = null;
    self.browserVersion = null;
    self.OS = null;

    self.init = function () {

        browserDetect();


        self.isTouchDevice = isTouchDevice();
        self.isIpad = isIpad();
        self.isIphone = isIphone();

        self.isAndroid = isAndroid();

        self.isIE8 = isIE8();
        self.isIE9 = isIE9();

        self.isInFacebook = isInFacebook();

        self.supportType = getSupportType();

        if (self.isIpad) {
            $("body").addClass("isIpad");
        }


    }

    //public functions

    self.isTouch = function () {
        return !!('ontouchstart' in window)
    }


    //resize used to check if is mobile and other stuff
    self.resize = function () {
        self.isMobile = !!(curLayoutTag == "mobile");
    }

    //private functions

    //get general support 

    function getSupportType() {

        var supportType = null;

        if (self.browser == "Explorer" && self.browserVersion == "8") {
            supportType = "IE8"
        }

        if (self.isIphone || self.isIpad || self.isAndroid) {
            supportType = "noFlash";
        }

        return supportType;
    }

    function isTouchDevice() {
        var is = false;

        if (self.isTouch())
            is = true;

        // return true
        return is;
    }

    function isInFacebook() {
        var is = false;


        if (self.isIphone && self.browser == "Safari" && self.browserVersion == "an unknown version") {
            is = true;
        }

        return is;

    }


    function isAndroid() {
        var is = false;
        if (self.isTouchDevice && !(self.isIpad || self.isIphone)) {
            is = true;
        }
        // return true
        return is;
    }


    function isIE8() {
        var is = false;

        if (self.browser == "Explorer" && self.browserVersion == "8") {
            is = true;
        }

        // return true
        return is;
    }

    function isIE9() {
        var is = false;

        if (self.browser == "Explorer" && self.browserVersion == "9") {
            is = true;
        }

        //return true
        return is;
    }


    function isIpad() {
        var i = 0,
            iOS = false,
            iDevice = ['iPad'];

        for (; i < iDevice.length; i++) {
            if (navigator.platform === iDevice[i]) {
                iOS = true;
                break;
            }
        }

        // return true
        return iOS
    }

    function isIphone() {
        var i = 0,
            iOS = false,
            iDevice = ['iPhone'];

        for (; i < iDevice.length; i++) {
            if (navigator.platform === iDevice[i]) {
                iOS = true;
                break;
            }
        }

        // return true;
        return iOS
    }

    //browser detection 

    function browserDetect() {
        var BrowserDetect = {
            init: function () {
                this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
                this.version = this.searchVersion(navigator.userAgent)
                    || this.searchVersion(navigator.appVersion)
                    || "an unknown version";
                this.OS = this.searchString(this.dataOS) || "unknown";

                //setting global variables here
                self.appVersion = navigator.appVersion;
                self.browser = this.browser;
                self.browserVersion = this.version;
                self.OS = this.OS;
            },
            searchString: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var dataString = data[i].string;
                    var dataProp = data[i].prop;
                    this.versionSearchString = data[i].versionSearch || data[i].identity;
                    if (dataString) {
                        if (dataString.indexOf(data[i].subString) != -1)
                            return data[i].identity;
                    }
                    else if (dataProp)
                        return data[i].identity;
                }
            },
            searchVersion: function (dataString) {
                var index = dataString.indexOf(this.versionSearchString);
                if (index == -1) return;
                return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
            },
            dataBrowser: [
                {
                    string: navigator.userAgent,
                    subString: "Chrome",
                    identity: "Chrome"
                },
                {    string: navigator.userAgent,
                    subString: "OmniWeb",
                    versionSearch: "OmniWeb/",
                    identity: "OmniWeb"
                },
                {
                    string: navigator.vendor,
                    subString: "Apple",
                    identity: "Safari",
                    versionSearch: "Version"
                },
                {
                    prop: window.opera,
                    identity: "Opera",
                    versionSearch: "Version"
                },
                {
                    string: navigator.vendor,
                    subString: "iCab",
                    identity: "iCab"
                },
                {
                    string: navigator.vendor,
                    subString: "KDE",
                    identity: "Konqueror"
                },
                {
                    string: navigator.userAgent,
                    subString: "Firefox",
                    identity: "Firefox"
                },
                {
                    string: navigator.vendor,
                    subString: "Camino",
                    identity: "Camino"
                },
                {		// for newer Netscapes (6+)
                    string: navigator.userAgent,
                    subString: "Netscape",
                    identity: "Netscape"
                },
                {
                    string: navigator.userAgent,
                    subString: "MSIE",
                    identity: "Explorer",
                    versionSearch: "MSIE"
                },
                {
                    string: navigator.userAgent,
                    subString: "Gecko",
                    identity: "Mozilla",
                    versionSearch: "rv"
                },
                { 		// for older Netscapes (4-)
                    string: navigator.userAgent,
                    subString: "Mozilla",
                    identity: "Netscape",
                    versionSearch: "Mozilla"
                }
            ],
            dataOS: [
                {
                    string: navigator.platform,
                    subString: "Win",
                    identity: "Windows"
                },
                {
                    string: navigator.platform,
                    subString: "Mac",
                    identity: "Mac"
                },
                {
                    string: navigator.userAgent,
                    subString: "iPhone",
                    identity: "iPhone/iPod"
                },
                {
                    string: navigator.platform,
                    subString: "Linux",
                    identity: "Linux"
                }
            ]

        };
        BrowserDetect.init();
    }
})(DETECTION);
var PRELOAD = PRELOAD || {};

(function preloadClass() {
    var self = PRELOAD;
    var imagePreloadArray = [];

    var basePath = null;
    var AWSPath = null;

    self.init = function () {
        basePath = CONFIG.imagePath + "/";
        AWSPath = CONFIG.AWSPath + "/";
    }

    self.loadSingleFromGroup = function (groupID, imgID, callback) {

        var imgGroupData = imageGroups[groupID].data;
        var imgToLoad = null;
        var singleSrc = null;


        if (typeof imgID == "string") {
            for (var i = 0; i < imgGroupData.length; i++) {
                if (imgGroupData[i].name == imgID) {
                    imgToLoad = imgGroupData[i];
                    break;
                }
            }

            singleSrc = basePath + imgToLoad.url;
        }
        else {
            imgToLoad = getSequenceURL(imgGroupData, imgID);
            singleSrc = imgToLoad;
        }


        loadImageWithMeta(singleSrc, null, callback);

        var tempImg = new Image;

    }

    self.loadGroupWithID = function (groupID, callback, returnType) {

        // console.log(groupID)

        if (groupID == undefined)
            return;
        var curGroup = imageGroups[groupID];

        var groupType = curGroup.type;
        var groupData = curGroup.data;

        var imageArray = null;

        if (groupType == "list")
            imageArray = processList(groupData)
        else if (groupType == "sequence")
            imageArray = processSequence(groupData)

        imagePreloadArray.push(new imageArrayLoad(imageArray, callback, returnType, self));
    }

    //process list of images
    function processList(groupData) {
        var tempImgArray = [];

        for (var i = 0; i < groupData.length; i++) {
            var curImg = groupData[i];
            var imgEl = createImgEl(curImg.name, basePath + curImg.url);
            tempImgArray.push(imgEl);
        }

        return tempImgArray;
    }

    //process array of images
    function processSequence(groupData) {
        var tempImgArray = [];

        var skipFrames = groupData.skipFrames ? 1 + groupData.skipFrames : 0;
        //console.log(skipFrames)

        for (var i = 0; i < groupData.numImages; i++) {

            if (!skipFrames || ( i % skipFrames == 0)) {
                var name = "sequence" + i;
                var path = getSequenceURL(groupData, i)
                var imgEl = createImgEl(name, path);
                tempImgArray.push(imgEl);
            }


        }

        return tempImgArray;
    }

    function getSequenceURL(groupData, index) {


        var bPath = groupData.onAWS ? AWSPath : basePath;
        var url = bPath + groupData.url;
        var startNum = groupData.startNum ? groupData.startNum : 0;
        var num = startNum + index;
        var padding = groupData.padding ? UTILS.zeroPad(num, groupData.padding) : num;

        var path = url + padding + "." + groupData.extension;
        return path;
    }

    function createImgEl(name, url) {

        var imgEl = { "name": name, "url": url };
        return imgEl;

    }

    function loadImageWithMeta(_src, _imgAttr, _callback) {
        var newImg = new Image;

        for (key in _imgAttr) {
            newImg[key] = _imgAttr[key];
        }

        newImg.onload = function () {
            this.imgDim = { "w": this.width, "h": this.height }
            _callback(this);
        }

        newImg.src = _src;


    }

    //image array load class

    function imageArrayLoad(imgArray, callback, returnType, parent) {
        var self = this;
        var imgToLoad = imgArray.length;
        var imagesLoaded = 0;

        var finalImageArray = null;

        function init() {
            //console.log("PRELOADING IMAGE GROUP" , imgArray , returnType);

            if (returnType == "array")
                finalImageArray = [];
            else if (returnType == "object")
                finalImageArray = {};

            for (var i = 0; i < imgToLoad; i++) {
                var curImageObj = imgArray[i];
                var tempImg = new Image;

                var imgAttr = {
                    "name": curImageObj.name,
                    "tag": i
                }

                var src = curImageObj.url;

                loadImageWithMeta(src, imgAttr, imgLoadHandler)
            }
        }

        function imgLoadHandler(img) {

            if (returnType == "array")
                finalImageArray[img.tag] = img;
            else if (returnType == "object")
                finalImageArray[img.name] = img;

            //console.log("THIS IS HAPPENING" , img.name)


            imagesLoaded++;
            if (imagesLoaded >= imgToLoad) {
                callback(finalImageArray);
            }
        }

        init();
    }

})(PRELOAD);
var LAYOUT = LAYOUT || {};

(function layoutClass() {

    var self = LAYOUT;

    var contentDim = null;

    var curOrientation = null;

    var resizeTicker = null;

    self.isLandscape = false;

    //getters


    self.init = function () {

    }


    self.preResize = function () {
        getWidthHeight();
        checkBreakpoints();
    }

    self.resize = function () {


        //resizing container
        var fullscreenCss = {
            "width": CONFIG.windowWidth,
            "height": CONFIG.windowHeight
        }

        $("#content").css(fullscreenCss);

        setContentWidthHeight(fullscreenCss.width, fullscreenCss.height);

        checkOrientation();

    }


    function checkBreakpoints() {

        var isMobile = false;

        if (CONFIG.contentWidth < 600) {
            isMobile = true;
        }

        if (isMobile) {
            layoutChange("mobile");
        }
        else {
            layoutChange("desktop")
        }

    }

    function checkOrientation() {


        var tempOrientation = null;


        if (CONFIG.windowHeight > CONFIG.windowWidth) {
            tempOrientation = "portrait";
            self.isLandscape = false;
        } else {
            tempOrientation = "landscape";
            self.isLandscape = true;
        }


        if (DETECTION.isTouchDevice && tempOrientation && tempOrientation != curOrientation) {
            curOrientation = tempOrientation;

            setTimeout(function () {
                $(window).resize();
            }, 500)
        }

    }

    function layoutChange(tag) {

        var allLayoutTags = ["desktop" , "mobile"];

        if (curLayoutTag != tag) {
            curLayoutTag = tag;

            for (var i = 0; i < allLayoutTags.length; i++) {
                $("#content").removeClass(allLayoutTags[i]);
            }

            $("#content").addClass(curLayoutTag);

            if (curLayoutTag == "mobile") {
                isMobile = true;
            }
            else {
                isMobile = false;
            }
        }
    }

    function setContentWidthHeight(w, h) {
        CONFIG.contentWidth = w;
        CONFIG.contentHeight = h;
    }

    function getWidthHeight() {

        CONFIG.windowHeight = $(window).height();
        CONFIG.windowWidth = $(window).width();

        //checking amount resized


        var resizeDistW = Math.abs(CONFIG.windowWidth - CONFIG.contentWidth);
        var resizeDistH = Math.abs(CONFIG.windowHeight - CONFIG.contentHeight);

        if ((resizeDistW > 10 || resizeDistH > 10) && DETECTION.isTouch() && DETECTION.isMobile) {
            clearTimeout(resizeTicker);
            resizeTicker = setTimeout(function () {
                checkResize();
            }, 500)
        }

        CONFIG.contentHeight = CONFIG.windowHeight;
        CONFIG.contentWidth = CONFIG.windowWidth;
    }

    function checkResize() {
        setTimeout(function () {
            MOBILE.on();
        }, 100);
    }
})(LAYOUT);


var SHARE = SHARE || {};

(function shareClass() {

    var self = SHARE;
    var popupDim = null;
    var defaultShareUrl = null;
    var defaultTitle = "I am mister peanut";

    var prodURL = null;

    self.init = function () {

        prodURL = CONFIG.prodURL;

        // console.log(prodURL)

        popupDim = {
            "w": 999,
            "h": 575
        }
    }

    self.share = function (shareType, copyContext) {

        var shareURL = CONFIG.prodURL;


        if (shareType == "facebook") {
            fbShare(shareURL, copyContext);
        }
        else if (shareType == "twitter") {
            twShare(shareURL, copyContext);
        }
        else if (shareType == "mail") {
            mailShare(shareURL, copyContext);
        }


    }


    function fbShare(url, copyContext) {

        var customImage = "http://www.ineedsomeenergy.com/assets/media/img/fb.jpg";

        var unEncodedURL = url;
        var encodedURL = encodeURIComponent(url);
        var redirect = CONFIG.prodURL + "/close_popup.html";

        console.log(customImage)
        //new share method

        var facebookURL = " https://www.facebook.com/dialog/feed?" +
            "app_id=" + CONFIG.fbookID +
            "&link=" + encodedURL +

            "&picture=" + customImage +

            "&name=" + encodeURIComponent(copyContext.fb.title) +
            "&caption=" + encodedURL +
            "&description=" + encodeURIComponent(copyContext.fb.body + " " + unEncodedURL) +
            "&redirect_uri=" + encodeURIComponent(redirect);

        console.log(facebookURL)


        openPopup(facebookURL);
    }

    function twShare(url, copyContext) {


        var encodedURL = encodeURIComponent(url);


        var via = "";
        var text = encodeURIComponent(copyContext.tw);
        var newUrl = 'https://twitter.com/intent/tweet?text=' + text + " " + encodedURL;

        openPopup(newUrl);

    }


    function mailShare(url, copyContext) {


        var sMailTo = "mailto:someone@example.com";
        var subject = encodeURIComponent(copyContext.mail.subject);
        var body = encodeURIComponent(copyContext.mail.body + "    " + url);

        var mailToS = sMailTo + "?subject=" + subject + "&body=" + body;
        openPopup(mailToS);

    }

    function openPopup(url) {
        var shareProps = getPopupDim();
        window.open(url, "_blank", shareProps);
    }

    function getPopupDim() {
        var shareProps = "width=" + popupDim.w + ",height=" + popupDim.h + ",left=" + ( window.screen.width - popupDim.w ) * 0.5 + ",top=" + ( window.screen.height - popupDim.h ) * 0.5;
        return shareProps;
    }

    self.init();

})(SHARE);
var VIEWS = VIEWS || {};

(function viewClass() {
    var self = VIEWS;

    var viewArray = null;

    self.init = function () {
        viewArray = [plinkoView , mrPeanut , instructionsView];

        UTILS.tryMethodOnArray("init", viewArray);
    }

    self.animate = function () {
        UTILS.tryMethodOnArray("animate", viewArray);
    }

    self.resize = function () {
        UTILS.tryMethodOnArray("resize", viewArray);
    }

    //mouse 
    self.mouseup = function () {
        UTILS.tryMethodOnArray("mouseup", viewArray);
    }

    self.mousedown = function () {
        UTILS.tryMethodOnArray("mousedown", viewArray);
    }

    self.mousemove = function () {
        UTILS.tryMethodOnArray("mousemove", viewArray);
    }


})(VIEWS);
var TEMPLATE = TEMPLATE || {};

(function templateClass() {

    var self = TEMPLATE;

    self.init = function () {

        //creating globa ref
        Handlebars.registerHelper('global', function (name) {
            return copyData.global[name]
        });


        buildTemplates();
    }

    self.compileTemplate = function (selector, context, dest) {

        var source = $("#" + selector).html();
        var template = Handlebars.compile(source);
        var html = template(context);

        if (dest) {
            if (dest.length >= 1)
                dest.html(html)
        }


        return html;

    }
    function buildTemplates() {
        self.compileTemplate("instructions-template", copyData["instructions"], $("#instructions"));
    }

})(TEMPLATE)
var plinkoView = new plinkoClass();

function plinkoClass() {

    var self = this;

    var pixiReady = false;

    //test stuff
    var stage = null;
    var renderer = null;
    var pixiContainer = null;
    var origW , origH;


    var resizeTicker = null;
    var theImages = null;

    var textureContainer = {};

    var unreleasedDiscExists = false;
    var cursorIsPointer = false;


    //global functions
    self.init = function (config) {

        pixiContainer = $(".plinko-pixi");
        pixiReady = true;
        PRELOAD.loadGroupWithID("plinko", imageLoadHandler, "object");
    }


    self.animate = function () {
        render();
    }

    self.mousedown = function () {

        // console.log("mouse down")
    }

    self.mousemove = function () {


        if (discReleaseRect) {
            //checking cursor
            // var checkArray = [discReleaseRect , textureContainer.facebook.dim , textureContainer.twitter.dim , textureContainer.mail.dim ];
            var checkArray = [discReleaseRect];

            if (checkCursor(checkArray)) {
                // console.log("over hit area")
                togglePointer(true);
            }
            else {
                togglePointer(false);
            }

            //other 
            if (checkCursor([discReleaseRect])) {
                // console.log("over hit area")
                overHitArea = true;
            }
            else {
                overHitArea = false;
            }


        }


    }

    self.mouseup = function () {

        // console.log("mouseup")

        if (unreleasedDiscExists && overHitArea) {
            releaseCurDisc();
        }

        // var ctx = copyData.social;

        // if(UTILS.mouseOnRect( textureContainer.facebook.dim ))
        // {
        //   SHARE.share("facebook" , ctx )
        // }
        // else if(UTILS.mouseOnRect( textureContainer.twitter.dim ))
        // {
        //   SHARE.share("twitter" , ctx )
        // }
        // else if(UTILS.mouseOnRect( textureContainer.mail.dim ))
        // {
        //   SHARE.share("mail" , ctx )
        // }


    }

    self.reset = function () {
        hasReleased = false;
        curDiscIndex = 0;
        shouldSnapBuckets = false;
        checkResize();

    }

    function checkCursor(_rectArray) {
        var isCursor = false;
        for (var i = 0; i < _rectArray.length; i++) {
            if (UTILS.mouseOnRect(_rectArray[i])) {
                isCursor = true;
                break;
            }
        }
        return isCursor;
    }

    function togglePointer(_truth) {
        if (_truth != cursorIsPointer) {
            cursorIsPointer = _truth;
            if (_truth) {
                $("body").css("cursor", "pointer")
            }
            else {
                $("body").css("cursor", "inherit")
            }

        }
    }

    function imageLoadHandler(_theImages) {
        theImages = _theImages;
        createTextures();
        initPixi();
        initGame();
        self.resize();
    }


    function initPixi() {


        origW = CONFIG.contentWidth;
        origH = CONFIG.contentHeight;

        stage = new PIXI.Stage(0x000000);


        stage = new PIXI.Stage(0x000000);

        if (DETECTION.isAndroid || DETECTION.isIE9) {
            renderer = new PIXI.CanvasRenderer(400, 300)
        }
        else {
            renderer = PIXI.autoDetectRenderer(400, 300);
        }


        pixiContainer.append(renderer.view);

    }

    function render() {

        if (!renderer || !stage || !pixiReady) {
            return
        }

        // console.log("renderer")

        update();
        renderer.render(stage);


    }


    //the game
    var overHitArea = false;
    var curDisc = null;

    //container - contants
    var numColumns = null;
    var columnWidth = null;
    var columnHeight = null;
    var numRows = null


    //container-vars
    var discReleaseRect = null; // hit area
    var containerRect = null;

    //rods
    var rodRadius = null;
    var rodArray = [];

    //disc
    var discRadius = null;
    var discArray = [];
    var curDiscIndex = 0;

    //bg 
    var bgSprite = null;

    var socialArray = [];
    //buckets
    var bucketArray = [];
    var bucketSpace = 0;
    var shouldSnapBuckets = false;
    var snappedBuckets = false;

    var wallOffset = null;
    var leftWallRect = null;
    var rightWallRect = null;

    //android 
    var speedModifier = 1;

    //getters
    self.getContainerRect = function () {
        return containerRect
    }

    function createTextures() {

        //initial calculations

        discRadius = 15;
        rodRadius = discRadius / 4;

        var bottomOffset = CONFIG.contentHeight * 0.35;
        var minBoardWidth = 500;

        //board graphic stuff
        var boardAR = theImages["board"].imgDim.w / theImages["board"].imgDim.h;
        var boardHeight = CONFIG.contentHeight - bottomOffset;
        var boardWidth = Math.max(boardHeight * boardAR, minBoardWidth);


        var boardRect = UTILS.makeRect((CONFIG.contentWidth - boardWidth ) / 2, 0, boardWidth, boardHeight);
        var boardCanvas = UTILS.imgToCanvas(theImages["board"], boardRect.w, boardRect.h);
        textureContainer.board = {
            dim: boardRect,
            canvas: boardCanvas,
            texture: PIXI.Texture.fromCanvas(boardCanvas)
        }


        //rod container stuff
        var containerTopOffset = Math.max(CONFIG.contentHeight * 0.2, 40);
        var containerSideOffset = boardRect.w * 0.12;
        var containerHeight = boardHeight - containerTopOffset;
        var containerWidth = boardWidth - containerSideOffset * 2;

        containerRect = UTILS.makeRect(boardRect.x + containerSideOffset, boardRect.y + containerTopOffset, containerWidth, containerHeight);


        //title graphic stuff
        var titleImg = theImages["title"];
        var titleAR = titleImg.imgDim.w / titleImg.imgDim.h;
        var titleHeight = ( containerRect.y - boardRect.y ) / 2;
        var titleWidth = titleHeight * titleAR;

        if (titleWidth > containerWidth - 20) {
            titleWidth = containerWidth - 20;
            titleHeight = titleWidth / titleAR;
        }

        var titleLeft = boardRect.x + (boardRect.w - titleWidth) / 2;
        var titleTop = boardRect.y + ( containerTopOffset - titleHeight ) / 2;
        var titleRect = UTILS.makeRect(titleLeft, titleTop, titleWidth, titleHeight);
        var titleCanvas = UTILS.imgToCanvas(theImages["title"], titleRect.w, titleRect.h);

        textureContainer.title = {
            dim: titleRect,
            canvas: titleCanvas,
            texture: PIXI.Texture.fromCanvas(titleCanvas)
        }


        //social icon stuff
        // var socialWidth = 25;
        // var socialSpacing = socialWidth / 5;
        // var socialLeft = boardRect.x + boardRect.w * 0.95 - socialWidth  ;
        // var socialTop = boardRect.y +  boardRect.h * 0.07;

        // var facebookRect = UTILS.makeRect( socialLeft, socialTop , socialWidth , socialWidth );
        // var twitterRect = UTILS.makeRect( socialLeft, socialTop + socialWidth + socialSpacing , socialWidth , socialWidth );
        // var mailRect = UTILS.makeRect( socialLeft, socialTop + (socialWidth+socialSpacing)*2 +2, socialWidth , socialWidth );

        // var facebookCanvas = UTILS.imgToCanvas(theImages["social-facebook"], socialWidth , socialWidth ); 
        // var twitterCanvas = UTILS.imgToCanvas(theImages["social-twitter"], socialWidth , socialWidth ); 
        // var mailCanvas = UTILS.imgToCanvas(theImages["social-mail"], socialWidth , socialWidth ); 

        // textureContainer.facebook = {
        //   dim: facebookRect,
        //   canvas: facebookCanvas,
        //   texture : PIXI.Texture.fromCanvas( facebookCanvas )
        // }

        // textureContainer.twitter = {
        //   dim: twitterRect,
        //   canvas: twitterCanvas,
        //   texture : PIXI.Texture.fromCanvas( twitterCanvas )
        // }

        // textureContainer.mail = {
        //   dim: mailRect,
        //   canvas: mailCanvas,
        //   texture : PIXI.Texture.fromCanvas( mailCanvas )
        // }


        //board math 


        getColumnDim();

        function getColumnDim() {
            numColumns = Math.floor(containerRect.w / (discRadius * 3))
            columnHeight = columnWidth = containerRect.w / numColumns;
            numRows = Math.floor(containerRect.h / columnHeight);
        }


        while (numRows < 3) {
            discRadius -= 1;
            getColumnDim();
        }

        // console.log("num rows" , numRows , numColumns , discRadius)


        //post disc recalculation stuff
        discReleaseRect = UTILS.makeRect(containerRect.x, boardRect.y, containerRect.w, containerRect.y - boardRect.y - discRadius * 2);
        rodRadius = discRadius / 4;
        wallOffset = discRadius;

        var rodDim = UTILS.makePoint(rodRadius, rodRadius);
        var rodCanvas = UTILS.imgToCanvas(theImages["nail"], rodDim.x * 4 * 1.5, rodDim.x * 8 * 1.5);
        textureContainer.rod = {
            dim: rodDim,
            canvas: rodCanvas,
            texture: PIXI.Texture.fromCanvas(rodCanvas)
        }

        //disc stuff
        var discDim = UTILS.makePoint(discRadius, discRadius);
        var discCanvas = UTILS.imgToCanvas(theImages["disk"], discDim.x * 2, discDim.x * 2);
        textureContainer.disc = {
            dim: discDim,
            canvas: discCanvas,
            texture: PIXI.Texture.fromCanvas(discCanvas)
        }

        //bucket stuff
        var bucketDim = UTILS.makeRect(100, 100, columnWidth, columnWidth * 1.7);
        var bucketCanvas1 = UTILS.imgToCanvas(theImages["bucket-front"], bucketDim.w, bucketDim.h * 1.5);
        var bucketCanvas2 = UTILS.imgToCanvas(theImages["bucket-back"], bucketDim.w, bucketDim.h * 1.5);
        textureContainer.bucket = {
            dim: bucketDim,
            canvas: bucketCanvas1,
            texture: PIXI.Texture.fromCanvas(bucketCanvas1),
            canvas2: bucketCanvas2,
            texture2: PIXI.Texture.fromCanvas(bucketCanvas2)
        }

        //setting up walls
        leftWall = UTILS.makeRect(containerRect.x - wallOffset, containerRect.y - rodRadius * 2, 0, containerRect.h);
        rightWall = UTILS.makeRect(containerRect.x + containerRect.w + wallOffset, containerRect.y - rodRadius * 2, 0, containerRect.h);


        // console.log("getting stuff here" , discRadius*2 + rodRadius*2 , columnWidth , rodRadius)
    }


    function update() {

        updateBuckets();
        updateDisc();

        //checking hitArea

        if (!unreleasedDiscExists && overHitArea) {
            unreleasedDiscExists = true;
            showNextDisc(CONFIG.mouseX, CONFIG.mouseY);
        }


    }

    function updateBuckets() {
        var swapBucketIndex = null;
        var rightmostBucketX = 0;
        var rightmostBucketIndex = null;

        var alignDist = CONFIG.contentWidth;
        var alignIndex = null;

        for (var i = 0; i < bucketArray.length; i++) {
            var tempBucket = bucketArray[i];
            tempBucket.animate();

            var bucketPos = tempBucket.getPos();
            var bucketSize = tempBucket.getSize();

            if (bucketPos.x + bucketSize.x < 0) {
                swapBucketIndex = i;
            }

            if (bucketPos.x > rightmostBucketX) {
                rightmostBucketX = bucketPos.x;
                rightmostBucketIndex = i;
            }

            var tAlignDist = bucketPos.x - containerRect.x;
            if (tAlignDist >= 0 && tAlignDist <= alignDist) {
                alignDist = tAlignDist;
            }
        }

        //swapping bucket
        if (swapBucketIndex != null && !snappedBuckets) {
            var swapBucket = bucketArray[swapBucketIndex];
            var lastBucket = bucketArray[rightmostBucketIndex];
            var newX = lastBucket.getPos().x + lastBucket.getSize().x + bucketSpace;
            swapBucket.setX(newX);
        }

        //aligning buckets if needed

        if (shouldSnapBuckets && !snappedBuckets) {
            snappedBuckets = true;


            for (var i = 0; i < bucketArray.length; i++) {
                //offsetting if num rows isnt even number
                var offset = 0;
                if (numRows % 2 == 0) {
                    offset = columnWidth / 2;
                }

                bucketArray[i].snapBucket(-alignDist - offset);
            }
        }
    }

    function updateDisc() {


        for (var i = 0; i < discArray.length; i++) {
            var tempDisc = discArray[i];
            var discPos = tempDisc.getPos();
            var discVel = tempDisc.getVel();
            var discSize = tempDisc.getSize();
            var discRadius = discSize / 2;

            var hasReleased = tempDisc.isReleased();

            var isActive = false;

            if (!overHitArea && !hasReleased) {
                tempDisc.hide();
            }
            else {
                tempDisc.show();
                isActive = true;
            }


            if (isActive) {
                tempDisc.updateGravity();

                //wall hit detection
                var wallHit = wallCheck(discPos, discRadius);
                if (wallHit)
                    tempDisc.wallHit(wallHit);

                //rod hit detection
                for (var j = 0; j < rodArray.length; j++) {

                    var tempRod = rodArray[j];
                    var rodPos = tempRod.getPos();
                    var rodSize = tempRod.getSize();
                    var minDist = rodSize / 2 + discRadius;
                    var hasHit = hitTest(tempDisc, tempRod);

                    if (hasHit) {

                        if (hasHit.dist < minDist) {
                            var angle = UTILS.getAngle(discPos.x, discPos.y, rodPos.x, rodPos.y);


                            // console.log(discVel.x + ',' + discVel.y);
                            var distX = minDist * Math.cos(angle)
                            var distY = minDist * Math.sin(angle)
                            newPosX = rodPos.x + distX;
                            newPosY = rodPos.y + distY;

                            var tempDiscPos = tempDisc.setPos(newPosX, newPosY);

                        }

                        var discVel = UTILS.reflectVel(rodPos, tempDiscPos, discVel);

                        tempDisc.bounce(discVel);
                    }

                }

                //bucket detection
                var closestBucketDist = CONFIG.contentWidth;
                var closestBucketIndex = null;
                for (var j = 0; j < bucketArray.length; j++) {
                    var tempBucket = bucketArray[j];
                    var bucketPos = tempBucket.getPos();
                    var bucketSize = tempBucket.getSize();

                    if (discPos.x + discRadius > bucketPos.x && discPos.x - discRadius < bucketPos.x + bucketSize.x && discPos.y + discRadius > bucketPos.y && discPos.y - discRadius < bucketPos.y + bucketSize.y) {
                        var tDist = Math.abs(bucketPos.x - discPos.x);
                        if (tDist < closestBucketDist) {
                            closestBucketDist = tDist
                            closestBucketIndex = j;

                        }

                    }

                }

                if (closestBucketIndex != null) {
                    var newDest = bucketArray[closestBucketIndex].getMid();
                    tempDisc.setDest(newDest);
                }


                tempDisc.animate();
            }


        }
    }

    function wallCheck(_pos, _radius) {

        var hitType = null;

        //within wall height area
        if (_pos.y + _radius >= leftWall.y && _pos.y - _radius <= leftWall.y + leftWall.h) {
            //left wall
            if (_pos.x - _radius <= leftWall.x)
                hitType = {type: "left", dist: Math.abs((_pos.x - _radius) - leftWall.x) };
            else if (_pos.x + _radius >= rightWall.x)
                hitType = {type: "right", dist: Math.abs((_pos.x + _radius) - rightWall.x) };
        }

        return hitType;
    }

    function hitTest(item1, item2) {

        var item1Pos = item1.getPos();
        var item1Size = item1.getSize();

        var item2Pos = item2.getPos();
        var item2Size = item2.getSize();

        var curDist = pointDistance(item1Pos, item2Pos);

        if (curDist.dist < ( item1Size / 2 + item2Size / 2)) {
            return curDist;
        }
        else {
            return false;
        }
    }


    function pointDistance(point1, point2) {
        var xs = 0;
        var ys = 0;

        xs = point2.x - point1.x;
        xs = xs * xs;

        ys = point2.y - point1.y;
        ys = ys * ys;

        var dist = Math.sqrt(xs + ys);

        return { "dist": dist, "distX": point2.x - point1.x, "distY": point2.y - point1.y }
    }


    function initGame() {

        //speed variation on devices

        if (DETECTION.isAndroid) {
            speedModifier = 5;
        }

        //building bg

        var bgTexture = PIXI.Texture.fromImage(theImages["bg"].src);
        bgSprite = new PIXI.Sprite(bgTexture);
        stage.addChild(bgSprite)

        //building board
        var sprite = new PIXI.Sprite(textureContainer.board.texture);
        stage.addChild(sprite);
        sprite.position = { x: textureContainer.board.dim.x, y: textureContainer.board.dim.y };

        //building title
        var titleSprite = new PIXI.Sprite(textureContainer.title.texture);
        stage.addChild(titleSprite);
        titleSprite.position = { x: textureContainer.title.dim.x, y: textureContainer.title.dim.y };


        // var sprite = new PIXI.Sprite( textureContainer.rectangle.texture );
        // stage.addChild(sprite);
        // sprite.position = { x : containerRect.x , y : containerRect.y };

        //creating rods

        //create buckets


        createBuckets();

        createDiscs();

        bucketFronts();

        createRods();

        createSocial();


    }


    function createSocial() {
        // var socialTextureArray = [ textureContainer.facebook , textureContainer.twitter , textureContainer.mail ];

        // for( var i = 0 ; i < socialTextureArray.length ; i++) {
        //   var tSocial = socialTextureArray[i];
        //   var tSprite = new PIXI.Sprite(tSocial.texture);
        //   stage.addChild(tSprite)
        //   socialArray.push(tSprite);
        //   tSprite.position = { x : tSocial.dim.x , y : tSocial.dim.y };

        // }
    }

    function createBuckets() {


        var bucketWidth = textureContainer.bucket.dim.w + bucketSpace;
        var bucketHeight = textureContainer.bucket.dim.h;
        var numBuckets = Math.ceil(CONFIG.contentWidth / bucketWidth) + 3;

        for (var i = 0; i < numBuckets; i++) {

            var tempX = i * (bucketWidth + bucketSpace);
            var tempPos = UTILS.makePoint(tempX, textureContainer.board.dim.h);

            var tempBucket = new bucketClass(tempPos.x, tempPos.y, bucketWidth, bucketHeight);
            bucketArray.push(tempBucket);
        }


    }

    function bucketFronts() {
        for (var i = 0; i < bucketArray.length; i++) {
            bucketArray[i].makeFront();
        }
    }

    function createDiscs() {
        var numDiscs = 1;
        for (var i = 0; i < numDiscs; i++) {
            var tempDisc = new discClass(0, 0, textureContainer.disc.dim.x, self);
            discArray.push(tempDisc);
        }
    }

    function showNextDisc(_x, _y) {

        if (curDiscIndex < discArray.length) {
            discArray[curDiscIndex].prepare(_x, _y);
            curDisc = discArray[curDiscIndex];
            curDiscIndex++;
        }

    }

    function releaseCurDisc() {
        shouldSnapBuckets = true;
        unreleasedDiscExists = false;
        curDisc.release();
    }

    function createRods() {
        for (var y = 0; y < numRows; y++) {
            var isMaxRods = !!( y % 2 == 0 || y == 0 );
            var tempNumColumns = isMaxRods ? numColumns + 1 : numColumns;


            for (var x = 0; x < tempNumColumns; x++) {
                var tempX = x * columnWidth + containerRect.x;
                var tempY = y * columnHeight + containerRect.y;

                if (!isMaxRods)
                    tempX += columnWidth / 2;

                var tempRod = new rodClass(tempX, tempY, rodRadius, self);

                rodArray.push(tempRod)

            }
        }
    }

    function clearGame() {
        snappedBuckets = false;
        unreleasedDiscExists = false;

        clearPixiArray(discArray);
        clearPixiArray(rodArray);
        clearPixiArray(bucketArray);
        clearPixiArray(socialArray);
    }

    function clearPixiArray(_array) {
        for (var i = 0; i < _array.length; i++) {
            if (_array[i].destroy)
                _array[i].destroy();


        }
        _array.length = 0;
    }


//     .___.__               
//   __| _/|__| ______ ____  
//  / __ | |  |/  ___// ___\ 
// / /_/ | |  |\___ \\  \___ 
// \____ | |__/____  >\___  >
//      \/         \/     \/ 


    //disk class
    function discClass(_x, _y, _radius, _parent) {

        var self = this;

        var mySprite = null;
        var containerRect = _parent.getContainerRect();

        var curX = _x;
        var curY = _y;

        var destX = null;
        var destY = null;
        var inBasket = false;

        var gravity = 0.2;
        var vMax = 10;
        // var friction = 1;

        var vX = 0;
        var vY = 0;

        var rV = 0;

        var isRotating = true;
        var curRotation = 0;
        var isShowing = true;
        var hasReleased = false;

        // var newVX 

        function init() {
            mySprite = new PIXI.Sprite(textureContainer.disc.texture);

            stage.addChild(mySprite);

            mySprite.anchor.x = 0.5;
            mySprite.anchor.y = 0.5;

            self.animate();

        }

        self.show = function () {
            if (!isShowing && !hasReleased) {
                isShowing = true;
                mySprite.visible = true;
            }

        }
        self.hide = function () {
            if (isShowing && !hasReleased) {
                isShowing = false;
                mySprite.visible = false;
                self.reset();
            }
        }

        self.prepare = function () {
            self.show();
        }

        self.release = function () {
            vY = 0;
            vx = 0;
            hasReleased = true;
        }

        self.reset = function () {
            vY = 0;
            vX = 0;
            rV = 0;
            curX = _x;
            curY = _y;
        }

        self.isReleased = function () {
            return hasReleased
        }
        self.getPos = function () {
            return UTILS.makePoint(curX, curY)
        }
        self.getVel = function () {
            return UTILS.makePoint(vX, vY)
        }

        self.setPos = function (_newX, _newY) {
            curX = _newX;
            curY = _newY;
            return UTILS.makePoint(curX, curY);
        }

        self.setDest = function (_dest) {
            inBasket = true;
            destX = _dest.x;
            destY = _dest.y;
        }

        self.getSize = function () {

            var tSize = _radius * 2;
            return tSize;
        }

        self.wallHit = function (_dir) {
            if (_dir.type == "left") {
                curX = curX + _dir.dist;
            }
            else if (_dir.type == "right") {
                curX = curX - _dir.dist;
            }

            vX = -1 * vX;
        }

        self.bounce = function (newVel) {

            var rOffset = 0.4;

            rV = newVel.rot;
            vX = newVel.x + (-rOffset + Math.random() * 2 * rOffset);
            vY = newVel.y;
            self.animate();

        }

        self.animate = function () {
            update();
            render();
        }

        self.updateGravity = function () {
            vY += gravity;
        }

        function update() {

            if (!inBasket) {
                if (hasReleased) {
                    curY = curY + vY * speedModifier;
                    curX = curX + vX * speedModifier;

                    vY = Math.max(-vMax, Math.min(vMax, vY));
                    vX = Math.max(-vMax, Math.min(vMax, vX));
                }
                else {
                    // curRotation = 0;
                    curY = CONFIG.mouseY;
                    curX = CONFIG.mouseX;
                    // console.log(curX)
                }

            }
            else {

                var dist = UTILS.getDist(curX, destX, curY, destY).total
                if (dist > 1) {
                    curX += (destX - curX ) * 0.1;
                    curY += (destY - curY ) * 0.1;
                }

                if (dist < 10) {
                    isRotating = false;
                }
            }
            if (isRotating)
                curRotation += rV;


        }

        function render() {
            mySprite.rotation = curRotation;
            mySprite.position = { x: curX, y: curY };
        }

        init();
    }


//                   .___
// _______  ____   __| _/
// \_  __ \/  _ \ / __ | 
//  |  | \(  <_> ) /_/ | 
//  |__|   \____/\____ | 
//                    \/ 


    //rod class
    function rodClass(_x, _y, _radius, _parent) {

        var self = this;

        var mySprite = null;
        var containerRect = _parent.getContainerRect();

        function init() {
            mySprite = new PIXI.Sprite(textureContainer.rod.texture);

            stage.addChild(mySprite);

            mySprite.anchor.x = 0.5;
            mySprite.anchor.y = 0.5;

            mySprite.position = { x: _x, y: _y };
        }

        self.getPos = function () {
            return UTILS.makePoint(_x, _y)
        }
        self.getSize = function () {
            return _radius * 2
        }

        self.animate = function () {
            update();
            render();
        }

        function update() {

        }

        function render() {

        }

        init();
    }


// ___.                  __           __   
// \_ |__  __ __   ____ |  | __ _____/  |_ 
//  | __ \|  |  \_/ ___\|  |/ // __ \   __\
//  | \_\ \  |  /\  \___|    <\  ___/|  |  
//  |___  /____/  \___  >__|_ \\___  >__|  
//      \/            \/     \/    \/      

    //bucket class
    function bucketClass(_x, _y, _w, _h) {
        var self = this;

        var mySprite = null;
        var mySprite2 = null;

        var curX = _x;
        var curY = _y;

        var destX = null;

        var vX = -1;
        var vY = 0;

        var hasSnapped = false;

        function init() {
            mySprite = new PIXI.Sprite(textureContainer.bucket.texture2);

            mySprite2 = new PIXI.Sprite(textureContainer.bucket.texture);

            stage.addChild(mySprite);


            self.animate();

        }

        self.getPos = function () {
            return UTILS.makePoint(curX, curY)
        }

        self.getSize = function () {
            return UTILS.makePoint(_w, _h)
        }

        self.getMid = function () {
            return UTILS.makePoint(curX + _w / 2, curY + _h / 2)
        }

        self.makeFront = function () {
            stage.addChild(mySprite2);
        }

        self.setX = function (newPos) {


            curX = newPos;
            self.animate();
        }

        self.snapBucket = function (_offset) {
            hasSnapped = true;
            destX = curX + _offset;
            // console.log("snapBucket" , destX)
        }


        self.animate = function () {
            update();
            render();
        }

        self.destroy = function () {
            if (mySprite)
                stage.removeChild(mySprite);

            if (mySprite2)
                stage.removeChild(mySprite2);
        }

        function update() {


            if (Math.abs(destX - curX) < 2 && hasSnapped) {
                // console.log("called")
            }
            else {

                curX += vX * speedModifier;
            }

        }

        function render() {

            mySprite.position = { x: curX, y: curY };
            mySprite2.position = { x: curX, y: curY };
        }

        init();
    }


    //trigger out

    self.destroy = function () {
    }
    self.resize = function () {
        if (renderer) {


            bgSprite.width = CONFIG.contentWidth;
            bgSprite.height = CONFIG.contentHeight;


            renderer.resize(CONFIG.contentWidth, CONFIG.contentHeight)

            pixiContainer.css({
                "width": CONFIG.contentWidth,
                "height": CONFIG.contentHeight
            });


            //resizing
            var resizeDistW = Math.abs(CONFIG.contentWidth - origW);
            var resizeDistH = Math.abs(CONFIG.contentHeight - origH);

            if (resizeDistW > 10 || resizeDistH > 10) {
                clearTimeout(resizeTicker);
                resizeTicker = setTimeout(function () {
                    checkResize();
                }, 500)
            }
        }
    }

    function checkResize() {

        // console.log("hello")

        origW = CONFIG.contentWidth;
        origH = CONFIG.contentHeight;

        // saveLevel();
        clearGame();
        createTextures();
        initGame();
        self.resize();
        // restoreLevel();

    }
}
var mrPeanut = new mrPeanutClass();

function mrPeanutClass() {
    var self = this;
    var theSequence = null;

    var isLoaded = false;
    var instructionsClosed = false;

    self.init = function () {

        var sequenceConfig = { //sequence config
            "playInterval": 40,
            "assetName": "mrPeanut",
            "autoplay": false,
            "loop": false,
            "element": $("#mrPeanut"),
            "showFirstFrame": true,
            "transparent": true
        }


        theSequence = new sequencerClass(sequenceConfig);

        PRELOAD.loadGroupWithID("mrPeanut", initSequence, "array");

        $(instructionsView).bind(instructionsView.CLOSE, function () {
            instructionsClosed = true;
            checkPlay();

        });

    }

    function initSequence(theImages) {

        isLoaded = true;
        theSequence.init(theImages);
        self.resize();


        checkPlay();


    }

    function checkPlay() {
        if (isLoaded && instructionsClosed) {
            theSequence.play();
        }
    }

    self.resize = function () {
        if (isLoaded) {
            var el = theSequence.getElement();
            var dim = theSequence.getImageDim();

            var ar = dim.w / dim.h;

            var height = Math.max(dim.h, CONFIG.windowHeight * 0.55);
            var width = height * ar;
            var top = CONFIG.windowHeight - height - height * 0.1;
            var left = CONFIG.windowWidth * 0.1;

            el.css({
                "top": top,
                "width": width,
                "height": height,
                "left": left

            });

            theSequence.resize();

        }
    }
}
var instructionsView = new instructionsViewClass();

function instructionsViewClass() {

    var self = this;

    self.init = function () {
        $("#instructions").click(function () {
            $(this).fadeOut();
            $(self).trigger(self.CLOSE);
        });
    }

    self.resize = function () {

        var height = $(".instructions-container").height();
        var width = Math.min(650, CONFIG.contentWidth * 0.8);


        var top = ( CONFIG.windowHeight - height ) / 2.5;

        $(".instructions-container").css({
            "top": top,
            "width": width,
            "left": ( CONFIG.contentWidth - width ) / 2
        });
    }

}

instructionsViewClass.prototype.CLOSE = "instructionsClose";