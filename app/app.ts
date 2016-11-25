angular.module('notb', ['ngMaterial', 'ngRoute', 'notb.index',
                        'notb.vote', 'notb.admin'])
  .config(function($routeProvider: ng.route.IRouteProvider,
                   $locationProvider: ng.ILocationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/', {
        templateUrl: 'app/index/index.html',
        controller: 'IndexCtrl',
        controllerAs: 'ctrl',
      })
      .when('/vote', {
        templateUrl: 'app/vote/vote.html',
        controller: 'VoteCtrl',
        controllerAs: 'ctrl',
      })
      .when('/admin', {
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl',
        controllerAs: 'ctrl',
      })      
      .otherwise({redirectTo: '/'});
  });

