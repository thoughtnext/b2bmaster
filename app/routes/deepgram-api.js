var Q = require('q')
var request = require('request')

exports.search = function(req, res) {
  var deferred = Q.defer();

  var options = {
    method: 'POST',
    url: 'https://secret-brain.deepgram.com/assets/search',
    qs: { signed_username: '2|1:0|10:1507026398|15:signed_username|32:a3JpdGlrYUB0aG91Z2h0bmV4dC5jb20=|004cf5ed2bbe98116c97f11d57f000607b881c369d159aa28717fdb961ca1ae6' },
    headers: { 'content-type': 'application/json' },
    body: { query: req.body.query },
    json: true
  }

  request(options, function(error, response, body) {
    if (error) {
      res.send({ error: error })
      deferred.reject(error);
    } else {

      var asset_ids = []
      for (var i = 0; i < body.results.length; i++) {
        if (body.results[i].hits[0].quality > 0.4) {
          asset_ids.push(body.results[i].asset_id)
        }
      }
      res.send({ asset_ids: asset_ids })
      deferred.resolve(asset_ids)
    }
  })

  return deferred.promise;
}