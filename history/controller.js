var moment = require('moment');


var logHistory = function (mongoColletion, req, res){
  //Record the query request to mongodb
  var historyObj = {
      timestamp: moment.utc().format(),
      search_tags: req.searchTags,
      results_per_page: req.resPerPage,
      page_offset: req.offset,
      query_parameters: req.query,
      relative_search_url: req.originalUrl,
      search_url: process.env.SERVER_URL + req.originalUrl
    };


  mongoColletion.insertOne(historyObj, function(insertErr, insertResult){
    if (insertErr) {
      console.log(`Error inserting history record:\n${insertErr}`);
    }
  }); //end colImageSearchHistory.insertOne()
}

var getHistory = function(mongoCollection, req, res){
  
  mongoCollection.find()
    .skip((req.resPerPage * req.offset) - req.resPerPage)
    .limit(req.resPerPage)
    .sort({timestamp: -1})
    .toArray(function processHistoryResults(findErr, findRes){
      if (findErr) {
        console.log(`history search failed:\n${findErr}`);
        return res.status(200).json({});
      }
      res.json(findRes);
    });
}


module.exports = {
  logHistory: logHistory,
  getHistory: getHistory
};