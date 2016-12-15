var gapi: any;

class AdminCtrl {
  isAdmin: boolean = false;
  idToken: string = '';
  editItems: string = '';
  saveSuccess: boolean = null;

  constructor(private $location: ng.ILocationService,
              private VoteService: VoteService,
              private IndexService: IndexService,
              private AdminService: AdminService) {
    this.AdminService.checkForAdmin().then((isAdmin: boolean) => {
      this.isAdmin = isAdmin;
      if (!this.isAdmin) {
        this.AdminService.redirectUserByRole();
      }
    });
    this.VoteService.getItems().then((items: Array<string>) => {
      this.editItems = items.join('\n');
    });
  }

  submitItems() {
    this.AdminService.updateItems(this.editItems).then((result: boolean) => {
      this.saveSuccess = result;
    })
  }
}

class AdminService {
  private authPromise: ng.IPromise<null>;

  constructor(private $http: ng.IHttpService,
              private $location: ng.ILocationService,
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
        deferred.resolve(auth2.currentUser.get().getAuthResponse());
      });
    });
    this.authPromise = deferred.promise;
  }

  checkForAdmin() {
    return this.authPromise.then((authResponse: any) => {
      return this.$http.post('/api/users/is_admin', {
        'idToken': authResponse.id_token
      })
    }).then((httpResp: any) => {
      return <boolean>httpResp.data.isAdmin;
    });
  }

  redirectUserByRole() {
    this.checkForAdmin().then((isAdmin: boolean) => {
      if (isAdmin) {
        this.$location.path('/admin');
      } else {
        this.$location.path('/vote');
      }
    });
  }

  updateItems(items: string) {
    return this.$http.post('/api/items/all', {
      'items': items
    }).then(() => {
      return true;
    }, () => {
      return false;
    });
  }
}

angular.module('notb.admin', ['notb.vote'])
  .service('AdminService', AdminService)
  .controller('AdminCtrl', AdminCtrl);
