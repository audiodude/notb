var gapi;
var AdminCtrl = (function () {
    function AdminCtrl($location, VoteService, AdminService) {
        var _this = this;
        this.$location = $location;
        this.VoteService = VoteService;
        this.AdminService = AdminService;
        this.isAdmin = false;
        this.idToken = '';
        this.items = [];
        gapi.load('auth2', function () {
            var auth2 = gapi.auth2.init({
                client_id: ('514994321753-haa5mtf623hrkaiqaunsg9vh7mmaqchb' +
                    '.apps.googleusercontent.com'),
                fetch_basic_profile: false,
                scope: 'profile'
            });
            _this.idToken = auth2.currentUser.get().getAuthResponse().id_token;
            _this.AdminService.checkForAdmin(_this.idToken).then(function (isAdmin) {
                if (!isAdmin) {
                    _this.$location.url('/');
                }
                else {
                    _this.isAdmin = true;
                }
            });
        });
        this.VoteService.getItems().then(function (items) {
            _this.items = items;
        });
    }
    return AdminCtrl;
}());
var AdminService = (function () {
    function AdminService($http) {
        this.$http = $http;
    }
    AdminService.prototype.checkForAdmin = function (idToken) {
        return this.$http.post('/api/users/is_admin', {
            'idToken': idToken
        }).then(function (httpResp) {
            return httpResp.data.isAdmin;
        });
    };
    return AdminService;
}());
angular.module('notb.admin', ['notb.vote'])
    .service('AdminService', AdminService)
    .controller('AdminCtrl', AdminCtrl);
angular.module('notb', ['ngMaterial', 'ngRoute', 'notb.index',
    'notb.vote', 'notb.admin'])
    .config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', {
        templateUrl: 'app/index/index.html',
        controller: 'IndexCtrl',
        controllerAs: 'ctrl'
    })
        .when('/vote', {
        templateUrl: 'app/vote/vote.html',
        controller: 'VoteCtrl',
        controllerAs: 'ctrl'
    })
        .when('/admin', {
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl',
        controllerAs: 'ctrl'
    })
        .otherwise({ redirectTo: '/' });
});
var gapi;
var IndexCtrl = (function () {
    function IndexCtrl($location, AdminService) {
        var _this = this;
        this.$location = $location;
        this.AdminService = AdminService;
        this.INHIBIT_SIGNIN = false;
        gapi.signin2.render('g-signin', {
            'scope': 'profile email',
            'width': 240,
            'height': 50,
            'onsuccess': function (googleUser) { return _this.onSignIn(googleUser); }
        });
    }
    IndexCtrl.prototype.onSignIn = function (googleUser) {
        var _this = this;
        if (this.INHIBIT_SIGNIN) {
            return;
        }
        var idToken = googleUser.getAuthResponse().id_token;
        this.AdminService.checkForAdmin(idToken).then(function (isAdmin) {
            if (isAdmin) {
                _this.$location.url('/admin');
            }
            else {
                _this.$location.url('/vote');
            }
        });
    };
    return IndexCtrl;
}());
var IndexService = (function () {
    function IndexService() {
    }
    return IndexService;
}());
angular.module('notb.index', ['notb.admin'])
    .service('IndexService', IndexService)
    .controller('IndexCtrl', IndexCtrl);
var VoteCtrl = (function () {
    function VoteCtrl(VoteService) {
        var _this = this;
        this.VoteService = VoteService;
        this.selections = [];
        this.maxSelections = 5;
        this.VoteService.getItems().then(function (items) {
            _this.items = items;
        });
    }
    VoteCtrl.prototype.isSelected = function (item) {
        return this.selections.indexOf(item.id) != -1;
    };
    VoteCtrl.prototype.toggleSelection = function (item) {
        var idx = this.selections.indexOf(item.id);
        if (idx == -1) {
            if (this.selections.length >= this.maxSelections) {
                return;
            }
            this.selections.push(item.id);
        }
        else {
            this.selections.splice(idx, 1);
        }
    };
    return VoteCtrl;
}());
var VoteService = (function () {
    function VoteService($http) {
        this.$http = $http;
    }
    VoteService.prototype.getItems = function () {
        return this.$http.get('/api/items').then(function (httpResp) {
            return httpResp.data.items;
        });
    };
    return VoteService;
}());
angular.module('notb.vote', [])
    .service('VoteService', VoteService)
    .controller('VoteCtrl', VoteCtrl);
//# sourceMappingURL=compiled.js.map