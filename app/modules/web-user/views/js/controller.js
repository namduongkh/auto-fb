(function() {
    'use strict';

    angular.module("User")
        .controller("UserController", UserController);

    function UserController(UserService, $cookies, $rootScope, toastr, $timeout, $facebook, $http, LogService) {
        var userCtrl = this;
        userCtrl.accountInfo = {};
        userCtrl.showLoading = false;

        userCtrl.showApiError = function(message) {
            if (window.location.href.search("/trang-ca-nhan") == -1 &&
                window.location.href.search("/trang/") == -1 &&
                window.location.href.search("/tro-giup") == -1) {
                toastr.error(message, "Lỗi");
                $timeout(function() {
                    window.location.href = window.settings.services.webUrl + "/trang-ca-nhan";
                }, 2000);
            }
        }

        $rootScope.$on("NO_ACCESS_TOKEN_ERROR", function() {
            userCtrl.showApiError("Bạn chưa có mã truy cập, hãy đến trang cá nhân, bổ sung thông tin và nhận mã truy cập.");
        });

        $rootScope.$on("TOKEN_HAS_EXPIRED_ERROR", function() {
            userCtrl.showApiError("Mã truy cập đã hết hạn, hãy đến trang cá nhân và cập nhật mã truy cập.");
        });

        userCtrl.getAccount = function() {
            UserService.account().then(function(resp) {
                    if (resp.status == 200) {
                        userCtrl.accountInfo = resp.data;
                        if (resp.data.appId && resp.data.appSecret) {
                            userCtrl.appIdValid = true;
                        }
                        if (new Date(userCtrl.accountInfo.tokenExpire) < new Date()) {
                            userCtrl.accountInfo.accessToken = "";
                        }
                        if (userCtrl.accountInfo.includes('admin')) {
                            userCtrl.accountInfo.isAdmin = true;
                        }
                        userCtrl.showLoading = true;
                    }
                })
                .catch(function() {
                    userCtrl.showLoading = true;
                });
        };

        userCtrl.getAccount();

        userCtrl.login = function(valid) {
            if (!valid) {
                toastr.error("Kiểm tra lại dữ liệu và thử lại.", "Lỗi!");
                return;
            }
            UserService.login({
                    email: userCtrl.form.email,
                    password: userCtrl.form.password,
                })
                .then(function(resp) {
                    if (resp.status == 200 && (resp.data.token || resp.data.appId)) {
                        if (resp.data.token) {
                            $cookies.put('token', resp.data.token, {
                                path: "/"
                            });
                        }
                        if (resp.data.appId) {
                            $cookies.put('appId', resp.data.appId, {
                                path: "/"
                            });
                        }
                        window.location.reload();
                    } else {
                        toastr.error("Đăng nhập không hợp lệ.", "Lỗi!");
                    }
                })
                .catch(function(err) {
                    toastr.error(err.data.message, "Lỗi!");
                });
        };

        userCtrl.logout = function() {
            UserService.logout()
                .then(function(res) {
                    $cookies.remove('token');
                    window.location.reload();
                }).catch(function(res) {
                    $cookies.remove('token');
                    window.location.reload();
                });
        };

        userCtrl.register = function(valid) {
            if (!valid) {
                toastr.error("Kiểm tra lại thông tin đã nhập.", "Lỗi!");
                return;
            }
            UserService.register({
                    email: userCtrl.form.email,
                    password: userCtrl.form.password,
                    name: userCtrl.form.name,
                })
                .then(function(resp) {
                    console.log("Resp", resp);
                    // window.location.reload();
                    toastr.success("Đăng ký tài khoản thành công!", "Thông báo!");
                    $timeout(function() {
                        userCtrl.login(true);
                    }, 2000);
                })
                .catch(function(resp) {
                    var error = resp.data;
                    toastr.error(error.message || error, "Thông báo!");
                });
        };

        function updateProfile(data, reload, message) {
            UserService.update(data)
                .then(function(resp) {
                    console.log("Resp", resp);
                    // window.location.reload();
                    message = message || "Cập nhật tài khoản thành công.";
                    if (reload) {
                        message += " Đang làm mới trang.";
                    }
                    toastr.success("Cập nhật tài khoản thành công!", "Thông báo!");
                    if (resp.data.appId) {
                        $cookies.put('appId', resp.data.appId, {
                            path: "/"
                        });
                    }
                    if (reload) {
                        $timeout(function() { window.location.reload(); }, 2000);
                    }
                })
                .catch(function(resp) {
                    var error = resp.data;
                    toastr.error(error.message || error, "Thông báo!");
                });
        }

        userCtrl.update = function(valid) {
            if (!valid) {
                toastr.error("Kiểm tra lại thông tin đã nhập.", "Lỗi!");
                return;
            }
            updateProfile({
                name: userCtrl.accountInfo.name,
                appId: userCtrl.accountInfo.appId,
                timelineId: userCtrl.accountInfo.timelineId,
                accessToken: userCtrl.accountInfo.accessToken,
                appSecret: userCtrl.accountInfo.appSecret,
                tokenExpire: userCtrl.accountInfo.tokenExpire,
                removeAccessToken: !userCtrl.appIdValid
            }, true);
        };

        userCtrl.getAccessToken = function() {
            $facebook.login().then(function(resp) {
                console.log("getAccessToken", resp);
                if (resp.authResponse && resp.authResponse.accessToken) {
                    // userCtrl.accountInfo.accessToken = resp.authResponse.accessToken;
                    var existed = false;
                    for (var i = 0; i < userCtrl.accountInfo.timelineId.length; i++) {
                        if (userCtrl.accountInfo.timelineId[i].type == 'personal') {
                            existed = true;
                            break;
                        }
                    }
                    if (!existed) {
                        userCtrl.accountInfo.timelineId.unshift({
                            type: 'personal',
                            id: resp.authResponse.userID,
                            name: 'Dòng thời gian cá nhân'
                        });
                    }
                    userCtrl.extendToken(resp.authResponse.accessToken);
                }
            });
        };

        userCtrl.extendToken = function(token) {
            // $facebook.api(`/oauth/access_token?grant_type=fb_exchange_token&client_id=${userCtrl.accountInfo.appId}&client_secret=${userCtrl.accountInfo.appSecret}&fb_exchange_token=${userCtrl.accountInfo.accessToken}`)
            //     .then(function(resp) {
            //         console.log("extendToken", resp);
            //     });
            UserService.extendAccessToken({
                    accessToken: token,
                    appId: userCtrl.accountInfo.appId,
                    appSecret: userCtrl.accountInfo.appSecret,
                })
                .then(function(resp) {
                    if (resp.status == 200) {
                        userCtrl.accountInfo.accessToken = resp.data.access_token;
                        userCtrl.accountInfo.tokenExpire = new Date(new Date().getTime() + resp.data.expires_in * 1000);
                        userCtrl.update(true);
                    }
                });
        };

        userCtrl.getTimelineInfo = function(keyword, type) {
            if (!keyword || !type) {
                toastr.error("Nhập từ khóa tìm kiếm và chọn 1 loại dòng thời gian", "Lỗi");
                return;
            } else {
                userCtrl.isLoading = true;
                $facebook.api(`/search?q=${keyword}&type=${type}&access_token=${userCtrl.accountInfo.accessToken}`)
                    .then(function(resp) {
                        console.log("get group info", resp);
                        if (resp.data && resp.data.length) {
                            userCtrl.listTimelines = resp.data;
                            // for (var i in resp.data) {
                            //     var fetchData = resp.data[i];
                            //     var exist = false;
                            //     for (var j in userCtrl.accountInfo.groups) {
                            //         var groupData = userCtrl.accountInfo.groups[j];
                            //         if (fetchData.id == groupData.id) {
                            //             exist = true;
                            //             break;
                            //         }
                            //     }
                            //     if (!exist) {
                            //         userCtrl.accountInfo.groups.unshift(fetchData);
                            //     }
                            // }
                            // updateProfile({
                            //     groups: userCtrl.accountInfo.groups
                            // }, false, "Đã cập nhật danh sách nhóm thành công.");
                        } else {
                            toastr.error("Không lấy được thông tin.", "Lỗi!");
                        }
                        userCtrl.isLoading = false;
                    }, function(err) {
                        console.log("timeline info", err);
                        userCtrl.isLoading = false;
                    });
            }
        };

        userCtrl.removeTimeline = function(index) {
            if (confirm("Bạn có chắc chắn muốn xóa?")) {
                var timelineId = userCtrl.accountInfo.timelineId.splice(index, 1);
                updateProfile({
                    timelineId: userCtrl.accountInfo.timelineId,
                    removeTimelineId: timelineId
                }, false, "Đã cập nhật danh sách nhóm thành công.");
            }
        };

        // userCtrl.fetchGroup = function() {
        //     $facebook.api(`/me?fields=groups&access_token=${userCtrl.accountInfo.accessToken}`)
        //         .then(function(resp) {
        //             console.log("resp", resp);
        //         }, function(err) {
        //             console.log("err", err);
        //         });
        // };

        userCtrl.resetAccessToken = function() {
            userCtrl.appIdValid = false;
            userCtrl.accountInfo.accessToken = null;
            userCtrl.accountInfo.tokenExpire = null;
        };

        userCtrl.resetListTimeline = function() {
            userCtrl.listTimelines = [];
        };

        userCtrl.addTimeline = function(timeline) {
            var fetchData = timeline;
            var exist = false;
            for (var j in userCtrl.accountInfo.timelineId) {
                var timelineData = userCtrl.accountInfo.timelineId[j];
                if (fetchData.id == timelineData.id) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                userCtrl.accountInfo.timelineId.unshift({
                    type: userCtrl.timelineType,
                    id: fetchData.id,
                    name: fetchData.name
                });
            }
            timeline.disableClass = 'disabled';
            updateProfile({
                timelineId: userCtrl.accountInfo.timelineId,
            }, false, "Đã cập nhật danh sách nhóm thành công.");
        };

        userCtrl.campaignLog = {
            list: [],
            page: 1
        };

        userCtrl.getCampaignLogs = function() {
            LogService.getCampaignLogs({
                    page: userCtrl.campaignLog.page
                })
                .then(function(resp) {
                    userCtrl.campaignLog.list = userCtrl.campaignLog.list.concat(resp.data.items);
                    userCtrl.campaignLog.page++;
                })
                .catch(function(err) {
                    console.log("err", err);
                });
        };
    }
})();