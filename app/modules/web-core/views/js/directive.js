(function() {
    'use strict';

    angular.module('Core')
        .directive("errorMessage", errorMessage)
        .directive("showLoading", showLoading)
        .directive("tooltipInit", tooltipInit)
        .directive("datetimepicker", datetimepicker);

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

    function datetimepicker($timeout) {
        return {
            restrict: 'EA',
            require: 'ngModel',
            scope: {
                options: '=?',
                onChange: '&?',
                onClick: '&?'
            },
            link: function($scope, $element, $attrs, ngModel) {
                var dpElement = $element.parent().hasClass('input-group') ? $($element.parent()) : $($element);

                $scope.$watch('options', function(newValue) {
                    var dtp = dpElement.data('DateTimePicker');
                    $.map(newValue, function(value, key) {
                        dtp[key](value);
                    });
                }, true);

                ngModel.$render = function() {
                    // if value is undefined/null do not do anything, unless some date was set before
                    var currentDate = dpElement.data('DateTimePicker').date();
                    if (!ngModel.$viewValue && currentDate) {
                        dpElement.data('DateTimePicker').clear();
                    } else if (ngModel.$viewValue) {
                        // otherwise make sure it is moment object
                        if (!moment.isMoment(ngModel.$viewValue)) {
                            ngModel.$setViewValue(moment(ngModel.$viewValue));
                        }
                        dpElement.data('DateTimePicker').date(ngModel.$viewValue);
                    }
                };

                var isDateEqual = function(d1, d2) {
                    return moment.isMoment(d1) && moment.isMoment(d2) && d1.valueOf() === d2.valueOf();
                };

                dpElement.on('dp.change', function(e) {
                    if (!isDateEqual(e.date, ngModel.$viewValue)) {
                        var newValue = e.date === false ? null : e.date;
                        ngModel.$setViewValue(newValue);

                        $timeout(function() {
                            if (typeof $scope.onChange === 'function') {
                                $scope.onChange();
                            }
                        });
                    }
                });


                dpElement.on('click', function() {
                    $timeout(function() {
                        if (typeof $scope.onClick === 'function') {
                            $scope.onClick();
                        }
                    });
                });

                dpElement.datetimepicker($scope.options);
            }
        };
    }
})();