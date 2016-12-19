var twttr: any;

type IRow = [string, number];

class ResultsCtrl {
  results: Array<any>;
  oneVotes: Array<string> = [];
  zeroVotes: Array<string> = [];
  multiVotes: Array<IRow> = [];
  selections: Array<string> = [];
  twitterPromise: ng.IPromise<null>;
  twitterLoaded: boolean = false;

  constructor (private $q: ng.IQService,
               private $rootScope: ng.IRootScopeService,
               private VoteService: VoteService,
               private ResultsService: ResultsService) {
    this.VoteService.getUserSelections().then((selections) => {
      this.selections = selections;
      this.ResultsService.getResults().then((results) => {
        this.results = results;
        this.processResults();
      });
    });

    var deferred = this.$q.defer();
    twttr.ready(function() {
      deferred.resolve();
    });
    this.twitterPromise = deferred.promise;
  }

  medianVotes() {
    // Not currently used.
    var votes: Array<number> = []
    angular.forEach(this.results, function(v) {
      votes.push(v);
    });
    votes.sort(function(a, b) {
      return a - b;
    });
    if (votes.length % 2 == 0) {
      return votes[votes.length / 2] + votes[votes.length / 2 - 1] / 2;
    } else {
      return votes[Math.floor(votes.length / 2)];
    }
  }

  processResults() {
    var rows: Array<IRow> = [];
    angular.forEach(this.results, function(votes: number, name: string) {
      rows.push([name, votes]);
    });
    rows.sort(function(a: IRow, b: IRow) {
      return b[1] - a[1];
    });
    angular.forEach(rows, (row) => {
      if (row[1] == 0) {
        this.zeroVotes.push(row[0]);
      } else if (row[1] == 1) {
        this.oneVotes.push(row[0]);
      } else {
        this.multiVotes.push(row);
      }
    });
  }

  loadTwitter() {
    if (this.twitterLoaded) {
      return;
    }
    this.twitterPromise.then(() => {
      twttr.widgets.load();
      this.twitterLoaded = true;
    })
  }
}

class ResultsService {
  constructor(private $http: ng.IHttpService) { }

  getResults() {
    return this.$http.get('/api/results').then(function(httpResp: any) {
      return httpResp.data;
    });
  }
}

angular.module('notb.results', ['notb.vote'])
  .service('ResultsService', ResultsService)
  .controller('ResultsCtrl', ResultsCtrl);
