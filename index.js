var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    request = require('request'),
    assert = require('assert'),
    MongoClient = require('mongodb').MongoClient;

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
      req.body.idToken
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
      res.json({items: docs[0].items})
    }
  });
});

app.post('/api/items/all', function(req, res) {
  var parts = req.body.items.split('\n');

  var itemsCollection = db.collection('items');
  itemsCollection.update({}, {
    items: parts
  }, {
    upsert: true
  }, function(err, result) {
    if (err != null) {
      res.status(500).json({error: err});
    } else {
      res.json({result: 'Inserted ' + parts.length + ' items'});
    }
  })
});

app.all('/*', function(req, res, next) {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(PORT, function () {
  console.log('NOTB app listening on port ' + PORT)
})
