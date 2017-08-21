'use strict';

// console.log("adminUrl", adminUrl);
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
    // Init module configuration options
    var applicationModuleName = 'mean';
    var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ui.router', 'ngSanitize',
        'ngMessages', 'ngFileUpload', 'ngCookies', 'LocalStorageModule', 'ui.tinymce'
    ];

    // Add a new vertical module
    var registerModule = function(moduleName, dependencies) {
        // Create angular module
        angular.module(moduleName, dependencies || []);

        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
    };

    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };
})();


//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
    function($locationProvider, $httpProvider) {
        //$locationProvider.html5Mode(true);
        $httpProvider.defaults.withCredentials = true;
        $locationProvider
            .html5Mode({
                enabled: window.enabledHtml5Mode,
                requireBase: false
            })
            .hashPrefix('!');
    }
]);

angular.module(ApplicationConfiguration.applicationModuleName).config(["localStorageServiceProvider", function(localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix(ApplicationConfiguration.applicationModuleName);
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
    //Fixing facebook bug with redirect
    //if (window.location.hash === '#_=_') window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';
ApplicationConfiguration.registerModule('core');
// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
        state('home', {
            url: '/',
            templateUrl: '/modules/admin-core/views/home.html'
        });
    }
]);
'use strict';
angular.module('core').factory('Authentication', ['$window', function($window) {
    var auth = {
        user: $window.user
    };

    return auth;
}]);

//Menu service used for managing  menus
angular.module('core').service('Menus', [

    function() {
        // Define a set of default roles
        this.defaultRoles = ['*'];

        // Define the menus object
        this.menus = {};

        // A private function for rendering decision 
        var shouldRender = function(user) {
            if (user) {
                if (!!~this.roles.indexOf('*')) {
                    return true;
                } else {
                    for (var userRoleIndex in user.roles) {
                        for (var roleIndex in this.roles) {
                            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                                return true;
                            }
                        }
                    }
                }
            } else {
                return this.isPublic;
            }

            return false;
        };

        // Validate menu existance
        this.validateMenuExistance = function(menuId) {
            if (menuId && menuId.length) {
                if (this.menus[menuId]) {
                    return true;
                } else {
                    throw new Error('Menu does not exists');
                }
            } else {
                throw new Error('MenuId was not provided');
            }

            return false;
        };

        // Get the menu object by menu id
        this.getMenu = function(menuId) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Return the menu object
            return this.menus[menuId];
        };

        // Add new menu object by menu id
        this.addMenu = function(menuId, isPublic, roles) {
            // Create the new menu
            this.menus[menuId] = {
                isPublic: isPublic || false,
                roles: roles || this.defaultRoles,
                items: [],
                shouldRender: shouldRender
            };

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeMenu = function(menuId) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Return the menu object
            delete this.menus[menuId];
        };

        // Add menu item object
        this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Push new menu item
            this.menus[menuId].items.push({
                title: menuItemTitle,
                link: menuItemURL,
                menuItemType: menuItemType || 'item',
                menuItemClass: menuItemType,
                uiRoute: menuItemUIRoute || ('/' + menuItemURL),
                isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
                roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
                position: position || 0,
                items: [],
                shouldRender: shouldRender
            });

            // Return the menu object
            return this.menus[menuId];
        };

        // Add submenu item object
        this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item
            for (var itemIndex in this.menus[menuId].items) {
                if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
                    // Push new submenu item
                    this.menus[menuId].items[itemIndex].items.push({
                        title: menuItemTitle,
                        link: menuItemURL,
                        uiRoute: menuItemUIRoute || ('/' + menuItemURL),
                        isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
                        roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
                        position: position || 0,
                        shouldRender: shouldRender
                    });
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeMenuItem = function(menuId, menuItemURL) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item to remove
            for (var itemIndex in this.menus[menuId].items) {
                if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
                    this.menus[menuId].items.splice(itemIndex, 1);
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeSubMenuItem = function(menuId, submenuItemURL) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item to remove
            for (var itemIndex in this.menus[menuId].items) {
                for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
                    if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
                        this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
                    }
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        //Adding the topbar menu
        this.addMenu('topbar');
    }
]);

