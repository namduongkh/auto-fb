var tips = {
    timeline: "Đây là danh sách các dòng thời gian bạn có quyền đăng bài viết trên tường. <br> Nhập tên của dòng thời gian (nhóm, trang) để tìm kiếm và thêm vào danh sách của bạn.",
    feed: "Dòng trạng thái là một bài viết có thể đăng lên tường dưới dạng một đoạn văn bản đơn thuần. <br> Bạn có thể chia sẻ một đường dẫn liên kết đến website khác kèm theo một dòng trạng thái.",
    album: "Album ảnh là một bài viết có thể đăng lên tường dưới dạng một đoạn văn bản đơn thuần kèm theo một hoặc nhiều hình ảnh.",
};

var placeholders = {
    timeline: {
        keyword: "VD: Mua bán, Shop online..."
    },
    feed: {
        id: "Tự động sinh",
        title: "VD: Cần tuyển dụng, Tìm việc làm...",
        message: "Viết gì đó...",
        url: "VD: http://www.yourshop.com/abc..."
    },
    campaign: {
        id: "Tự động sinh",
        title: "VD: Xuất bản trạng thái ABC...",
        timelineId: "Chọn dòng thời gian"
    },
    album: {
        id: "Tự động sinh",
        name: "VD: Hình sản phẩm, hình hàng hóa...",
        message: "Viết gì đó...",
    },
    schedule: {
        id: "Tự động sinh",
        name: "VD: Lịch chạy chiến dịch ABC...",
    },
};

(function() {
    'use strict';

    angular.module('Core')
        .factory('PreResponse', PreResponse)
        .config(['$httpProvider', function($httpProvider) {
            $httpProvider.interceptors.push('PreResponse');
        }]);

    function PreResponse($rootScope, $timeout, $q, $sce) {
        $rootScope.placeholders = placeholders;
        $rootScope.tips = {};
        for (var i in tips) {
            $rootScope.tips[i] = $sce.trustAsHtml(tips[i]);
        }
        return {
            response: function(response) {
                // console.log("Chạy vào đây");
                if (response.status == 200) {
                    if (response.data.noAccessToken) {
                        $rootScope.$broadcast("NO_ACCESS_TOKEN_ERROR");
                    }
                    if (response.data.tokenHasExpired) {
                        $rootScope.$broadcast("TOKEN_HAS_EXPIRED_ERROR");
                    }
                    if (response.data.rejectApi) {
                        return $q.reject({
                            status: false,
                            data: {
                                message: 'You have access token!'
                            },
                            handle: 'PreResponse'
                        });
                    }
                }
                return response;
            },
        }
    };
})();