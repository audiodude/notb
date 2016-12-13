var gapi: any;

class AdminCtrl {
  isAdmin: boolean = false;
  idToken: string = '';
  items: Array<any> = [];

  constructor(private $location: ng.ILocationService,
              private VoteService: VoteService,
              private AdminService: AdminService) {
    this.AdminService.checkForAdmin().then((isAdmin: boolean) => {
      this.isAdmin = isAdmin;
    });
    this.VoteService.getItems().then((items: Array<Item>) => {
      this.items = items;
    });
  }
}

class AdminService {
  private authPromise: ng.IPromise<null>;

  constructor(private $http: ng.IHttpService,
              private $q: ng.IQService) {
    var deferred = $q.defer();
    gapi.load('auth2', () => {
      var auth2 = gapi.auth2.init({
        client_id: ('514994321753-haa5mtf623hrkaiqaunsg9vh7mmaqchb' + 
                    '.apps.googleusercontent.com'),
        fetch_basic_profile: false,
        scope: 'profile'
      });
      auth2.then(() => {
        window.console.log('immediate response:',
                           auth2.currentUser.get().getAuthResponse());
        deferred.resolve(true);
      });
    });
    this.authPromise = deferred.promise;
  }

  checkForAdmin() {
    return this.authPromise.then((authResponse: any) => {
      window.console.log(authResponse);
      return this.$http.post('/api/users/is_admin', {
        'idToken': authResponse.id_token
      })
    }).then((httpResp: any) => {
      return <boolean>httpResp.data.isAdmin;
    });
  }
}

angular.module('notb.admin', ['notb.vote'])
  .service('AdminService', AdminService)
  .controller('AdminCtrl', AdminCtrl);
