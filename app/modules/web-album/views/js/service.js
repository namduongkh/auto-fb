(function() {
    'use strict';

    angular.module("Album")
        .service("AlbumService", AlbumService);

    function AlbumService($http) {
        return {
            getAlbums: function() {
                return $http.get(apiPath + "/api/album/getAlbums");
            },
            saveAlbum: function(data) {
                return $http.post(apiPath + "/api/album/saveAlbum", data);
            },
            removeAlbum: function(id) {
                return $http.post(apiPath + "/api/album/removeAlbum", { albumId: id });
            }
        }
    }
})();