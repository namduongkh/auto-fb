(function() {
    'use strict';

    angular.module('Core')
        .factory('PreResponse', PreResponse)
        .config(['$httpProvider', function($httpProvider) {
            $httpProvider.interceptors.push('PreResponse');
        }]);

    function PreResponse($rootScope, $timeout, $q) {
        return {
            response: function(response) {
                // console.log("Chạy vào đây");
                if (response.status == 200) {
                    if (response.data.noAccessToken) {
                        $rootScope.$broadcast("NO_ACCESS_TOKEN_ERROR");
                    }
                    if (response.data.tokenHasExpired) {
                        $rootScope.$broadcast("TOKEN_HAS_EXPIRED_ERROR");
                    }
                    if (response.data.rejectApi) {
                        return $q.reject({
                            status: false,
                            data: {
                                message: 'You have access token!'
                            },
                            handle: 'PreResponse'
                        });
                    }
                }
                return response;
            },
        }
    };
})();