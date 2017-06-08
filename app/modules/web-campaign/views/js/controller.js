(function() {
    'use strict';

    angular.module("Campaign")
        .controller("CampaignController", CampaignController);

    function CampaignController(UserService, CampaignService, FeedService, AlbumService, $cookies, $scope, $rootScope, toastr, $timeout, $facebook, $http) {
        var campaignCtrl = this;
        campaignCtrl.accountInfo = {};

        campaignCtrl.getAccount = function() {
            UserService.account().then(function(resp) {
                if (resp.status == 200) {
                    campaignCtrl.accountInfo = resp.data;
                    if (new Date(campaignCtrl.accountInfo.tokenExpire) < new Date()) {
                        campaignCtrl.accountInfo.accessToken = "";
                    }
                }
            });
        };

        campaignCtrl.init = function() {
            campaignCtrl.getAccount();
            CampaignService.getCampaigns()
                .then(function(resp) {
                    if (resp.status == 200) {
                        campaignCtrl.listCampaigns = resp.data;
                    } else {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    }
                })
                .catch(function() {
                    toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                });
        };

        campaignCtrl.saveCampaign = function(valid) {
            if (!valid) {
                toastr.error("Kiểm tra lại dữ liệu và thử lại.", "Lỗi!");
                return;
            }
            CampaignService.saveCampaign(campaignCtrl.campaign)
                .then(function(resp) {
                    if (resp.status == 200) {
                        if (!campaignCtrl.campaign._id) {
                            if (!campaignCtrl.listCampaigns) {
                                campaignCtrl.listCampaigns = [];
                            }
                            campaignCtrl.listCampaigns.unshift(resp.data);
                        } else {
                            for (var i in campaignCtrl.listCampaigns) {
                                if (campaignCtrl.listCampaigns[i]._id == campaignCtrl.campaign._id) {
                                    campaignCtrl.listCampaigns[i] = resp.data;
                                    break;
                                }
                            }
                        }
                        $scope.CampaignForm.$setPristine();
                        campaignCtrl.campaign = resp.data;
                        toastr.success("Lưu chiến dịch thành công.", "Thành công!");
                    } else {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    }
                })
                .catch(function(err) {
                    toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                });
        };

        campaignCtrl.removeCampaign = function(campaignId, index) {
            if (confirm("Bạn có chắc chắn muốn xóa?")) {
                CampaignService.removeCampaign(campaignId)
                    .then(function(resp) {
                        if (resp.status == 200 && resp.data) {
                            toastr.success("Xóa chiến dịch thành công.", "Thành công!");
                            campaignCtrl.listCampaigns.splice(index, 1);
                            campaignCtrl.resetCampaign();
                        } else {
                            toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                        }
                    })
                    .catch(function(err) {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    });
            }
        };

        campaignCtrl.runCampaign = function(campaignId) {
            if (confirm("Bạn chắc chắn muốn chạy chiến dịch này?")) {
                CampaignService.runCampaign(campaignId)
                    .then(function(resp) {
                        if (resp.status == 200 && resp.data) {
                            toastr.success(resp.data.msg, "Thành công!");
                            // campaignCtrl.resetCampaign();
                        } else {
                            toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                        }
                    })
                    .catch(function(err) {
                        toastr.error(err.data.message, "Lỗi!");
                    });
            }
        };

        campaignCtrl.selectCampaign = function(campaign) {
            campaignCtrl.campaign = campaign;
            Common.scrollTo("#campaign-top", 'fast');
            campaignCtrl.postTypeChange();
            campaignCtrl.filterTimeline();
        };

        campaignCtrl.resetCampaign = function() {
            campaignCtrl.campaign = {};
        };

        campaignCtrl.postTypeChange = function() {
            if (campaignCtrl.campaign.postType == "feed") {
                FeedService.getFeeds()
                    .then(function(resp) {
                        if (resp.status == 200) {
                            campaignCtrl.listFeeds = resp.data;
                        } else {
                            toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                        }
                    })
                    .catch(function() {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    });
            } else {
                AlbumService.getAlbums()
                    .then(function(resp) {
                        if (resp.status == 200) {
                            campaignCtrl.listAlbums = resp.data;
                        } else {
                            toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                        }
                    })
                    .catch(function() {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    });
            }
        };

        campaignCtrl.filterTimeline = function() {
            campaignCtrl.timelineList = campaignCtrl.accountInfo.timelineId.filter(function(timeline) {
                if (!campaignCtrl.campaign.timeline) {
                    return timeline;
                } else if (timeline.type == campaignCtrl.campaign.timeline) {
                    return timeline;
                }
            });
        };
    }
})();