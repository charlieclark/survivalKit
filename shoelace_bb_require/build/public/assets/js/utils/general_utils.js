
/*global define*/
define( function (require) {

    //dependencies
    // var $               = require('jquery');

    //begin module
    var self = {};

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



    return self;
});


