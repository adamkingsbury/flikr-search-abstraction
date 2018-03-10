if (process.env.API_MODE !== 'dummy') {
  var fs = {};
  var dummyResult = '';
}
else{
  var fs = require('fs');
  var dummyResult = JSON.parse(fs.readFileSync('./dummy/searchresponse.json', 'utf8'));
} 

//Flickr API
if (process.env.API_MODE !== 'dummy') {
  var Flickr = require("flickrapi"),
      flickrOptions = {
        api_key: process.env.API_KEY,
        secret: process.env.API_SECRET
      };

  //the internal pre-authenticated flickr token
  var flickr;

  //Try to get an authenticated fliker api object and set it to the flickr variable in the background
  Flickr.tokenOnly(flickrOptions, function(error, newFlickr) {
    if (error) {
      console.log(`Unable to establish connection to flickr api. Please check you have set "API_KEY" and "API_SECRET" values in your .env file.\nError:\n${error}`);
        flickr = {};
    }
    else {
      flickr = newFlickr;
    }
  });
}
else {
  var flickr = {};
}
  
  
var searchImages = function (taglist, resPerPage, pageIndex, callback){
  console.log('Lets try a search for: ' + taglist);
  
  if (!flickr){
    console.log('The flickr object was empty')
    return callback(new Error('flickr API is not available'));
  }
  
  if (!taglist || taglist === ''){
    console.log('there was nothing in the tag list');
    return callback(new Error('No tag words provided'));
  }
  
  //Provide a mock response to save on API calls during development if the .env
  //variable API_MODE is ste to dummy
  if (process.env.API_MODE === 'dummy') {
    console.log('Running dummy api responses');
    callback(null, dummyResult);
  }
  else {
    
    //try to search for the provided tags
    flickr.photos.search(
      {
        api_key: process.env.API_KEY, 
        tag_mode:'all', 
        tags: taglist, 
        sort: 'date-posted-desc', 
        per_page: resPerPage, 
        page: pageIndex
      }, 
      function (err, res){
        if (err) {
          return callback(err);
        }
        callback(null, parseResultsJson(res));
      });
  }
  
};

function parseResultsJson(json){
  
  var parsed = [];
  
  for (const photo of json.photos.photo) { 
    parsed.push(
      {
        alt_text: photo.title, 
        url:`https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`,
        url_small:`https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_q.jpg`,
        flickr_page: `https://www.flickr.com/photos/${photo.owner}/${photo.id}`
      });
  }
  
  return parsed;
}



module.exports = {
  searchImages: searchImages
};