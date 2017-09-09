module.exports = {
    web: {
        js: {
            build: [
                '/libs/jquery/dist/jquery.min.js',
                '/libs/bootstrap/dist/js/bootstrap.min.js',
                '/libs/angular-cookies/angular-cookies.min.js',
                '/libs/angular-animate/angular-animate.min.js',
                '/libs/angular-messages/angular-messages.min.js',
                '/libs/angular-toastr/dist/angular-toastr.tpls.min.js',
                '/libs/angular-loading-bar/build/loading-bar.min.js',
                '/libs/ng-file-upload/ng-file-upload.min.js',
                '/libs/ng-facebook/ngFacebook.js',
                '/libs/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                '/libs/angular-eonasdan-datetimepicker/dist/angular-eonasdan-datetimepicker.min.js',
                '/libs/angular-ui-select/dist/select.min.js',

                '/assets/js/app.js',
                '/assets/js/config.js',
            ],
            concat: [
                '/libs/angular/angular.min.js',
                '/libs/async/dist/async.min.js',
                '/libs/moment/min/moment.min.js',
                // '/libs/moment/min/locales.min.js',
                '/libs/moment/locale/vi.js',
                '/libs/moment/min/moment-with-locales.min.js',
            ],
            noaction: [
                'https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.6.6/tinymce.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-tinymce/0.0.19/tinymce.min.js',
            ]
        },
        css: {
            concat: [
                '/libs/bootstrap/dist/css/bootstrap.min.css',
                '/libs/font-awesome/css/font-awesome.min.css',
            ],
            build: [
                '/libs/bootstrap/dist/css/bootstrap-theme.min.css',
                '/libs/angular-loading-bar/build/loading-bar.min.css',
                '/libs/angular-toastr/dist/angular-toastr.min.css',
                '/libs/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                '/libs/angular-ui-select/dist/select.min.css',
                '/assets/css/styles.css',
            ],
        }
    },
    admin: {
        js: {
            build: [
                '/libs/jquery/dist/jquery.min.js',
                '/libs/bootstrap/dist/js/bootstrap.min.js',
                '/libs/AdminLTE/dist/js/app.min.js',
                '/libs/angular-resource/angular-resource.js',
                '/libs/angular-animate/angular-animate.js',
                '/libs/angular-cookies/angular-cookies.min.js',
                '/libs/angular-local-storage/dist/angular-local-storage.min.js',
                '/libs/angular-sanitize/angular-sanitize.min.js',
                '/libs/angular-messages/angular-messages.min.js',
                '/libs/ng-file-upload/ng-file-upload.min.js',
                '/assets/js/app-admin.js',
            ],
            noaction: [
                'https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.6.6/tinymce.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-tinymce/0.0.19/tinymce.min.js',
            ],
            concat: [
                '/libs/angular/angular.min.js',
                '/libs/angular-ui-router/release/angular-ui-router.js',
            ]
        },
        css: {
            concat: [
                '/libs/AdminLTE/bootstrap/css/bootstrap.min.css',
                '/libs/font-awesome/css/font-awesome.min.css',
            ],
            build: [
                '/libs/AdminLTE/dist/css/skins/skin-blue.min.css',
                '/libs/AdminLTE/dist/css/AdminLTE.min.css',
                '/assets/css/styles-admin.css',
            ]
        }
    }
};