angular.module('core').factory("Notice", ["$rootScope", function($rootScope) {
    var queue = [];
    var oldMessage = "";
    var currentMessage = "";

    $rootScope.$on("$stateChangeStart", function() {
        oldMessage = currentMessage;
        currentMessage = queue.shift() || "";
        // console.log(currentMessage);
    });

    $rootScope.$on("requireChange", function() {
        oldMessage = currentMessage;
        currentMessage = queue.shift() || "";
        // console.log(currentMessage);
    });

    $rootScope.$on("$stateChangeError", function() {
        queue.push(oldMessage);
        currentMessage = "";
    });

    return {
        setNotice: function(message, type, require) {
            var require = typeof require !== 'undefined' ? require : false;
            queue.push({
                type: type,
                message: message
            });
            if (require) {
                $rootScope.$broadcast('requireChange');
                // console.log('requireChange');
            }
            // console.log('Queue',queue);
        },
        getNotice: function() {
            return currentMessage;
        },
        requireChange: function() {
            $rootScope.$broadcast('requireChange');
        },
        SUCCESS: 'SUCCESS',
        ERROR: 'ERROR',
        INFO: 'INFO',
        clearNotice: function() {
            queue = [];
            currentMessage = "";
            $rootScope.$broadcast('CLEAR_NOTICE');
        }
    };
}]);
'use strict';

ApplicationConfiguration.registerModule('caches');
// Configuring the Articles module
angular.module('caches').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Cache', 'caches', 'dropdown', '/caches(/create)?');
        Menus.addSubMenuItem('topbar', 'caches', 'Danh sách', 'caches');
        // Menus.addSubMenuItem('topbar', 'caches', 'New cache', 'caches/create');
    }
]).config(['$stateProvider',
    function($stateProvider) {
        // caches state routing
        $stateProvider.
        state('listCaches', {
            url: '/caches',
            templateUrl: '/modules/admin-cache/views/list-caches.client.view.html'
        });
    }
]);
'use strict';

