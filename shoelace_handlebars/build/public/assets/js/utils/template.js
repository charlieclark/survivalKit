var TEMPLATE = TEMPLATE || {};

(function templateClass() {

    var self = TEMPLATE;

    self.init = function () {

        //creating globa ref
        Handlebars.registerHelper('global', function (name) {
            return copyData.global[name]
        });
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

    self.init();


})(TEMPLATE)