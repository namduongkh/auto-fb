(function() {
    'use strict';

    angular.module("Graph")
        .controller("GraphController", GraphController);

    function GraphController(UserService, FeedService, GraphService, AlbumService, $cookies, $rootScope, toastr, $timeout, $facebook, $http, $window) {
        var graphCtrl = this;
        graphCtrl.accountInfo = {};

        graphCtrl.getAccount = function() {
            UserService.account().then(function(resp) {
                if (resp.status == 200) {
                    graphCtrl.accountInfo = resp.data;
                    if (new Date(graphCtrl.accountInfo.tokenExpire) < new Date()) {
                        graphCtrl.accountInfo.accessToken = "";
                    }
                }
            });
        };

        graphCtrl.init = function() {
            graphCtrl.getAccount();
            FeedService.getFeeds()
                .then(function(resp) {
                    if (resp.status == 200) {
                        graphCtrl.listFeeds = resp.data;
                    } else {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    }
                })
                .catch(function() {
                    toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                });
            AlbumService.getAlbums()
                .then(function(resp) {
                    if (resp.status == 200) {
                        graphCtrl.listAlbums = resp.data;
                    } else {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    }
                })
                .catch(function() {
                    toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                });
        };

        graphCtrl.postPhotoToAlbum = function() {
            var parallel = [];
            graphCtrl.albumId.photos.map(function(photo) {
                parallel.push(function(cb) {
                    console.log("ss", $window.settings.services.webUrl + "/files/albums/" + graphCtrl.albumId._id + "/" + photo);
                    GraphService.graphApi(graphCtrl.accountInfo.accessToken, "post", `/${graphCtrl.createdAlbumId}/photos`, {
                            // "url": $window.settings.services.webUrl + "/files/albums/" + graphCtrl.albumId._id + "/" + photo
                            "url": "https://www.w3schools.com/css/img_fjords.jpg"
                        })
                        .then(function(resp) {
                            if (resp.status == 200) {
                                cb(null, resp.data);
                            } else {
                                cb(true);
                            }
                        })
                        .catch(function() {
                            cb(true);
                        });
                });
            });
            async.parallel(parallel, function(err, results) {
                if (err) {
                    console.log("POST PHOTO", err);
                    toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                } else {
                    toastr.success("Đăng hình ảnh lên album thành công.", "Thành công!");
                }
            });
        };

        graphCtrl.postGroup = function(valid) {
            if (!valid) {
                toastr.error("Kiểm tra lại dữ liệu và thử lại sau.", "Lỗi!");
                return;
            }
            // console.log("post", graphCtrl.feedId, graphCtrl.groupId);
            var promise;
            if (graphCtrl.postType == 0) {
                promise = GraphService.graphApi(graphCtrl.accountInfo.accessToken, "post", `/${graphCtrl.groupId}/feed`, {
                    "message": graphCtrl.feedId.message
                });
            } else if (graphCtrl.postType == 1) {
                promise = GraphService.graphApi(graphCtrl.accountInfo.accessToken, "post", `/${graphCtrl.groupId}/albums`, {
                    "name": graphCtrl.albumId.name,
                    "message": graphCtrl.albumId.message,
                });
            }
            promise.then(function(resp) {
                    if (resp.status == 200) {
                        console.log("Post group data:", resp.data);
                        toastr.success("Đã đăng lên nhóm thành công.", "Thành công!");

                        if (graphCtrl.postType == 1) {
                            graphCtrl.createdAlbumId = resp.data.id;
                            if (graphCtrl.createdAlbumId) {
                                graphCtrl.postPhotoToAlbum();
                            }
                        }
                    } else {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    }
                })
                .catch(function(err) {
                    console.log("Err", err);
                    toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                });
        };
    }
})();