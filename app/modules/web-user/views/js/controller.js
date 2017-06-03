(function() {
    'use strict';

    angular.module("User")
        .controller("UserController", UserController);

    function UserController(UserService, $cookies, $rootScope, toastr, $timeout, $facebook, $http) {
        var userCtrl = this;
        userCtrl.accountInfo = {};
        userCtrl.showLoading = false;

        userCtrl.showApiError = function(message) {
            if (window.location.href.search("trang-ca-nhan") == -1 &&
                window.location.href.search("trang") == -1 &&
                window.location.href.search("tro-giup") == -1) {
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
                    console.log("Resp", resp);
                    $cookies.put('token', resp.data.token, {
                        path: "/"
                    });
                    $cookies.put('appId', resp.data.appId, {
                        path: "/"
                    });
                    window.location.reload();
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
                accessToken: userCtrl.accountInfo.accessToken,
                appSecret: userCtrl.accountInfo.appSecret,
                tokenExpire: userCtrl.accountInfo.tokenExpire,
            }, true);
        };

        userCtrl.getAccessToken = function() {
            $facebook.login().then(function(resp) {
                console.log("getAccessToken", resp);
                if (resp.authResponse && resp.authResponse.accessToken) {
                    // userCtrl.accountInfo.accessToken = resp.authResponse.accessToken;
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

        userCtrl.getGroupInfo = function(groupUrl) {
            if (!groupUrl) {
                return;
            }
            var groupName = (groupUrl.replace(/\/$/g, "") + "/")
                .match(/\/groups\/([^/]*)\//g)[0]
                .replace(/\/groups\/([^/]*)\//g, "$1");
            if (groupName) {
                $facebook.api(`/search?q=${groupName}&type=group&access_token=${userCtrl.accountInfo.accessToken}`)
                    .then(function(resp) {
                        console.log("get group info", resp);
                        if (resp.data && resp.data.length) {
                            for (var i in resp.data) {
                                var fetchData = resp.data[i];
                                var exist = false;
                                for (var j in userCtrl.accountInfo.groups) {
                                    var groupData = userCtrl.accountInfo.groups[j];
                                    if (fetchData.id == groupData.id) {
                                        exist = true;
                                        break;
                                    }
                                }
                                if (!exist) {
                                    userCtrl.accountInfo.groups.unshift(fetchData);
                                }
                            }
                            updateProfile({
                                groups: userCtrl.accountInfo.groups
                            }, false, "Đã cập nhật danh sách nhóm thành công.");
                        } else {
                            toastr.error("Không lấy được thông tin.", "Lỗi!");
                        }
                    }, function(err) {
                        console.log("group info", err);
                    });
            }
        };

        userCtrl.removeGroup = function(index) {
            if (confirm("Bạn có chắc chắn muốn xóa?")) {
                userCtrl.accountInfo.groups.splice(index, 1);
                updateProfile({
                    groups: userCtrl.accountInfo.groups
                }, false, "Đã cập nhật danh sách nhóm thành công.");
            }
        };
    }
})();