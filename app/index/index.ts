var gapi: any;

class IndexCtrl {
  constructor(private $location: ng.ILocationService,
              private $rootScope: ng.IRootScopeService,
              private AdminService: AdminService,
              private IndexService: IndexService) {
    gapi.signin2.render('g-signin', {
      'scope': 'profile email',
      'width': 240,
      'height': 50,
      'onsuccess': (googleUser: any) => this.onSignIn(googleUser),
    });
  }

  onSignIn(googleUser: any) {
    this.$rootScope.$apply(() => {
      this.$location.path('/vote');
    })
  }
}

class IndexService {

}

angular.module('notb.index', ['notb.admin'])
  .service('IndexService', IndexService)
  .controller('IndexCtrl', IndexCtrl);