// Caches controller
angular.module('caches').controller('CachesController', ['$scope', '$window', '$stateParams', '$location', 'Option', 'Authentication', 'Caches', 'Notice', 'localStorageService', 'Upload',
    function($scope, $window, $stateParams, $location, Option, Authentication, Caches, Notice, localStorageService, Upload) {
        $scope.authentication = Authentication;
        $scope.filePath = '/files/cache/';
        $scope.webUrl = $window.settings.services.webUrl;
        if (!Authentication.user.name) {
            $location.path('signin');
        }
        $scope.types = Option.getTypes();
        $scope.statuses = Option.getStatus();
        $scope.gotoList = function() {
            $location.path('caches');
        }

        // Remove existing Category
        $scope.remove = function(cacheId) {
            if (confirm("Do you want to remove?")) {

                var cache = Caches.get({
                    cacheId: cacheId
                });

                cache.$remove({
                    cacheId: cacheId
                });

                for (var i in $scope.caches) {
                    if ($scope.caches[i]._id === cacheId) {
                        $scope.caches.splice(i, 1);
                    }
                }

                Notice.setNotice("Delete cache success!", 'SUCCESS');

                if ($stateParams.cacheId) {
                    $scope.gotoList();
                } else {
                    Notice.requireChange();
                }
            }
        };

        // Find existing Category
        $scope.findOne = function() {
            $scope.cache = Caches.get({
                cacheId: $stateParams.cacheId
            }, function(result) {
                if (result.image) {
                    $scope.review_file_name = $scope.webUrl + '/files/cache/' + result.image;
                }
            });
        };

        $scope.currentPage = 1;
        $scope.search = {};

        $scope.setPage = function(pageNo) {
            $scope.currentPage = pageNo;
        };

        $scope.pageChanged = function(page) {
            $scope.currentPage = page;
            getListData();
        };

        function getListData() {
            var options = {
                page: $scope.currentPage,
                keyword: $scope.search.keyword,
            };
            localStorageService.set('cache.filterData', {
                currentPage: $scope.currentPage,
                search: $scope.search
            });
            Caches.query(options, function(data) {
                console.log("Data", data);
                $scope.caches = data.items;
                $scope.totalItems = data.totalItems;
                $scope.itemsPerPage = data.itemsPerPage;
                $scope.numberVisiblePages = data.numberVisiblePages;
                $scope.totalPage = data.totalPage || 1;
            });
        }

        // Find a list of Posts
        $scope.find = function() {
            if (!$.isEmptyObject($location.search())) {
                var filterData = $location.search();
                $scope.currentPage = Number(filterData.currentPage) || 1;
                $scope.search.keyword = filterData.keyword;
            } else {
                var filterData = localStorageService.get('cache.filterData');
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

        $scope.removeAll = function() {
            if (confirm("Do you want to remove all?")) {
                Caches.removeAll(function(res) {
                    if (res.status) {
                        $scope.caches = [];
                        Notice.setNotice("Delete all cache success!", 'SUCCESS', true);
                    } else {
                        Notice.setNotice("Delete all cache error!", 'ERROR', true);
                    }
                });
            }
        };
    }
]);
'use strict';

//Caches service used to communicate Caches REST endpoints
angular.module('caches').factory('Caches', ['$resource',
    function($resource) {
        return $resource('cache/:cacheId', {
            cacheId: '@_id'
        }, {
            update: {
                method: 'PUT'
            },
            query: {
                isArray: false,
            },
            removeAll: {
                url: '/cache/removeAll',
                method: 'PUT'
            }
        });
    }
]);
'use strict';

ApplicationConfiguration.registerModule('auth');

angular.module('auth').config(['$stateProvider',
	function($stateProvider) {
	}
]); 
'use strict';

angular.module('auth').controller('AuthenticationController', ['$scope', '$http', '$location', '$window', 'Authentication', '$cookies',
    function($scope, $http, $location, $window, Authentication, $cookies) {
        $scope.authentication = Authentication;
        $scope.webUrl = $window.settings.services.webUrl;

        $scope.signin = function() {
            $scope.isSubmit = true;
            var data = $scope.credentials;
            data.scope = 'admin';
            $http.post($window.settings.services.apiUrl + '/api/user/login', data).then(function(response) {
                if (response.status == 200) {
                    response = response.data;
                    if (response.token) {
                        $window.location.href = '/';
                    }
                    $scope.error = response.message;
                }

            }).catch(function(response) {
                $scope.error = response.message;
            });
        };

        $scope.signout = function() {
            $http.get($window.settings.services.apiUrl + '/api/user/logout').then(function(response) {
                if (response.status == 200) {
                    response = response.data;
                    $scope.authentication.user = '';
                    $cookies.remove('token');
                    $window.location.href = '/';
                }
            }).catch(function(response) {
                $scope.error = response.message;
            });
        };
    }
]);
'use strict';

angular.module('auth').factory('Authentication', ['$window', function($window) {
	var auth = {
		user: $window.user
	};
	return auth;
}]);

angular.module('core').directive('ckEditor', [function () {
	return {
		require: '?ngModel',
		restrict: 'AEC',
		link: function (scope, elm, attr, model) {
			var isReady = false;
			var data = [];
			var ck = CKEDITOR.replace(elm[0]);

			function setData() {
				if (!data.length) { return; }

				var d = data.splice(0, 1);
				ck.setData(d[0] || '<span></span>', function () {
					setData();
					isReady = true;
				});
			}

			ck.on('instanceReady', function (e) {
				if (model) { setData(); }
			});

			elm.bind('$destroy', function () {
				ck.destroy(false);
			});

			if (model) {
				ck.on('change', function () {
					scope.$apply(function () {
						var data = ck.getData();
						if (data == '<span></span>') {
							data = null;
						}
						model.$setViewValue(data);
					});
				});

				model.$render = function (value) {
					if (model.$viewValue === undefined) {
						model.$setViewValue("");
						model.$viewValue = "";
					}

					data.push(model.$viewValue);

					if (isReady) {
						isReady = false;
						setData();
					}
				};
			}

		}
	};
}]);

'use strict'

angular.module('core').directive('noticeDir', ['Notice', '$rootScope', function(Notice, $rootScope) {
    var renderNotice = function(message, type) {
        if (type == Notice.ERROR) {
            return '<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button><h4><i class="icon fa fa-exclamation-triangle"></i> Error!</h4><div>' + message + '</div></div>';
        } else if (type == Notice.INFO) {
            return '<div class="alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button><h4><i class="icon fa fa-info"></i> Infomation!</h4><div>' + message + '</div></div>';
        }
        return '<div class="alert alert-success alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button><h4><i class="icon fa fa-check"></i> Success!</h4><div>' + message + '</div></div>'
    };

    return {
        restrict: "E",
        template: function(elem, attr) {
            var notice = Notice.getNotice();
            // $("html body").click(function() {
            //     elem.empty();
            // });

            $rootScope.$on("CLEAR_NOTICE", function() {
                elem.empty();
            });

            $rootScope.$on("requireChange", function() {
                notice = Notice.getNotice();
                // console.log('directive', notice);
                if (notice.type == Notice.ERROR) {
                    elem.html(renderNotice(notice.message, Notice.ERROR));
                } else if (notice.type == Notice.INFO) {
                    elem.html(renderNotice(notice.message, Notice.INFO));
                } else {
                    elem.html(renderNotice(notice.message, Notice.SUCCESS));
                }
            });

            if (notice == "") return;
            // console.log("Notice:", notice);
            if (notice.type == Notice.ERROR) {
                return renderNotice(notice.message, Notice.ERROR);
            } else if (notice.type == Notice.INFO) {
                return renderNotice(notice.message, Notice.INFO);
            }
            return renderNotice(notice.message, Notice.SUCCESS);
        }
    };

}]);

angular.module('core').directive('errorMessage', function() {
    return {
        restrict: 'E',
        template: function(elem, attr) {
            var requireMsg = attr.requireMsg || "You did not enter a field";
            var minlengthMsg = attr.minlength ? `You should enter longer than ${attr.minlength - 1} characters` : "You should enter longer in this field";
            var maxlengthMsg = attr.maxlength ? `You should enter shorter than ${attr.maxlength + 1} characters` : "You should enter shorter in this field";
            return '<div ng-message="required">' + requireMsg + '</div>' +
                '<div ng-message="email">You did not enter a email format</div>' +
                '<div ng-message="pattern">You did not enter a right pattern</div>' +
                '<div ng-message="number">You did not enter a number</div>' +
                '<div ng-message="min">You should enter bigger value</div>' +
                '<div ng-message="max">You should enter smaller value</div>' +
                '<div ng-message="minlength">' + minlengthMsg + '</div>' +
                '<div ng-message="maxlength">' + maxlengthMsg + '</div>';
        }
    };
});


angular.module('core')
    .directive('ngLoading', function() {

        var loadingSpinner = '<div id="preview-area">' +
            '<div class="spinner">' +
            '<div class="double-bounce1"></div>' +
            '<div class="double-bounce2"></div>' +
            '</div>' +
            '</div>' +
            '<div class="mfp-bg bzFromTop mfp-ready"></div>';

        return {
            restrict: 'AE',
            link: function(scope, element, attrs) {
                scope.$watch(attrs.loadingDone, function(val) {
                    if (val) {
                        element.html(loadingSpinner);
                    } else {
                        element.html('');
                    }
                });
            }
        };
    });
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
    function($scope, Authentication, Menus) {
        $scope.authentication = Authentication;
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');


    }
]);

