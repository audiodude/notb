class VoteCtrl {
  private items: Array<string>;
  selections: Array<string> = [];
  maxSelections = 5;
  
  constructor(private VoteService: VoteService) {
    this.VoteService.getShuffledItems().then((items: Array<string>) => {
      this.items = items;
    });
  }

  isSelected(item: string) {
    return this.selections.indexOf(item) != -1;
  }

  toggleSelection(item: string) {
    var idx = this.selections.indexOf(item)
    if (idx == -1) {
      if (this.selections.length >= this.maxSelections) {
        return;
      }
      this.selections.push(item);
    } else {
      this.selections.splice(idx, 1);
    }
  }
}

class VoteService {
  constructor(private $http: ng.IHttpService) { }

  getItems() {
    return this.$http.get('/api/items').then((httpResp: any) => {
      return <Array<string>>httpResp.data.items;
    });
  }

  private shuffle(array: Array<any>) {
    var currentIndex = array.length;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      var randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      var temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  getShuffledItems() {
    return this.getItems().then((items: Array<string>) => {
      return this.shuffle(items);
    })
  }
}

angular.module('notb.vote', [])
  .service('VoteService', VoteService)
  .controller('VoteCtrl', VoteCtrl);
