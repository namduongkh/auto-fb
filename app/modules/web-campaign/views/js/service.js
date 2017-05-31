(function() {
    'use strict';

    angular.module("Campaign")
        .service("CampaignService", CampaignService);

    function CampaignService($http) {
        return {
            getCampaigns: function() {
                return $http.get(apiPath + "/api/campaign/getCampaigns");
            },
            saveCampaign: function(data) {
                return $http.post(apiPath + "/api/campaign/saveCampaign", data);
            },
            removeCampaign: function(id) {
                return $http.post(apiPath + "/api/campaign/removeCampaign", { campaignId: id });
            },
            runCampaign: function(id) {
                return $http.post(apiPath + "/api/campaign/runCampaign", { campaignId: id });
            },
            stopCampaign: function(id) {
                return $http.post(apiPath + "/api/campaign/stopCampaign", { campaignId: id });
            },
        }
    }
})();