'use strict';


angular.module('core').controller('HomeController', ['$scope', '$location', 'Authentication',
    function($scope, $location, Authentication) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        $scope.checkAuth = function() {
            if (!Authentication.user.name) {
                $location.path('signin');
            }
        }
    }
]);

'use strict';
/**
 * Created by chung on 7/23/15.
 */
angular.module('core').factory("Option", ["$rootScope", function ($rootScope) {

    var statuses = [{name: "Publish", value: 1}, {'name': "Unpublish", value: 0}];

    var features = [{name: "Yes", value: 1}, {'name': "No", value: 0}];

    var yesno = [{name: "Yes", value: 1}, {'name': "No", value: 0}];

    var roles = [{name: 'Admin', value: 'admin'}, {name: 'User', value: 'user'}];

    var genders = [{name: 'male', value: 'male'}, {name: 'female', value: 'female'}];

    var types = [{name: 'Product', value: 'product'}, {name: 'Post', value: 'post'}, {name: 'Banner', value: 'banner'}];

    var bannerPositions = [{name: 'home', value: 'home'}, {name: 'right', value: 'right'}];

    var adsPositions = [{name: 'top', value: 'top'}, {name: 'right', value: 'right'}, {name: 'home', value: 'home'}];

    return {
        getStatus: function () {
            return statuses;
        },

        getRoles: function () {
            return roles;
        },
        getGenders: function () {
            return genders;
        },
        getFeatures: function () {
            return features;
        },
        getTypes: function () {
            return types;
        },
        getYesNo: function () {
            return yesno;
        },
        getPositions: function () {
            return bannerPositions;
        },
        getAdsPositions: function () {
            return adsPositions;
        },


    };
}]);

