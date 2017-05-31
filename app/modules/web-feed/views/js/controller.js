(function() {
    'use strict';

    angular.module("Feed")
        .controller("FeedController", FeedController);

    function FeedController(UserService, FeedService, $cookies, $rootScope, toastr, $timeout, $facebook, $http) {
        var feedCtrl = this;
        feedCtrl.accountInfo = {};

        feedCtrl.getAccount = function() {
            UserService.account().then(function(resp) {
                if (resp.status == 200) {
                    feedCtrl.accountInfo = resp.data;
                    if (new Date(feedCtrl.accountInfo.tokenExpire) < new Date()) {
                        feedCtrl.accountInfo.accessToken = "";
                    }
                }
            });
        };

        feedCtrl.init = function() {
            feedCtrl.getAccount();
            FeedService.getFeeds()
                .then(function(resp) {
                    if (resp.status == 200) {
                        feedCtrl.listFeeds = resp.data;
                    } else {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    }
                })
                .catch(function() {
                    toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                });
        };

        feedCtrl.saveFeed = function(valid) {
            if (!valid) {
                toastr.error("Kiểm tra lại dữ liệu và thử lại.", "Lỗi!");
                return;
            }
            FeedService.saveFeed(feedCtrl.feed)
                .then(function(resp) {
                    if (resp.status == 200) {
                        if (!feedCtrl.feed._id) {
                            if (!feedCtrl.listFeeds) {
                                feedCtrl.listFeeds = [];
                            }
                            feedCtrl.listFeeds.unshift(resp.data);
                        } else {
                            for (var i in feedCtrl.listFeeds) {
                                if (feedCtrl.listFeeds[i]._id == feedCtrl.feed._id) {
                                    feedCtrl.listFeeds[i] = resp.data;
                                    break;
                                }
                            }
                        }
                        feedCtrl.feed = resp.data;
                        toastr.success("Lưu trạng thái thành công.", "Thành công!");
                    } else {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    }
                })
                .catch(function(err) {
                    toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                });
        };

        feedCtrl.removeFeed = function(feedId, index) {
            if (confirm("Bạn có chắc chắn muốn xóa?")) {
                FeedService.removeFeed(feedId)
                    .then(function(resp) {
                        if (resp.status == 200 && resp.data) {
                            toastr.success("Xóa trạng thái thành công.", "Thành công!");
                            feedCtrl.listFeeds.splice(index, 1);
                            feedCtrl.resetFeed();
                        } else {
                            toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                        }
                    })
                    .catch(function(err) {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    });
            }
        };

        feedCtrl.selectFeed = function(feed) {
            feedCtrl.feed = feed;
            Common.scrollTo("#feed-top", 'fast');
        };

        feedCtrl.resetFeed = function() {
            feedCtrl.feed = {};
        };
    }
})();