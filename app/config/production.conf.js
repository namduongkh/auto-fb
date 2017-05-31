'use strict';

module.exports = {
    web: {
        settings: {
            services: {
                apiUrl: 'http://fbauto.tk',
                webUrl: 'http://fbauto.tk',
            },
        },
        assets: {
            js: [
                '/libs/jquery/dist/jquery.min.js',
                '/libs/angular/angular.min.js',
                '/libs/bootstrap/dist/js/bootstrap.min.js',
                '/libs/angular-cookies/angular-cookies.min.js',
                '/libs/angular-animate/angular-animate.min.js',
                '/libs/angular-messages/angular-messages.min.js',
                '/libs/angular-toastr/dist/angular-toastr.tpls.min.js',
                '/libs/angular-loading-bar/build/loading-bar.min.js',
                '/libs/ng-facebook/ngFacebook.js',
                '/libs/ng-file-upload/ng-file-upload.min.js',
                '/libs/async/dist/async.min.js',
                '/libs/moment/min/moment.min.js',
                '/libs/moment/min/locales.min.js',
                '/libs/moment/min/moment-with-locales.min.js',
                '/libs/moment/locale/vi.js',
                '/libs/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                '/libs/angular-eonasdan-datetimepicker/dist/angular-eonasdan-datetimepicker.min.js',

                // '/assets/js/app.js',
                // '/assets/js/config.js',
                '/assets/min/app.min.js',
            ],
            css: [
                '/libs/bootstrap/dist/css/bootstrap.min.css',
                '/libs/bootstrap/dist/css/bootstrap-theme.min.css',
                '/libs/font-awesome/css/font-awesome.min.css',
                '/libs/angular-loading-bar/build/loading-bar.min.css',
                '/libs/angular-toastr/dist/angular-toastr.min.css',
                '/libs/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',

                // '/assets/css/styles.css',
                '/assets/min/app.min.css',
            ]
        }
    }
};