interface Item {
  name: string;
  id: string;
}

class VoteCtrl {
  private items: Array<Item>;
  selections: Array<string> = [];
  maxSelections = 5;
  
  constructor(private VoteService: VoteService) {
    this.VoteService.getItems().then((items: Array<Item>) => {
      this.items = items;
    });
  }

  isSelected(item: Item) {
    return this.selections.indexOf(item.id) != -1;
  }

  toggleSelection(item: Item) {
    var idx = this.selections.indexOf(item.id)
    if (idx == -1) {
      if (this.selections.length >= this.maxSelections) {
        return;
      }
      this.selections.push(item.id);
    } else {
      this.selections.splice(idx, 1);
    }
  }
}

class VoteService {
  constructor(private $http: ng.IHttpService) { }

  getItems() {
    return this.$http.get('/api/items').then((httpResp: any) => {
      return <Array<Item>>httpResp.data.items;
    });
  }
}

angular.module('notb.vote', [])
  .service('VoteService', VoteService)
  .controller('VoteCtrl', VoteCtrl);
