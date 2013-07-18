var CSS = CSS || {};

(function cssClass() {
    var self = CSS;

    self.init = function () {

        if (!CONFIG.isDev || CONFIG.liveEdit) {
            return;
        }

        //DISABLE THE DEFAULT GLOBAL.CSS stylesheet (the first one)
        document.styleSheets[0].disabled = true;

        //PREVENT local storage from caching the css less scripts

        var ljs = '<script> localStorage.clear(); </script>';
        document.write(ljs);


        //ADD THE LESS COMPILER AND LESS FILES.
        var sjs = '<script src="' + CONFIG.assetPath + '/js/libs/less-1.3.0.min.js"><\/script>';
        document.write(sjs);

        var linkrel = '<link rel="stylesheet/less" type="text/css" href="' + CONFIG.assetPath + '/css/global.less">';

        $('head').append(linkrel);

    }

    self.init();
})(CSS)