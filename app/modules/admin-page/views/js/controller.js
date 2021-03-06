'use strict';

// Pages controller
angular.module('pages').controller('PagesController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Pages', 'Notice', 'localStorageService',
    function($scope, $rootScope, $stateParams, $location, Authentication, Pages, Notice, localStorageService) {

        $scope.authentication = Authentication;

        if (!Authentication.user.name) {
            $location.path('signin');
        }
        $scope.gotoList = function() {
            $location.path('pages');
        }

        $scope.tinyMceOptions = {
            // menubar: false,
            plugins: "advlist code",
            // toolbar: 'formatselect | fontselect | fontsizeselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | code',
            // font_formats: 'Arial=arial,helvetica,sans-serif;Courier New=courier new,courier,monospace;AkrutiKndPadmini=Akpdmi-n',
            // fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
            // block_formats: 'Paragraph=p;Header 1=h1;Header 2=h2;Header 3=h3',
        };

        // Create new Page
        $scope.create = function(isValid, gotoList) {
            var gotoList = typeof gotoList !== 'undefined' ? gotoList : null;
            $scope.submitted = true;
            if (!isValid) {
                Notice.error("Please check your fields and try again!", true);
                return;
            }
            // Create new Page object
            var page = new Pages({
                title: this.title,
                //slug: this.slug,
                intro: this.intro,
                content: this.content,
                identity: this.identity
            });
            // Redirect after save
            page.$save(function(response) {
                if (response.error) {
                    Notice.error(response.message, true);
                } else {
                    Notice.success("Save page success!");
                    if (gotoList) {
                        $scope.gotoList();
                    } else {
                        $location.path('pages/' + response._id + '/edit');
                        $scope.submitted = false;
                        $scope.title = '';
                    }
                    // ActionLogs.create({
                    //     type: 'create',
                    //     model: 'page',
                    //     target: {
                    //         target_id: response._id
                    //     }
                    // });
                }
            }, function(errorResponse) {
                Notice.error(errorResponse.data.message, true);
            });
        };

        // Remove existing Page
        $scope.remove = function(pageId) {
            if (confirm("Do you want to remove?")) {

                var page = Pages.get({
                    pageId: pageId
                });

                page.$remove({
                    pageId: pageId
                }, function() {
                    // ActionLogs.create({
                    //     type: 'delete',
                    //     model: 'page',
                    //     target: {
                    //         target_id: pageId,
                    //         target_title: page.title || page._id
                    //     }
                    // });
                });

                for (var i in $scope.pages) {
                    if ($scope.pages[i]._id === pageId) {
                        $scope.pages.splice(i, 1);
                    }
                }

                Notice.success("Delete page success!");

                if ($stateParams.pageId) {
                    $scope.gotoList();
                } else {
                    Notice.requireChange();
                }
            }
        };

        // Update existing Page
        $scope.update = function(isValid, gotoList) {
            $scope.submitted = true;
            if (!isValid) {
                Notice.error("Please check your fields and try again!", true);
                return;
            }
            var page = $scope.page;
            delete page.__v;
            delete page.created;
            page.$update(function(resp) {
                if (resp.error) {
                    Notice.error(resp.message, true);
                } else {
                    Notice.success("Update page success!");
                    if (gotoList) {
                        $scope.gotoList();
                    } else {
                        // $location.path('transactions/' + transaction._id);
                        // $scope.success = "Update page success!";
                        $scope.submitted = false;
                        Notice.requireChange();
                    }
                    // ActionLogs.create({
                    //     type: 'update',
                    //     model: 'page',
                    //     target: {
                    //         target_id: resp._id
                    //     }
                    // });
                }

            }, function(errorResponse) {
                Notice.error(errorResponse.data.message, true);
            });
        };

        // Find existing Page
        $scope.findOne = function() {
            $scope.page = Pages.get({
                pageId: $stateParams.pageId
            }, function() {
                // ActionLogs.create({
                //     type: 'view',
                //     model: 'page',
                //     target: {
                //         target_id: $stateParams.pageId
                //     }
                // });
            });
        };

        $scope.currentPage = 1;
        $scope.search = {};

        $scope.setPage = function(pageNo) {
            $scope.currentPage = pageNo;
        };

        $scope.pageChanged = function(page) {
            $scope.currentPage = page;
            // ActionLogs.create({
            //     type: 'list',
            //     model: 'page',
            // });
            getListData();
        };

        function getListData() {
            var options = {
                target_id: $scope.currentPage,
                keyword: $scope.search.keyword,
            };
            localStorageService.set('page.filterData', {
                currenttarget_id: $scope.currentPage,
                search: $scope.search
            });
            Pages.query(options, function(data) {
                $scope.pages = data.items;
                $scope.totalItems = data.totalItems;
                $scope.itemsPerPage = data.itemsPerPage;
                $scope.numberVisiblePages = data.numberVisiblePages;
                $scope.totalPage = data.totalPage || 1;
            });

        }

        // Find a list of Posts
        $scope.find = function() {
            // console.log(myListener);
            if (!$.isEmptyObject($location.search())) {
                var filterData = $location.search();
                $scope.currentPage = Number(filterData.currentPage) || 1;
                $scope.search.keyword = filterData.keyword;
            } else {
                var filterData = localStorageService.get('page.filterData');
                if (filterData) {
                    // console.log("filter by local store", filterData);
                    $scope.currentPage = filterData.currentPage;
                    $scope.search = filterData.search;
                }
            }
            getListData();
        };
        //search
        $scope.filter = function() {
            $scope.currentPage = 1;
            getListData();
        };
        //reset
        $scope.reset = function() {
            $scope.search.keyword = "";
            $scope.currentPage = 1;
            getListData();
        };
    }
]);