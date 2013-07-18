module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {

            //libs


            //other scripts
            home: {

                src: [

                    'public/assets/js/libs/wipetouch.js', 'public/assets/js/libs/handlebars.js', 'public/assets/js/plugins.js', 'public/assets/js/main.js', 'public/assets/js/config.js', 'public/assets/js/imageData.js', 'public/assets/js/copyData.js', 'public/assets/js/classes/sequencer.js', 'public/assets/js/utils/general_utils.js', 'public/assets/js/utils/detection.js', 'public/assets/js/utils/preload.js', 'public/assets/js/utils/layout.js', 'public/assets/js/utils/share.js', 'public/assets/js/utils/viewHandler.js', 'public/assets/js/utils/template.js', 'public/assets/js/views/plinkoView.js', 'public/assets/js/views/mrPeanut.js', 'public/assets/js/views/instructionsView.js'
                ],

                dest: 'public/assets/js/min/site.js'
            }


        },

        uglify: {
            home: {
                src: ['public/assets/js/min/site.js'],
                dest: 'public/assets/js/min/site.min.js'
            },
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'uglify']);

};
