var gapi: any;

class IndexCtrl {
  private INHIBIT_SIGNIN = false;
  constructor(private $location: ng.ILocationService,
              private AdminService: any) {
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
    var idToken = googleUser.getAuthResponse().id_token
    this.AdminService.checkForAdmin(idToken).then((isAdmin: boolean) => {
      if (isAdmin) {
        this.$location.url('/admin');
      } else {
        this.$location.url('/vote');
      }
    });
  }
}

class IndexService {

}

angular.module('notb.index', ['notb.admin'])
  .service('IndexService', IndexService)
  .controller('IndexCtrl', IndexCtrl);
