(function() {
    'use strict';

    angular.module("Graph")
        .service("GraphService", GraphService);

    function GraphService($http) {
        return {
            graphApi: function(accessToken, method, apiUrl, payload) {
                method = method ? method.toLowerCase() : "get";
                method = method == 'get' ? method : "post";
                // if (apiUrl.indexOf("?") == -1) {
                //     apiUrl += "?access_token=" + accessToken;
                // } else {
                //     apiUrl += "&access_token=" + accessToken;
                // }
                if (!payload) {
                    payload = {};
                }
                payload.accessToken = accessToken;
                payload.apiUrl = apiUrl;
                payload.method = method;
                return $http.post(apiPath + "/api/user/graphApi", payload);
            }
        }
    }
})();