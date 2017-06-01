'use strict';

angular.module('auth').controller('AuthenticationController', ['$scope', '$http', '$location', '$window', 'Authentication', '$cookies',
    function($scope, $http, $location, $window, Authentication, $cookies) {
        $scope.authentication = Authentication;

        $scope.signin = function() {
            var data = $scope.credentials;
            data.scope = 'admin';
            $http.post($window.settings.services.apiUrl + '/api/user/login', data)
                .then(function(response) {
                    if (response.data.token) {
                        $cookies.put('token', response.data.token, {
                            path: "/"
                        });
                        $window.location.href = '/';
                    }
                    $scope.error = response.message;
                })
                .catch(function(response) {
                    $scope.error = response.message;
                    console.log($scope.error);
                });
        };

        $scope.signout = function() {
            $http.get($window.settings.services.apiUrl + '/api/user/logout')
                .then(function(response) {
                    $scope.authentication.user = '';
                    $cookies.remove('token');
                    $window.location.href = '/';
                })
                .catch(function(response) {
                    $scope.error = response.message;
                });
        };
    }
]);