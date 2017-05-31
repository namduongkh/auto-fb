(function() {
    'use strict';

    angular.module('Schedule', [])
        .config(function($interpolateProvider) {
            $interpolateProvider.startSymbol('{[');
            $interpolateProvider.endSymbol(']}');
        });
})();