angular.module('core')
	.directive('status', function () {
		return {
			restrict: 'EA', //E = element, A = attribute, C = class, M = comment
			link: function ($scope, element, attrs) {
				var tag =  '<span class="label label-warning">unpublish</span>';
				
				if(attrs.status==1){
					tag =  '<span class="label label-success">publish</span>';
				}
				element.append(tag);
			}
		}
	});
'use strict';

ApplicationConfiguration.registerModule('pages');
// Configuring the Articles module
angular.module('pages').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Trang', 'pages', 'dropdown', '/pages(/create)?');
        Menus.addSubMenuItem('topbar', 'pages', 'Danh sách', 'pages');
        Menus.addSubMenuItem('topbar', 'pages', 'Tạo mới', 'pages/create');
    }
]).config(['$stateProvider',
    function($stateProvider) {

        // Pages state routing
        $stateProvider.
        state('listPages', {
            url: '/pages',
            templateUrl: '/modules/admin-page/views/list-pages.client.view.html'
        }).
        state('createPage', {
            url: '/pages/create',
            templateUrl: '/modules/admin-page/views/create-page.client.view.html'
        }).
        state('viewPage', {
            url: '/pages/:pageId',
            templateUrl: '/modules/admin-page/views/view-page.client.view.html'
        }).
        state('editPage', {
            url: '/pages/:pageId/edit',
            templateUrl: '/modules/admin-page/views/edit-page.client.view.html'
        });
    }
]);
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
                Notice.setNotice("Please check your fields and try again!", 'ERROR', true);
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
                    Notice.setNotice(response.message, 'ERROR', true);
                } else {
                    Notice.setNotice("Save page success!", 'SUCCESS');
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
                Notice.setNotice(errorResponse.data.message, 'ERROR', true);
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

                Notice.setNotice("Delete page success!", 'SUCCESS');

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
                Notice.setNotice("Please check your fields and try again!", 'ERROR', true);
                return;
            }
            var page = $scope.page;
            delete page.__v;
            delete page.created;
            page.$update(function(resp) {
                if (resp.error) {
                    Notice.setNotice(resp.message, 'ERROR', true);
                } else {
                    Notice.setNotice("Update page success!", 'SUCCESS');
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
                Notice.setNotice(errorResponse.data.message, 'ERROR', true);
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
'use strict';

//Pages service used to communicate Pages REST endpoints
angular.module('pages').factory('Pages', ['$resource',
    function($resource) {
        return $resource('page/:pageId', {
            pageId: '@_id'
        }, {
            update: {
                method: 'PUT'
            },
            query: {
                isArray: false,
            }
        });
    }
]);