(function() {
    'use strict';

    angular.module("Album")
        .controller("AlbumController", AlbumController);

    function AlbumController(UserService, AlbumService, $cookies, $rootScope, toastr, $timeout, $facebook, $http, Upload) {
        var albumCtrl = this;
        albumCtrl.accountInfo = {};

        albumCtrl.getAccount = function() {
            UserService.account().then(function(resp) {
                if (resp.status == 200) {
                    albumCtrl.accountInfo = resp.data;
                    if (new Date(albumCtrl.accountInfo.tokenExpire) < new Date()) {
                        albumCtrl.accountInfo.accessToken = "";
                    }
                }
            });
        };

        albumCtrl.init = function() {
            albumCtrl.getAccount();
            AlbumService.getAlbums()
                .then(function(resp) {
                    if (resp.status == 200) {
                        albumCtrl.listAlbums = resp.data;
                    } else {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    }
                })
                .catch(function() {
                    toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                });
        };

        albumCtrl.saveAlbum = function(valid) {
            if (!valid) {
                toastr.error("Kiểm tra lại dữ liệu và thử lại.", "Lỗi!");
                return;
            }
            if (!albumCtrl.album.photos) {
                albumCtrl.album.photos = [];
            }
            if (albumCtrl.tmpPhotoNames) {
                albumCtrl.album.photos = albumCtrl.album.photos.concat(albumCtrl.tmpPhotoNames);
            }
            AlbumService.saveAlbum(albumCtrl.album)
                .then(function(resp) {
                    if (resp.status == 200) {
                        var parallel = [];
                        console.log("image", albumCtrl.tmpPhotos, albumCtrl.tmpPhotoNames);
                        albumCtrl.tmpPhotos.map(function(file, key) {
                            var filename = albumCtrl.tmpPhotoNames[key];
                            parallel.push(function(cb) {
                                Upload.upload({
                                        url: apiPath + "/api/upload/image",
                                        data: {
                                            file: file,
                                            filename: filename.replace(/.[^.]+$/g, ""),
                                            type: "albums/" + resp.data._id
                                        }
                                    })
                                    .then(function(response) {
                                        console.log("success", response);
                                        cb(null);
                                    }, function(response) {
                                        console.log("err", response);
                                        cb(true)
                                    }, function(evt) {
                                        // file.progress = Math.min(100, parseInt(100.0 *
                                        //     evt.loaded / evt.total));
                                    });
                            });
                        });

                        async.parallel(parallel, function(err, results) {
                            albumCtrl.defaultPhotos();
                            if (!albumCtrl.album._id) {
                                if (!albumCtrl.listAlbums) {
                                    albumCtrl.listAlbums = [];
                                }
                                albumCtrl.listAlbums.unshift(resp.data);
                            } else {
                                for (var i in albumCtrl.listAlbums) {
                                    if (albumCtrl.listAlbums[i]._id == albumCtrl.album._id) {
                                        albumCtrl.listAlbums[i] = resp.data;
                                        break;
                                    }
                                }
                            }
                            albumCtrl.album = resp.data;
                            toastr.success("Lưu album thành công.", "Thành công!");
                        });
                    } else {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    }
                })
                .catch(function(err) {
                    toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                });
        };

        albumCtrl.removeAlbum = function(albumId, index) {
            if (confirm("Bạn có chắc chắn muốn xóa?")) {
                AlbumService.removeAlbum(albumId)
                    .then(function(resp) {
                        if (resp.status == 200 && resp.data) {
                            toastr.success("Xóa album thành công.", "Thành công!");
                            albumCtrl.listAlbums.splice(index, 1);
                            albumCtrl.resetAlbum();
                        } else {
                            toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                        }
                    })
                    .catch(function(err) {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    });
            }
        };

        albumCtrl.selectAlbum = function(album) {
            albumCtrl.album = album;
            albumCtrl.defaultPhotos();
            Common.scrollTo("#album-top", 'fast');
        };

        albumCtrl.resetAlbum = function() {
            albumCtrl.album = {};
            albumCtrl.defaultPhotos();
        };

        albumCtrl.defaultPhotos = function() {
            albumCtrl.tmpPhotos = [];
            albumCtrl.tmpPhotoNames = [];
        };

        albumCtrl.defaultPhotos();

        albumCtrl.uploadFiles = function(files, invalidFiles) {
            console.log(files, invalidFiles);
            for (var i in files) {
                var file = files[i];
                albumCtrl.tmpPhotoNames.push(new Date().getTime() + "-" + file.name);
                albumCtrl.tmpPhotos.push(file);
            }
        };

        albumCtrl.removePhoto = function(index) {
            albumCtrl.tmpPhotos.splice(index, 1);
            albumCtrl.tmpPhotoNames.splice(index, 1);
        };

        albumCtrl.removeSavedPhoto = function(index) {
            albumCtrl.album.photos.splice(index, 1);
        };
    }
})();