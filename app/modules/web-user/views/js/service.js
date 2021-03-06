(function() {
    'use strict';

    angular.module("User")
        .service("UserService", UserService)
        .service("LogService", LogService);

    function UserService($http) {
        var account;
        return {
            login: function(data) {
                return $http({
                    method: "POST",
                    url: apiPath + "/api/user/login",
                    data: data
                });
            },
            logout: function(data) {
                return $http({
                    method: "GET",
                    url: apiPath + "/api/user/logout",
                });
            },
            account: function(data) {
                if (!account) {
                    account = $http({
                        method: "GET",
                        url: apiPath + "/api/user/account",
                    });
                }
                return account;
            },
            register: function(data) {
                return $http({
                    method: "POST",
                    url: apiPath + "/api/user/register",
                    data: data
                });
            },
            update: function(data) {
                return $http({
                    method: "POST",
                    url: apiPath + "/api/user/update",
                    data: data
                });
            },
            extendAccessToken: function(data) {
                return $http({
                    method: "POST",
                    url: apiPath + "/api/user/extendAccessToken",
                    data: data
                });
            },
        }
    }

    function LogService($http) {
        var account;
        return {
            getCampaignLogs: function(data) {
                return $http({
                    method: "POST",
                    url: apiPath + "/api/log/getCampaignLogs",
                    data: data
                });
            },
        }
    }
})();