/*global define*/
define( function (require) {

    //dependencies
    var assetData           = require('data/imageData');
    var Common              = require('common');

    //begin module
    var self = {};

    var imagePreloadArray = [];

    var basePath = null;
    var AWSPath = null;

    self.init = function () {
        basePath = Common.imagePath + "/";
        AWSPath = Common.AWSPath + "/";
        return self;
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

        console.log(groupID)

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

        console.log(imageArray , callback , returnType , self)

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


    return self.init();
});