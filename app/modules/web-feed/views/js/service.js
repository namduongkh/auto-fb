(function() {
    'use strict';

    angular.module("Feed")
        .service("FeedService", FeedService);

    function FeedService($http) {
        return {
            getFeeds: function() {
                return $http.get(apiPath + "/api/feed/getFeeds");
            },
            saveFeed: function(data) {
                return $http.post(apiPath + "/api/feed/saveFeed", data);
            },
            removeFeed: function(id) {
                return $http.post(apiPath + "/api/feed/removeFeed", { feedId: id });
            }
        }
    }
})();