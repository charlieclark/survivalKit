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