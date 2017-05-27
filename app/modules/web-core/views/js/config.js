(function() {
    'use strict';

    angular.module('Core', [])
        .config(function($interpolateProvider) {
            $interpolateProvider.startSymbol('{[');
            $interpolateProvider.endSymbol(']}');
        });
})();
var sideMenu = (function() {
    return {
        open: function() {

        },
        close: function() {

        }
    }
})();