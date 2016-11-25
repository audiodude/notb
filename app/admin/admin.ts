var gapi: any;

class AdminCtrl {
  isAdmin: boolean = false;
  idToken: string = '';
  items: Array<any> = [];

  constructor(private $location: ng.ILocationService,
              private VoteService: VoteService,
              private AdminService: AdminService) {
    gapi.load('auth2', () => {
      var auth2 = gapi.auth2.init({
        client_id: ('514994321753-haa5mtf623hrkaiqaunsg9vh7mmaqchb' + 
                    '.apps.googleusercontent.com'),
        fetch_basic_profile: false,
        scope: 'profile'
      });
      this.idToken = auth2.currentUser.get().getAuthResponse().id_token;
      this.AdminService.checkForAdmin(this.idToken).then((isAdmin: boolean) => {
        if (!isAdmin) {
          this.$location.url('/');
        } else {
          this.isAdmin = true;
        }
      });
    });

    this.VoteService.getItems().then((items: Array<Item>) => {
      this.items = items;
    });
  }
}

class AdminService {

  constructor(private $http: ng.IHttpService) { }

  checkForAdmin(idToken: string) {
    return this.$http.post('/api/users/is_admin', {
      'idToken': idToken
    }).then((httpResp: any) => {
      return <boolean>httpResp.data.isAdmin;
    });
  }
}

angular.module('notb.admin', ['notb.vote'])
  .service('AdminService', AdminService)
  .controller('AdminCtrl', AdminCtrl);
