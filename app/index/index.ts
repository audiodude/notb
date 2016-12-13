var gapi: any;

class IndexCtrl {
  private INHIBIT_SIGNIN = false;
  constructor(private AdminService: AdminService,
              private IndexService: IndexService) {
    gapi.signin2.render('g-signin', {
      'scope': 'profile email',
      'width': 240,
      'height': 50,
      'onsuccess': (googleUser: any) => this.onSignIn(googleUser),
    });
  }

  onSignIn(googleUser: any) {
    if (this.INHIBIT_SIGNIN) {
      return;
    }
    this.IndexService.redirectUserByRole();
  }
}

class IndexService {
  constructor(private $location: ng.ILocationService,
              private AdminService: AdminService) { }

  redirectUserByRole() {
    this.AdminService.checkForAdmin().then((isAdmin: boolean) => {
      if (isAdmin) {
        this.$location.url('/admin');
      } else {
        this.$location.url('/vote');
      }
    });
  }
}

angular.module('notb.index', ['notb.admin'])
  .service('IndexService', IndexService)
  .controller('IndexCtrl', IndexCtrl);
