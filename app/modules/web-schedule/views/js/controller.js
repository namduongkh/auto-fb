(function() {
    'use strict';

    angular.module("Schedule")
        .controller("ScheduleController", ScheduleController);

    function ScheduleController(UserService, CampaignService, ScheduleService, $cookies, $scope, $rootScope, toastr, $timeout, $facebook, $http) {
        var scheduleCtrl = this;
        scheduleCtrl.accountInfo = {};
        scheduleCtrl.schedule = {};
        scheduleCtrl.schedule.endTimeNumber = 3;
        scheduleCtrl.dateOptions = {
            minDate: new Date(new Date().getTime() + (60 * 60 * 1000)),
            maxDate: new Date(new Date().getTime() + (25 * 60 * 60 * 1000)),
            sideBySide: true
        };

        scheduleCtrl.getAccount = function() {
            UserService.account().then(function(resp) {
                if (resp.status == 200) {
                    scheduleCtrl.accountInfo = resp.data;
                    if (new Date(scheduleCtrl.accountInfo.tokenExpire) < new Date()) {
                        scheduleCtrl.accountInfo.accessToken = "";
                    }
                }
            });
        };

        scheduleCtrl.init = function() {
            scheduleCtrl.getAccount();
            ScheduleService.getSchedules()
                .then(function(resp) {
                    if (resp.status == 200) {
                        scheduleCtrl.listSchedules = resp.data;
                    } else {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    }
                })
                .catch(function() {
                    toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                });
            CampaignService.getCampaigns()
                .then(function(resp) {
                    if (resp.status == 200) {
                        scheduleCtrl.listCampaigns = resp.data;
                    } else {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    }
                })
                .catch(function() {
                    toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                });
        };

        scheduleCtrl.saveSchedule = function(valid) {
            if (!valid) {
                toastr.error("Kiểm tra lại dữ liệu và thử lại.", "Lỗi!");
                return;
            }
            ScheduleService.saveSchedule(scheduleCtrl.schedule)
                .then(function(resp) {
                    if (resp.status == 200) {
                        if (!scheduleCtrl.schedule._id) {
                            if (!scheduleCtrl.listSchedules) {
                                scheduleCtrl.listSchedules = [];
                            }
                            scheduleCtrl.listSchedules.unshift(resp.data);
                        } else {
                            for (var i in scheduleCtrl.listSchedules) {
                                if (scheduleCtrl.listSchedules[i]._id == scheduleCtrl.schedule._id) {
                                    scheduleCtrl.listSchedules[i] = resp.data;
                                    break;
                                }
                            }
                        }
                        scheduleCtrl.schedule = resp.data;
                        $scope.ScheduleForm.$setPristine();
                        toastr.success("Lưu trạng thái thành công.", "Thành công!");
                    } else {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    }
                })
                .catch(function(err) {
                    toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                });
        };

        scheduleCtrl.removeSchedule = function(scheduleId, index) {
            if (confirm("Bạn có chắc chắn muốn xóa?")) {
                ScheduleService.removeSchedule(scheduleId)
                    .then(function(resp) {
                        if (resp.status == 200 && resp.data) {
                            toastr.success("Xóa trạng thái thành công.", "Thành công!");
                            scheduleCtrl.listSchedules.splice(index, 1);
                            scheduleCtrl.resetSchedule();
                        } else {
                            toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                        }
                    })
                    .catch(function(err) {
                        toastr.error("Có lỗi xảy ra, thử lại sau.", "Lỗi!");
                    });
            }
        };

        scheduleCtrl.selectSchedule = function(schedule, index) {
            scheduleCtrl.selectScheduleIndex = index;
            scheduleCtrl.schedule = schedule;
            Common.scrollTo("#schedule-top", 'fast');
        };

        scheduleCtrl.resetSchedule = function() {
            scheduleCtrl.schedule = {};
        };

        scheduleCtrl.runSchedule = function(scheduleId, index) {
            if (confirm("Bạn có chắc chắn chạy lịch trình này?")) {
                index = index ? index : scheduleCtrl.selectScheduleIndex;
                ScheduleService.runSchedule(scheduleId)
                    .then(function(resp) {
                        if (resp.status == 200) {
                            scheduleCtrl.listSchedules[index] = resp.data.data;
                            scheduleCtrl.schedule = resp.data.data;
                            toastr.success(resp.data.msg, "Thành công!");
                        } else {
                            toastr.error("Có lỗi xảy ra, vui lòng thử lại sau.", "Lỗi!");
                        }
                    })
                    .catch(function(err) {
                        toastr.error(err.message, "Lỗi!");
                    });
            }
        };

        scheduleCtrl.stopSchedule = function(scheduleId, index) {
            if (confirm("Bạn có chắc chắn dừng lịch trình này?")) {
                index = index ? index : scheduleCtrl.selectScheduleIndex;
                ScheduleService.stopSchedule(scheduleId)
                    .then(function(resp) {
                        if (resp.status == 200) {
                            scheduleCtrl.listSchedules[index] = resp.data.data;
                            scheduleCtrl.schedule = resp.data.data;
                            toastr.success(resp.data.msg, "Thành công!");
                        } else {
                            toastr.error("Có lỗi xảy ra, vui lòng thử lại sau.", "Lỗi!");
                        }
                    })
                    .catch(function(err) {
                        toastr.error(err.message, "Lỗi!");
                    });
            }
        };
    }
})();