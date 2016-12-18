angular.module('notb', ['ngMaterial', 'ngRoute', 'notb.index',
                        'notb.vote', 'notb.admin', 'notb.results'])
  .config(function($routeProvider: ng.route.IRouteProvider,
                   $locationProvider: ng.ILocationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/', {
        // The templates directory is under public.
        templateUrl: 'templates/index.html',
        controller: 'IndexCtrl',
        controllerAs: 'ctrl',
      })
      .when('/vote', {
        templateUrl: 'templates/vote.html',
        controller: 'VoteCtrl',
        controllerAs: 'ctrl',
      })
      .when('/results', {
        templateUrl: 'templates/results.html',
        controller: 'ResultsCtrl',
        controllerAs: 'ctrl',
      })
      .when('/admin', {
        templateUrl: 'templates/admin.html',
        controller: 'AdminCtrl',
        controllerAs: 'ctrl',
      })      
      .otherwise({redirectTo: '/'});
  });

