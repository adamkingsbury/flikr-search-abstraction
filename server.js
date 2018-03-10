// init project
var express = require('express');
var app = express();
var moment = require('moment');

//mongo
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?ssl=true`;
var db //The mongo database object
var colImageSearchHistory //The image search history collection

//Controllers
var fApi = require('./flickr-handler/controller');
var history = require('./history/controller');


//static content
app.use('/public', express.static(process.cwd() + '/public'));



//routes
app.get('/search/:text', handleSearch); 

app.get('/history', handleHistory);

app.use('/', express.static(process.cwd() + '/frontend'));




// Attempt to connect to the mongo database.
// Throw an error if it is not possible to connect.
// otherwise start listening on the server
MongoClient.connect(mongoUrl, function(err, newDb) {
  if (err) {
    throw err;
  }
  
  db = newDb;
  colImageSearchHistory = db.collection(process.env.MONGO_COLLECTION);
  
  app.listen(process.env.PORT, function () {
    console.log('Node.js listening on port ' + process.env.PORT);
  });
});


function handleSearch(req, res, next){
    
  //pull out the search parameters
  req.searchTags = req.params.text.split(' ').join(',');

  //set the restult per page and offsets from query params or use defaults
  req.resPerPage = req.query.per_page ? req.query.per_page : 10;
  req.offset = req.query.offset ? req.query.offset : 1; 

  //Record the query request to mongodb
  history.logHistory(colImageSearchHistory,req,res);

  //Now go get the image search results
  //This is NOT dependant on the history logging function
  fApi.searchImages(req.searchTags, req.resPerPage, req.offset, function(err, result){
    if (err) {
      console.log(`Error when running image search query: ${err}`);
      return res.json({});
    }
    res.json(result);
  }); //end fApi.searchImages()
}  //end Function handleSearch()


function handleHistory(req, res, next){
  //set the restult per page and offsets from query params or use defaults
  req.resPerPage = req.query.per_page ? parseInt(req.query.per_page) : 10;
  req.offset = req.query.offset ? parseInt(req.query.offset) : 1;
  
  history.getHistory(colImageSearchHistory, req, res);
}