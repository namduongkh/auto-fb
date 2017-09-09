(function() {
    'use strict';

    angular.module('Core')
        .directive("errorMessage", errorMessage)
        .directive("showLoading", showLoading)
        .directive("tooltipInit", tooltipInit);

    function errorMessage() {
        return {
            restrict: "AE",
            templateUrl: "modules/web-core/views/js/template/error-message.html",
            replace: true,
            scope: {
                errorMessage: "=",
                matchTarget: "=",
                typeContent: "=",
                stepValue: "="
            },
            link: function(scope, elem, attr) {
                function setMatchError() {
                    if (scope.typeContent && scope.matchTarget && scope.typeContent != scope.matchTarget) {
                        scope.errorMessage.match = true;
                    } else {
                        scope.errorMessage.match = false;
                    }
                }
                scope.$watch("typeContent", function(value) {
                    setMatchError();
                });
                scope.$watch("matchTarget", function(value) {
                    setMatchError();
                });
            }
        }
    }

    function showLoading() {
        return {
            restrict: "A",
            scope: {
                showLoading: "="
            },
            link: function(scope, elem, attr) {
                scope.$watch('showLoading', function(value) {
                    if (value) {
                        $(elem).fadeIn('fast');
                    }
                });
            }
        };
    }

    function tooltipInit() {
        return {
            restrict: "A",
            link: function(scope, elem, attr) {
                elem.attr("title", attr.tooltipInit);
                $(elem).tooltip();
            }
        };
    }
})();