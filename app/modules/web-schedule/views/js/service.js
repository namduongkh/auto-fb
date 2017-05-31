(function() {
    'use strict';

    angular.module("Schedule")
        .service("ScheduleService", ScheduleService);

    function ScheduleService($http) {
        return {
            getSchedules: function() {
                return $http.get(apiPath + "/api/schedule/getSchedules");
            },
            saveSchedule: function(data) {
                return $http.post(apiPath + "/api/schedule/saveSchedule", data);
            },
            removeSchedule: function(id) {
                return $http.post(apiPath + "/api/schedule/removeSchedule", { scheduleId: id });
            },
            runSchedule: function(id) {
                return $http.post(apiPath + "/api/schedule/runSchedule", { scheduleId: id });
            },
            stopSchedule: function(id) {
                return $http.post(apiPath + "/api/schedule/stopSchedule", { scheduleId: id });
            }
        }
    }
})();