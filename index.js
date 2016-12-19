var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    request = require('request'),
    assert = require('assert'),
    MongoClient = require('mongodb').MongoClient,
    async = require('async'),
    Q = require('q');

var PORT = process.env.PORT || 3000;

var mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/notb_dev'
var db = null;
MongoClient.connect(mongoUrl, function(err, _db) {
  assert.equal(null, err);
  db = _db;
  console.log("Connected successfully to MongoDB server");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static('public'))

if (process.env.NODE_ENV != 'production') {
  // Serve original ts files in non-production.
  app.use(express.static('.'));
}

app.post('/api/users/is_admin', function(req, res) {
  var url = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + 
      req.body.idToken;
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);
      var ans = {'isAdmin': data['sub'] + '' == process.env.ADMIN_GOOGLE_ID}
      res.json(ans);
      return;
    }
    res.json({'isAdmin': false});
  });
});

app.get('/api/items', function(req, res) {
  var itemsCollection = db.collection('items');
  itemsCollection.find({}).toArray(function(err, docs) {
    if (err != null) {
      res.status(500).json({error: err});
    } else {
      res.json({items: docs.length ? docs[0].items : []})
    }
  });
});

app.post('/api/items/all', function(req, res) {
  var items = req.body.items.split('\n');

  var itemsCollection = db.collection('items');
  itemsCollection.update({}, {
    items: items
  }, {
    upsert: true
  }, function(err, result) {
    if (err != null) {
      res.status(500).json({error: err});
    }
  })

  var initVotes = function(item, callback) {
    var q = {};
    q[item] = {$exists: false};
    var update = {}
    update[item] = 0;
    votesCollection.update(q, {$set: update}, function(err, result) {
      callback(err);
    });
  }
  var sendResult = function(err) {
    if (err != null) {
      res.status(500).json({error: err});
    } else {
      res.json({result: 'Inserted ' + items.length + ' items'});
    }
  }

  var votesCollection = db.collection('votes');
  votesCollection.find({}).toArray(function(err, docs) {
    if (err != null) {
      res.status(500).json({error: err});
    } else {
      if (docs.length == 0) {
        votesCollection.insert({}, function(err, result) {
          if (err != null) {
            res.status(500).json({error: err});
          } else {
            async.each(items, initVotes, sendResult);
          }
        });
      } else {
        async.each(items, initVotes, sendResult);
      }
    }
  });
});

app.post('/api/vote', function(req, res) {
  var votes = req.body.votes;
  var url = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + 
      req.body.idToken;

  var errorFn = function(err) {
    console.log(err);
    res.status(500).json({error: err});
  };

  Q.nfcall(request, url).then(function(response) {
    response = response[0];
    if (response.statusCode != 200) {
      throw new Error('Status code was ' + response.statusCode);
    }
    return JSON.parse(response.body);
  }, errorFn).then(function(user) {
    var votesCollection = db.collection('votes');

    var updateObj = {}
    votes.forEach(function(vote) {
      updateObj[vote] = 1;
    });

    return Q.ninvoke(votesCollection, 'update', {}, {
      $inc: updateObj
    }).then(function() {
      return user;
    }, errorFn);
  }, errorFn).then(function(user) {
    var usersCollection = db.collection('users');
    return Q.ninvoke(usersCollection, 'update', {id: user['sub']}, {
      $set: {
        id: user['sub'],
        email: user['email'],
        votes: votes
      }
    }, {upsert: true});
  }, errorFn).then(function() {
    res.json({result: 'Updated ' + votes.length + ' items'});
  }, errorFn);

});

app.get('/api/results', function(req, res) {
  var votesCollection = db.collection('votes');
  votesCollection.find({}).toArray(function(err, docs) {
    if (err != null) {
      res.status(500).json({error: err});
    } else {
      var results = docs.length ? docs[0] : {};
      delete results['_id'];
      res.json(results);
    }
  });
});

app.get('/api/user/votes', function(req, res) {
  var url = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + 
      req.query.idToken;

  var errorFn = function(err) {
    console.log(err);
    res.status(500).json({error: err});
  };

  Q.nfcall(request, url).then(function(response) {
    response = response[0];
    if (response.statusCode != 200) {
      throw new Error('Status code was ' + response.statusCode);
    }
    return JSON.parse(response.body);
  }, errorFn).then(function(user) {
    var usersCollection = db.collection('users');
    var finder = usersCollection.find({id: user['sub']});
    return Q.ninvoke(finder, 'toArray');
  }, errorFn).then(function(docs) {
    if (docs.length == 1) {
      res.json(docs[0].votes)
    } else {
      res.status(404).send();
    }
  }, errorFn);
});

// HTML5 routing of the app.
app.get('/*', function(req, res, next) {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(PORT, function () {
  console.log('NOTB app listening on port ' + PORT)
})
