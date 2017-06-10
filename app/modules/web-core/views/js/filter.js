(function() {
    'use strict';

    angular.module("Core")
        .filter('shortString', shortString);

    function shortString() {
        return function(input, length) {
            length = length || 50;
            if (input && input.length > length) {
                return input.substr(0, length) + "...";
            }
            return input;
        };
    }
})();