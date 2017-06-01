'use strict';

module.exports = {
    web: {
        settings: {
            services: {
                apiUrl: 'http://localhost:3100',
                webUrl: 'http://localhost:3000',
                adminUrl: 'http://localhost:3200/admin',
            },
        },
        assets: {
            web: {
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

                    '/assets/js/app.js',
                    '/assets/js/config.js',
                    // '/assets/min/app.min.js',
                ],
                css: [
                    '/libs/bootstrap/dist/css/bootstrap.min.css',
                    '/libs/bootstrap/dist/css/bootstrap-theme.min.css',
                    '/libs/font-awesome/css/font-awesome.min.css',
                    '/libs/angular-loading-bar/build/loading-bar.min.css',
                    '/libs/angular-toastr/dist/angular-toastr.min.css',
                    '/libs/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',

                    '/assets/css/styles.css',
                    // '/assets/min/app.min.css',
                ]
            },
            admin: {
                css: [
                    '/libs/AdminLTE/bootstrap/css/bootstrap.min.css',
                    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css',
                    'https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css',
                    '/libs/AdminLTE/plugins/datatables/dataTables.bootstrap.css',
                    '/libs/AdminLTE/dist/css/skins/skin-blue.min.css',
                    '/libs/AdminLTE/plugins/select2/select2.min.css',
                    '/libs/AdminLTE/dist/css/AdminLTE.min.css',

                    '/assets/css/styles-admin.css',
                ],
                js: [
                    'https://cdn.ckeditor.com/4.4.3/standard/ckeditor.js',
                    '/libs/jquery/dist/jquery.min.js',
                    '/libs/bootstrap/dist/js/bootstrap.min.js',
                    '/libs/AdminLTE/dist/js/app.min.js',
                    '/libs/angular/angular.min.js',
                    '/libs/angular-resource/angular-resource.js',
                    '/libs/angular-animate/angular-animate.js',
                    '/libs/angular-ui-router/release/angular-ui-router.js',
                    '/libs/angular-cookies/angular-cookies.min.js',
                    '/libs/angular-local-storage/dist/angular-local-storage.min.js',
                    '/libs/angular-sanitize/angular-sanitize.min.js',
                    '/libs/AdminLTE/plugins/select2/select2.min.js',
                    '/libs/angular-messages/angular-messages.min.js',
                    '/libs/ng-file-upload/ng-file-upload.min.js',

                    '/assets/js/app-admin.js',
                ]
            }
        }
    }
};