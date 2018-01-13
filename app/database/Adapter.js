'use strict';
var mysql = require("mysql");
var Q = require("q");
var moment = require('moment');
const twilioClient = require('twilio')('AC310036f39b6beced1842554c59f6ec53', '7ddeee8b7568b865cefa97b8ca5957bc');

var options = {
  "host": process.env.MYSQL_HOST || "industrysoundbites.com",
  "port": process.env.MYSQL_PORT || "3306",
  "user": process.env.MYSQL_USER || "industry_sound",
  "password": process.env.MYSQL_PASSWORD || "w@rr7x*I+gfv",
  "database": process.env.MYSQL_DATABASE || "industry_soundbites",
  "multipleStatements": true
};

function Adapter() {
  if (this instanceof Adapter) {
    // this.root = new Firebase(process.env.FIREBASE_URL || "https://glaring-heat-2025.firebaseio.com/");
    this.db = mysql.createPool(options);
  } else {
    return new Adapter();
  }
}

//get bot user on userid
Adapter.prototype.GetSlackUserDetails = function(user_id, channel_id) {

  const query = "SELECT * FROM slack_users WHERE user_id = " + this.db.escape(user_id) + " AND channel_id=" + this.db.escape(channel_id);
  var deferred = Q.defer();
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        connection.release();
        if (err) {
          console.log(err)
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });
  console.log("GetSlackUserDetails function finished")
  return deferred.promise;
}

Adapter.prototype.InsertNewSlackUser = function(id, team_id, channel_id) {
  var deferred = Q.defer();
  const query = "INSERT INTO slack_users(user_id,team_id,channel_id) VALUES(" +
    this.db.escape(id) + "," + this.db.escape(team_id) + "," + this.db.escape(channel_id) + ")";

  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });

  console.log("InsertNewSlackUser function finished")
  return deferred.promise;
}

Adapter.prototype.GetSoundBite = function(term_id, label) {
  var deferred = Q.defer();
  // const query = "SELECT * FROM `wp_soundbites` WHERE term_id=" + term_id + " AND label=" + this.db.escape(label) + " LIMIT 1";
  const query = "SELECT t3.* FROM (" +
    "SELECT t2.meta_id, t2.post_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'duration' THEN t2.meta_value end) duration," +
    "MAX(CASE WHEN t2.`meta_key` = 'label' THEN t2.meta_value end) label," +
    "MAX(CASE WHEN t2.`meta_key` = 'transcription' THEN t2.meta_value end) transcription," +
    "MAX(CASE WHEN t2.`meta_key` = 'uri' THEN t2.meta_value end) uri," +
    "MAX(CASE WHEN t2.`meta_key` = 'from_number' THEN t2.meta_value end) from_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'to_number' THEN t2.meta_value end) to_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'call_sid' THEN t2.meta_value end) call_sid," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_positivity' THEN t2.meta_value end) sentiment_positivity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_negativity' THEN t2.meta_value end) sentiment_negativity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_neutrality' THEN t2.meta_value end) sentiment_neutrality," +
    "MAX(CASE WHEN t2.`meta_key` = 'rsid' THEN t2.meta_value end) rsid," +
    "MAX(CASE WHEN t2.`meta_key` = 'term_id' THEN t2.meta_value end) term_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'upvotes' THEN t2.meta_value end) upvotes," +
    "MAX(CASE WHEN t2.`meta_key` = 'downvotes' THEN t2.meta_value end) downvotes " +
    "FROM wp_postmeta t2 " +
    "GROUP BY t2.post_id) t3 WHERE t3.label =" + this.db.escape(label) + " AND t3.term_id = " + term_id + " LIMIT 1";
  console.log(query)
  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          // console.log(results)
          deferred.resolve(results);
        }
      });
    }
  });

  console.log("GetSoundBite function finished")
  return deferred.promise;
}

Adapter.prototype.GetSoundBiteByName = function(name) {
  var deferred = Q.defer();
  // const query = "SELECT * FROM `wp_soundbites` WHERE term_id=" + term_id + " AND label=" + this.db.escape(label) + " LIMIT 1";
  const query =  '   SELECT t3.*   '  +
 '   FROM (SELECT t2.meta_id, t2.post_id,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "duration" THEN t2.meta_value end) duration,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "label" THEN t2.meta_value end) label,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "transcription" THEN t2.meta_value end) transcription,  '  +
 '         Max(CASE WHEN t2.`meta_key` = "uri" THEN t2.meta_value end) uri,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "from_number" THEN t2.meta_value end) from_number,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "to_number" THEN t2.meta_value end) to_number,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "call_sid" THEN t2.meta_value end) call_sid,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "sentiment_positivity" THEN t2.meta_value end) sentiment_positivity,  '  +
 '         Max(CASE WHEN t2.`meta_key` = "sentiment_negativity" THEN t2.meta_value end) sentiment_negativity,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "sentiment_neutrality" THEN t2.meta_value end) sentiment_neutrality,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "rsid" THEN t2.meta_value end) rsid,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "term_id" THEN t2.meta_value end) term_id,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "upvotes" THEN t2.meta_value end) upvotes,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "downvotes" THEN t2.meta_value end) downvotes   '  +
 '         FROM   wp_postmeta t2   '  +
 '         GROUP  BY t2.post_id) t3   '  +
 '   WHERE  t3.term_id = 33   '  +
 '   	AND t3.post_id IN (SELECT DISTINCT( wp_posts.id )  '  +
 '         FROM   wp_usermeta   '  +
 '         INNER JOIN wp_posts ON wp_posts.post_author = wp_usermeta.user_id   '  +
 '         INNER JOIN wp_postmeta ON wp_posts.id = wp_postmeta.post_id   '  +
 '         WHERE (wp_usermeta.meta_key = "first_name" || wp_usermeta.meta_key = "last_name" )  '  +
 '         AND Lower(wp_usermeta.meta_value) = "'+name+'")   '  +
 '  ORDER BY t3.post_id ASC LIMIT  1   ' ;
  console.log(query)
  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          // console.log(results)
          deferred.resolve(results);
        }
      });
    }
  });

  console.log("GetSoundBite function finished")
  return deferred.promise;
}


Adapter.prototype.GetNextSoundBite = function(soundbite_id, term_id, label) {
  var deferred = Q.defer();
  var query;
  // const query = "SELECT * FROM `wp_soundbites` WHERE term_id=" + term_id + " AND label=" + this.db.escape(label) + " AND id>" + soundbite_id + " LIMIT 1";
  if (label != undefined)
    query = "SELECT t3.* FROM (" +
    "SELECT t2.meta_id, t2.post_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'duration' THEN t2.meta_value end) duration," +
    "MAX(CASE WHEN t2.`meta_key` = 'label' THEN t2.meta_value end) label," +
    "MAX(CASE WHEN t2.`meta_key` = 'transcription' THEN t2.meta_value end) transcription," +
    "MAX(CASE WHEN t2.`meta_key` = 'uri' THEN t2.meta_value end) uri," +
    "MAX(CASE WHEN t2.`meta_key` = 'from_number' THEN t2.meta_value end) from_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'to_number' THEN t2.meta_value end) to_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'call_sid' THEN t2.meta_value end) call_sid," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_positivity' THEN t2.meta_value end) sentiment_positivity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_negativity' THEN t2.meta_value end) sentiment_negativity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_neutrality' THEN t2.meta_value end) sentiment_neutrality," +
    "MAX(CASE WHEN t2.`meta_key` = 'rsid' THEN t2.meta_value end) rsid," +
    "MAX(CASE WHEN t2.`meta_key` = 'term_id' THEN t2.meta_value end) term_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'upvotes' THEN t2.meta_value end) upvotes," +
    "MAX(CASE WHEN t2.`meta_key` = 'downvotes' THEN t2.meta_value end) downvotes " +
    "FROM wp_postmeta t2 " +
    "GROUP BY t2.post_id) t3 WHERE t3.label =" + this.db.escape(label) + " AND t3.term_id = " + term_id + " AND post_id > " + soundbite_id + " LIMIT 1";
  else
    query = "SELECT t3.* FROM (" +
    "SELECT t2.meta_id, t2.post_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'duration' THEN t2.meta_value end) duration," +
    "MAX(CASE WHEN t2.`meta_key` = 'label' THEN t2.meta_value end) label," +
    "MAX(CASE WHEN t2.`meta_key` = 'transcription' THEN t2.meta_value end) transcription," +
    "MAX(CASE WHEN t2.`meta_key` = 'uri' THEN t2.meta_value end) uri," +
    "MAX(CASE WHEN t2.`meta_key` = 'from_number' THEN t2.meta_value end) from_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'to_number' THEN t2.meta_value end) to_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'call_sid' THEN t2.meta_value end) call_sid," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_positivity' THEN t2.meta_value end) sentiment_positivity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_negativity' THEN t2.meta_value end) sentiment_negativity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_neutrality' THEN t2.meta_value end) sentiment_neutrality," +
    "MAX(CASE WHEN t2.`meta_key` = 'rsid' THEN t2.meta_value end) rsid," +
    "MAX(CASE WHEN t2.`meta_key` = 'term_id' THEN t2.meta_value end) term_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'upvotes' THEN t2.meta_value end) upvotes," +
    "MAX(CASE WHEN t2.`meta_key` = 'downvotes' THEN t2.meta_value end) downvotes " +
    "FROM wp_postmeta t2 " +
    "GROUP BY t2.post_id) t3 WHERE t3.term_id = " + term_id + " AND t3.post_id > " + soundbite_id + " LIMIT 1";

  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });

  console.log("GetNextSoundBite function finished")
  return deferred.promise;
}

Adapter.prototype.GetPreviousSoundBite = function(soundbite_id, term_id, label) {
  var deferred = Q.defer();
  console.log("GetPreviousSoundBite")

  var query;
  // const query = "SELECT * FROM `wp_soundbites` WHERE term_id=" + term_id + " AND label=" + this.db.escape(label) + " AND id>" + soundbite_id + " LIMIT 1";
  if (label != undefined)
    query = "SELECT t3.* FROM (" +
    "SELECT t2.meta_id, t2.post_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'duration' THEN t2.meta_value end) duration," +
    "MAX(CASE WHEN t2.`meta_key` = 'label' THEN t2.meta_value end) label," +
    "MAX(CASE WHEN t2.`meta_key` = 'transcription' THEN t2.meta_value end) transcription," +
    "MAX(CASE WHEN t2.`meta_key` = 'uri' THEN t2.meta_value end) uri," +
    "MAX(CASE WHEN t2.`meta_key` = 'from_number' THEN t2.meta_value end) from_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'to_number' THEN t2.meta_value end) to_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'call_sid' THEN t2.meta_value end) call_sid," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_positivity' THEN t2.meta_value end) sentiment_positivity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_negativity' THEN t2.meta_value end) sentiment_negativity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_neutrality' THEN t2.meta_value end) sentiment_neutrality," +
    "MAX(CASE WHEN t2.`meta_key` = 'rsid' THEN t2.meta_value end) rsid," +
    "MAX(CASE WHEN t2.`meta_key` = 'term_id' THEN t2.meta_value end) term_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'upvotes' THEN t2.meta_value end) upvotes," +
    "MAX(CASE WHEN t2.`meta_key` = 'downvotes' THEN t2.meta_value end) downvotes " +
    "FROM wp_postmeta t2 " +
    "GROUP BY t2.post_id) t3 WHERE t3.label =" + this.db.escape(label) + " AND t3.term_id = " + term_id + " AND post_id < " + soundbite_id + " LIMIT 1";
  else
    query = "SELECT t3.* FROM (" +
    "SELECT t2.meta_id, t2.post_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'duration' THEN t2.meta_value end) duration," +
    "MAX(CASE WHEN t2.`meta_key` = 'label' THEN t2.meta_value end) label," +
    "MAX(CASE WHEN t2.`meta_key` = 'transcription' THEN t2.meta_value end) transcription," +
    "MAX(CASE WHEN t2.`meta_key` = 'uri' THEN t2.meta_value end) uri," +
    "MAX(CASE WHEN t2.`meta_key` = 'from_number' THEN t2.meta_value end) from_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'to_number' THEN t2.meta_value end) to_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'call_sid' THEN t2.meta_value end) call_sid," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_positivity' THEN t2.meta_value end) sentiment_positivity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_negativity' THEN t2.meta_value end) sentiment_negativity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_neutrality' THEN t2.meta_value end) sentiment_neutrality," +
    "MAX(CASE WHEN t2.`meta_key` = 'rsid' THEN t2.meta_value end) rsid," +
    "MAX(CASE WHEN t2.`meta_key` = 'term_id' THEN t2.meta_value end) term_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'upvotes' THEN t2.meta_value end) upvotes," +
    "MAX(CASE WHEN t2.`meta_key` = 'downvotes' THEN t2.meta_value end) downvotes " +
    "FROM wp_postmeta t2 " +
    "GROUP BY t2.post_id) t3 WHERE t3.term_id = " + term_id + " AND t3.post_id < " + soundbite_id + " LIMIT 1";
console.log(query);
  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });

  console.log("GetPreviousSoundBite function finished")
  return deferred.promise;
}

Adapter.prototype.GetNextSoundBiteByName = function(soundbite_id, name) {
  var deferred = Q.defer();
  var query;
  // const query = "SELECT * FROM `wp_soundbites` WHERE term_id=" + term_id + " AND label=" + this.db.escape(label) + " AND id>" + soundbite_id + " LIMIT 1";
  // if (label != undefined)
    query =  '   SELECT t3.*   '  +
 '   FROM (SELECT t2.meta_id, t2.post_id,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "duration" THEN t2.meta_value end) duration,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "label" THEN t2.meta_value end) label,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "transcription" THEN t2.meta_value end) transcription,  '  +
 '         Max(CASE WHEN t2.`meta_key` = "uri" THEN t2.meta_value end) uri,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "from_number" THEN t2.meta_value end) from_number,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "to_number" THEN t2.meta_value end) to_number,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "call_sid" THEN t2.meta_value end) call_sid,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "sentiment_positivity" THEN t2.meta_value end) sentiment_positivity,  '  +
 '         Max(CASE WHEN t2.`meta_key` = "sentiment_negativity" THEN t2.meta_value end) sentiment_negativity,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "sentiment_neutrality" THEN t2.meta_value end) sentiment_neutrality,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "rsid" THEN t2.meta_value end) rsid,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "term_id" THEN t2.meta_value end) term_id,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "upvotes" THEN t2.meta_value end) upvotes,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "downvotes" THEN t2.meta_value end) downvotes   '  +
 '         FROM   wp_postmeta t2   '  +
 '         GROUP  BY t2.post_id) t3   '  +
 '   WHERE ' +
 '   	t3.post_id IN (SELECT DISTINCT( wp_posts.id )  '  +
 '         FROM   wp_usermeta   '  +
 '         INNER JOIN wp_posts ON wp_posts.post_author = wp_usermeta.user_id   '  +
 '         INNER JOIN wp_postmeta ON wp_posts.id = wp_postmeta.post_id   '  +
 '         WHERE  wp_usermeta.meta_key = "first_name"  '  +
 '         AND Lower(wp_usermeta.meta_value) = "'+name+'" AND wp_postmeta.post_id >' + soundbite_id + ' )  '  +
 '  LIMIT  1   ' ;

  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });

  console.log("GetNextSoundBiteByName function finished")
  return deferred.promise;
}

Adapter.prototype.GetPreviousSoundBiteByName = function(soundbite_id, name) {
  var deferred = Q.defer();
  var query;
  // const query = "SELECT * FROM `wp_soundbites` WHERE term_id=" + term_id + " AND label=" + this.db.escape(label) + " AND id>" + soundbite_id + " LIMIT 1";
  // if (label != undefined)
    query =  '   SELECT t3.*   '  +
 '   FROM (SELECT t2.meta_id, t2.post_id,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "duration" THEN t2.meta_value end) duration,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "label" THEN t2.meta_value end) label,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "transcription" THEN t2.meta_value end) transcription,  '  +
 '         Max(CASE WHEN t2.`meta_key` = "uri" THEN t2.meta_value end) uri,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "from_number" THEN t2.meta_value end) from_number,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "to_number" THEN t2.meta_value end) to_number,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "call_sid" THEN t2.meta_value end) call_sid,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "sentiment_positivity" THEN t2.meta_value end) sentiment_positivity,  '  +
 '         Max(CASE WHEN t2.`meta_key` = "sentiment_negativity" THEN t2.meta_value end) sentiment_negativity,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "sentiment_neutrality" THEN t2.meta_value end) sentiment_neutrality,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "rsid" THEN t2.meta_value end) rsid,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "term_id" THEN t2.meta_value end) term_id,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "upvotes" THEN t2.meta_value end) upvotes,   '  +
 '         Max(CASE WHEN t2.`meta_key` = "downvotes" THEN t2.meta_value end) downvotes   '  +
 '         FROM   wp_postmeta t2   '  +
 '         GROUP  BY t2.post_id) t3   '  +
 '   WHERE ' +
 '   	t3.post_id IN (SELECT DISTINCT( wp_posts.id )  '  +
 '         FROM   wp_usermeta   '  +
 '         INNER JOIN wp_posts ON wp_posts.post_author = wp_usermeta.user_id   '  +
 '         INNER JOIN wp_postmeta ON wp_posts.id = wp_postmeta.post_id   '  +
 '         WHERE  wp_usermeta.meta_key = "first_name"  '  +
 '         AND Lower(wp_usermeta.meta_value) = "'+name+'" AND wp_postmeta.post_id <' + soundbite_id + ' )  '  +
 '  LIMIT  1   ' ;

  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });

  console.log("GetNextSoundBiteByName function finished")
  return deferred.promise;
}

Adapter.prototype.GetBlockedByName = function(slack_user,wp_user) {
  var deferred = Q.defer();
  //var query
  // const query = "SELECT * FROM `wp_soundbites` WHERE term_id=" + term_id + " AND label=" + this.db.escape(label) + " AND id>" + soundbite_id + " LIMIT 1";
  //if (label != undefined)
 var query = "SELECT wp_usermeta.user_id as wp_user_id, (SELECT slack_users.id FROM `slack_users` " +
            " WHERE slack_users.user_id = " + this.db.escape(slack_user) + ") as slack_user_id FROM `wp_usermeta` " +
            " WHERE (wp_usermeta.meta_key = 'first_name' || wp_usermeta.meta_key = 'last_name') AND " +
            " Lower(wp_usermeta.meta_value) LIKE  " + this.db.escape(wp_user);
  console.log(query);

  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });

  console.log("GetBlockedByName function finished")
  return deferred.promise;
}

Adapter.prototype.BlockedByName = function(slack_user_id,wp_user_id, is_blocked) {
  var deferred = Q.defer();
  //var query
  console.log(slack_user_id,wp_user_id)
  // const query = "SELECT * FROM `wp_soundbites` WHERE term_id=" + term_id + " AND label=" + this.db.escape(label) + " AND id>" + soundbite_id + " LIMIT 1";
  //if (label != undefined)
 //var query = "INSERT INTO `block_list`(`id`, `slack_user_id`, `wp_user_id`, `is_blocked`) VALUES (NULL," + slack_user_id + "," + wp_user_id + ", 1)";
 var query = "INSERT INTO block_list (`slack_user_id`, `wp_user_id`, `is_blocked`)" +
             "SELECT * FROM (SELECT " + slack_user_id + "," + wp_user_id + "," + is_blocked +") AS tmp " +
              "WHERE NOT EXISTS (" +
                 "SELECT id FROM block_list WHERE slack_user_id = " + slack_user_id + " AND wp_user_id=" + wp_user_id  +
              ") LIMIT 1"
 console.log(query);

  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });

  console.log("BlockedByName function finished")
  return deferred.promise;
}

Adapter.prototype.FollowByName = function(slack_user_id,wp_user_id, is_following) {
  var deferred = Q.defer();
  //var query
  console.log(slack_user_id,wp_user_id)
  // const query = "SELECT * FROM `wp_soundbites` WHERE term_id=" + term_id + " AND label=" + this.db.escape(label) + " AND id>" + soundbite_id + " LIMIT 1";
  //if (label != undefined)
 //var query = "INSERT INTO `block_list`(`id`, `slack_user_id`, `wp_user_id`, `is_blocked`) VALUES (NULL," + slack_user_id + "," + wp_user_id + ", 1)";
 var query = "INSERT INTO follow_list (`slack_user_id`, `wp_user_id`, `is_following`)" +
             "SELECT * FROM (SELECT " + slack_user_id + "," + wp_user_id + "," + is_following +") AS tmp " +
              "WHERE NOT EXISTS (" +
                 "SELECT id FROM follow_list WHERE slack_user_id = " + slack_user_id + " AND wp_user_id=" + wp_user_id  +
              ") LIMIT 1"
 console.log(query);

  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });

  console.log("FollowByName function finished")
  return deferred.promise;
}

Adapter.prototype.GetAllSoundBites = function(term_id) {
  var deferred = Q.defer();
  const query = "SELECT t3.* FROM (" +
    "SELECT t2.meta_id, t2.post_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'duration' THEN t2.meta_value end) duration," +
    "MAX(CASE WHEN t2.`meta_key` = 'label' THEN t2.meta_value end) label," +
    "MAX(CASE WHEN t2.`meta_key` = 'transcription' THEN t2.meta_value end) transcription," +
    "MAX(CASE WHEN t2.`meta_key` = 'uri' THEN t2.meta_value end) uri," +
    "MAX(CASE WHEN t2.`meta_key` = 'from_number' THEN t2.meta_value end) from_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'to_number' THEN t2.meta_value end) to_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'call_sid' THEN t2.meta_value end) call_sid," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_positivity' THEN t2.meta_value end) sentiment_positivity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_negativity' THEN t2.meta_value end) sentiment_negativity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_neutrality' THEN t2.meta_value end) sentiment_neutrality," +
    "MAX(CASE WHEN t2.`meta_key` = 'rsid' THEN t2.meta_value end) rsid," +
    "MAX(CASE WHEN t2.`meta_key` = 'term_id' THEN t2.meta_value end) term_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'upvotes' THEN t2.meta_value end) upvotes," +
    "MAX(CASE WHEN t2.`meta_key` = 'downvotes' THEN t2.meta_value end) downvotes " +
    "FROM wp_postmeta t2 " +
    "GROUP BY t2.post_id) t3 WHERE t3.term_id = " + term_id + " LIMIT 1";

  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        console.log(query)
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          // console.log(results)

          deferred.resolve(results);
        }
      });
    }
  });

  console.log("GetAllSoundBites function finished")
  return deferred.promise;
}

Adapter.prototype.GetTop3UpvotedSoundBites = function(term_id) {
  var deferred = Q.defer();
  const query = "SELECT t3.* FROM (" +
    "SELECT t2.meta_id, t2.post_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'duration' THEN t2.meta_value end) duration," +
    "MAX(CASE WHEN t2.`meta_key` = 'label' THEN t2.meta_value end) label," +
    "MAX(CASE WHEN t2.`meta_key` = 'transcription' THEN t2.meta_value end) transcription," +
    "MAX(CASE WHEN t2.`meta_key` = 'uri' THEN t2.meta_value end) uri," +
    "MAX(CASE WHEN t2.`meta_key` = 'from_number' THEN t2.meta_value end) from_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'to_number' THEN t2.meta_value end) to_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'call_sid' THEN t2.meta_value end) call_sid," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_positivity' THEN t2.meta_value end) sentiment_positivity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_negativity' THEN t2.meta_value end) sentiment_negativity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_neutrality' THEN t2.meta_value end) sentiment_neutrality," +
    "MAX(CASE WHEN t2.`meta_key` = 'rsid' THEN t2.meta_value end) rsid," +
    "MAX(CASE WHEN t2.`meta_key` = 'term_id' THEN t2.meta_value end) term_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'upvotes' THEN t2.meta_value end) upvotes," +
    "MAX(CASE WHEN t2.`meta_key` = 'downvotes' THEN t2.meta_value end) downvotes " +
    "FROM wp_postmeta t2 " +
    "GROUP BY t2.post_id) t3 WHERE t3.term_id = " + term_id + " ORDER BY t3.upvotes DESC LIMIT 3";

  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        console.log(query)
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          // console.log(results)

          deferred.resolve(results);
        }
      });
    }
  });

  console.log("GetAllSoundBites function finished")
  return deferred.promise;
}

Adapter.prototype.GetNextTopVotedSoundbite = function(soundbite_id, term_id) {
  var deferred = Q.defer();
  const query = "SELECT t3.* FROM (" +
    "SELECT t2.meta_id, t2.post_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'duration' THEN t2.meta_value end) duration," +
    "MAX(CASE WHEN t2.`meta_key` = 'label' THEN t2.meta_value end) label," +
    "MAX(CASE WHEN t2.`meta_key` = 'transcription' THEN t2.meta_value end) transcription," +
    "MAX(CASE WHEN t2.`meta_key` = 'uri' THEN t2.meta_value end) uri," +
    "MAX(CASE WHEN t2.`meta_key` = 'from_number' THEN t2.meta_value end) from_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'to_number' THEN t2.meta_value end) to_number," +
    "MAX(CASE WHEN t2.`meta_key` = 'call_sid' THEN t2.meta_value end) call_sid," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_positivity' THEN t2.meta_value end) sentiment_positivity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_negativity' THEN t2.meta_value end) sentiment_negativity," +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_neutrality' THEN t2.meta_value end) sentiment_neutrality," +
    "MAX(CASE WHEN t2.`meta_key` = 'rsid' THEN t2.meta_value end) rsid," +
    "MAX(CASE WHEN t2.`meta_key` = 'term_id' THEN t2.meta_value end) term_id," +
    "MAX(CASE WHEN t2.`meta_key` = 'upvotes' THEN t2.meta_value end) upvotes," +
    "MAX(CASE WHEN t2.`meta_key` = 'downvotes' THEN t2.meta_value end) downvotes " +
    "FROM wp_postmeta t2 " +
    "GROUP BY t2.post_id) t3 WHERE t3.term_id = " + term_id +" AND t3.post_id > " + soundbite_id + " ORDER BY t3.upvotes DESC LIMIT 1";

  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        console.log(query)
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          // console.log(results)

          deferred.resolve(results);
        }
      });
    }
  });

  console.log("GetAllSoundBites function finished")
  return deferred.promise;
}

Adapter.prototype.GetTop3SoundbitesForDate = function(start_date, end_date, term_id) {
  var deferred = Q.defer();
  var query = "SELECT t3.* FROM (SELECT t2.meta_id, t2.post_id, " +
    "MAX(CASE WHEN t2.`meta_key` = 'duration' THEN t2.meta_value end) duration, " +
    "MAX(CASE WHEN t2.`meta_key` = 'label' THEN t2.meta_value end) label, " +
    "MAX(CASE WHEN t2.`meta_key` = 'transcription' THEN t2.meta_value end) transcription, " +
    "MAX(CASE WHEN t2.`meta_key` = 'uri' THEN t2.meta_value end) uri, " +
    "MAX(CASE WHEN t2.`meta_key` = 'from_number' THEN t2.meta_value end) from_number, " +
    "MAX(CASE WHEN t2.`meta_key` = 'to_number' THEN t2.meta_value end) to_number, " +
    "MAX(CASE WHEN t2.`meta_key` = 'call_sid' THEN t2.meta_value end) call_sid, " +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_positivity' THEN t2.meta_value end) sentiment_positivity, " +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_negativity' THEN t2.meta_value end) sentiment_negativity, " +
    "MAX(CASE WHEN t2.`meta_key` = 'sentiment_neutrality' THEN t2.meta_value end) sentiment_neutrality, " +
    "MAX(CASE WHEN t2.`meta_key` = 'rsid' THEN t2.meta_value end) rsid, " +
    "MAX(CASE WHEN t2.`meta_key` = 'term_id' THEN t2.meta_value end) term_id, " +
    "MAX(CASE WHEN t2.`meta_key` = 'upvotes' THEN t2.meta_value end) upvotes ," +
    "MAX(CASE WHEN t2.`meta_key` = 'downvotes' THEN t2.meta_value end) downvotes " +
    "FROM wp_postmeta t2 GROUP BY t2.post_id) t3 " +
    "WHERE t3.term_id = " + term_id + " AND " +
    "t3.post_id IN (SELECT secondary_item_id FROM wp_ask_votes " +
    "WHERE date_recorded " +
    "BETWEEN '" + start_date + "' AND '" + end_date + "' " +
    "GROUP BY wp_ask_votes.secondary_item_id ORDER BY COUNT(secondary_item_id) DESC ) LIMIT 3"
  console.log(query);

  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });

  console.log("GetTop3SoundbitesForDate function finished")
  return deferred.promise;
}

Adapter.prototype.getWordPressUser = function(phone) {
  var number = phone.substr(phone.length - 10, 10)
  const query = "SELECT user_id FROM `wp_usermeta` WHERE meta_key='phone' AND meta_value=" + this.db.escape(number);
  console.log(query)
  var deferred = Q.defer();
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      console.log("conn successful")
      connection.query(query, [], function(err, results) {
        // console.log(query)
        connection.release();
        if (err) {
          console.log(err)
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });
  console.log("getWordPressUser function finished")
  return deferred.promise;
}
Adapter.prototype.getPost = function(user_id) {
  const query = "SELECT wp_posts.* FROM `wp_posts` WHERE post_author = " + this.db.escape(user_id) + " ORDER BY id DESC LIMIT 1"  ;
  console.log(query)
  var deferred = Q.defer();
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      console.log("conn successful")
      connection.query(query, [], function(err, results) {
        // console.log(query)
        connection.release();
        if (err) {
          console.log(err)
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });
  console.log("getPost function finished")
  return deferred.promise;
}

Adapter.prototype.UpdatePostTitle = function(title, post_id) {
  const query = "UPDATE wp_posts SET post_title = "+this.db.escape(title)+" WHERE id = " + this.db.escape(post_id) ;
  console.log(query)
  var deferred = Q.defer();
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      console.log("conn successful")
      connection.query(query, [], function(err, results) {
        // console.log(query)
        connection.release();
        if (err) {
          console.log(err)
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });
  console.log("UpdatePostTitle function finished")
  return deferred.promise;
}

Adapter.prototype.InsertArticleUrlInPostMeta = function(articleUrl, post_id) {
  console.log(articleUrl, post_id)
  const query = "INSERT INTO `wp_postmeta` (post_id, meta_key, meta_value) VALUES (" + post_id +", 'article_url', "+ this.db.escape(articleUrl) +")";
  console.log(query)
  var deferred = Q.defer();
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      console.log("conn successful")
      connection.query(query, [], function(err, results) {
        // console.log(query)
        connection.release();
        if (err) {
          console.log(err)
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });
  console.log("InsertArticleUrlInPostMeta function finished")
  return deferred.promise;
}

Adapter.prototype.InsertImageUrlInPostMeta = function(backgroundImage, post_id) {
 
  console.log(backgroundImage, post_id)
  const query = "INSERT INTO `wp_postmeta` (post_id, meta_key, meta_value) VALUES (" + post_id + ", 'soundbites_bg_image_url', " + this.db.escape(backgroundImage) + ")";
  console.log(query)
  var deferred = Q.defer();
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      console.log("conn successful")
      connection.query(query, [], function(err, results) {
        // console.log(query)
        connection.release();
        if (err) {
          console.log(err)
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });
  console.log("InsertImageUrlInPostMeta function finished")
  return deferred.promise;
}

Adapter.prototype.GetRecordingDetailsWP = function(rsid) {
  // var number = phone.substr(phone.length-10, 10)
  const query = "SELECT duration FROM `recording_details` WHERE rsid =" + this.db.escape(rsid);
  console.log(query)
  var deferred = Q.defer();
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      console.log("conn successful")
      connection.query(query, [], function(err, results) {
        // console.log(query)
        connection.release();
        if (err) {
          console.log(err)
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });
  console.log("GetRecordingDetailsWP function finished")
  return deferred.promise;
}

Adapter.prototype.CreatePostWP = function(user_id, transcription) {
  const query = "INSERT INTO wp_posts (post_author, post_content, post_status, post_type) VALUES (" + this.db.escape(user_id) + ", " + this.db.escape(transcription) + ", 'pending', 'prediction')";
  console.log(query)
  var deferred = Q.defer();
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      console.log("conn successful")
      connection.query(query, [], function(err, results) {
        connection.release();
        if (err) {
          console.log(err)
          deferred.reject(err);
        } else {
          deferred.resolve({
            post_id: results.insertId
          });
        }
      });
    }
  });
  console.log("CreatePostWP function finished")
  return deferred.promise;
}

Adapter.prototype.UpvoteSoundbiteWP = function(post_id) {
  // console.log(req.query)
  // console.log(req.body)
  const query = "UPDATE wp_postmeta SET meta_value = meta_value+1 WHERE meta_key = 'upvotes' AND post_id = " + post_id;
  console.log(query)
  var deferred = Q.defer();
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      console.log("conn successful")
      connection.query(query, [], function(err, results) {
        // console.log(query)
        connection.release();
        if (err) {
          console.log(err)
          deferred.reject(err);
        } else {
          deferred.resolve({
            post_id: results.insertId
          });
        }
      });
    }
  });
  console.log("UpvoteSoundbiteWP function finished")
  return deferred.promise;
}

Adapter.prototype.DownvoteSoundbiteWP = function(post_id) {
  const query = "UPDATE wp_postmeta SET meta_value = meta_value+1 WHERE meta_key = 'downvotes' AND post_id = " + post_id;
  console.log(query)
  var deferred = Q.defer();
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      console.log("conn successful")
      connection.query(query, [], function(err, results) {
        // console.log(query)
        connection.release();
        if (err) {
          console.log(err)
          deferred.reject(err);
        } else {
          deferred.resolve({
            post_id: results.insertId
          });
        }
      });
    }
  });
  console.log("DownvoteSoundbiteWP function finished")
  return deferred.promise;
}

Adapter.prototype.CheckVoteSoundbiteWP = function(slack_user_id, soundbite_id) {
  // console.log(req.query)
  // console.log(req.body)
  const query = "SELECT * from wp_ask_votes WHERE slack_user_id = "+this.db.escape(slack_user_id)+
  " AND secondary_item_id = "+this.db.escape(soundbite_id);
  console.log(query)
  var deferred = Q.defer();
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      console.log("conn successful")
      connection.query(query, [], function(err, results) {
        // console.log(query)
        connection.release();
        if (err) {
          console.log(err)
          deferred.reject(err);
        } else {
          console.log(results)
          deferred.resolve(results);
        }
      });
    }
  });
  console.log("CheckVoteSoundbiteWP function finished")
  return deferred.promise;
}
/*
timestamp issues
*/
Adapter.prototype.VoteSoundBiteWP = function(slack_user_id, soundbite_id, is_upvote) {
  // console.log(req.query)
  // console.log(req.body)
  console.log('VoteSoundBiteWP')
  var timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  console.log(timestamp);
  // const query = "INSERT into user_votes (slack_user_id, soundbite_id, is_upvote) VALUES (" +
  //   this.db.escape(slack_user_id) + ", " + this.db.escape(soundbite_id) + ", " + this.db.escape(is_upvote) + " )";
  const query = "INSERT INTO `wp_ask_votes` "+
  " (`id`, `user_id`, `slack_user_id`, `component`, `type`, `action`, `item_id`, `secondary_item_id`, `date_recorded`) "+
  " VALUES (NULL, 0,'"+ slack_user_id+"', 'custompost', 'prediction' , '"+is_upvote+"', 0, '"+soundbite_id+ "', '" + timestamp +"')"
  console.log(query)
  var deferred = Q.defer();
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      console.log("conn successful")
      connection.query(query, [], function(err, results) {
        // console.log(query)
        connection.release();
        if (err) {
          console.log(err)
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });
  console.log("VoteSoundBiteWP function finished")
  return deferred.promise;
}

Adapter.prototype.CreateSoundBiteWP = function(post_id, call_sid, rsid, from_number, to_number, uri, transcription, positivity, negativity, neutrality, label, duration,term_id) {
  const query = "INSERT INTO `wp_postmeta` (post_id, meta_key, meta_value) VALUES " +
    "(" + post_id + ", 'call_sid', " + this.db.escape(call_sid) + ")," +
    "(" + post_id + ", 'from_number', " + this.db.escape(from_number) + ")," +
    "(" + post_id + ", 'rsid', " + this.db.escape(rsid) + ")," +
    "(" + post_id + ", 'to_number', " + this.db.escape(to_number) + ")," +
    "(" + post_id + ", 'uri', " + this.db.escape(uri) + ")," +
    "(" + post_id + ", 'transcription', " + this.db.escape(transcription) + ")," +
    "(" + post_id + ", 'term_id', " + term_id + ")," +
    "(" + post_id + ", 'label', " + this.db.escape(label) + ")," +
    "(" + post_id + ", 'sentiment_positivity', " + this.db.escape(positivity) + ")," +
    "(" + post_id + ", 'sentiment_negativity', " + this.db.escape(negativity) + ")," +
    "(" + post_id + ", 'sentiment_neutrality', " + this.db.escape(neutrality) + ")," +
    "(" + post_id + ", 'is_approved', " + 0 + ")," +
    "(" + post_id + ", 'is_deleted', " + 0 + ")," +
    "(" + post_id + ", 'duration', " + duration + ")," +
    "(" + post_id + ", 'upvotes', " + 0 + ")," +
    "(" + post_id + ", 'downvotes', " + 0 + ")"

  console.log(query)
  var deferred = Q.defer();
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      console.log("conn successful")
      connection.query(query, [], function(err, results) {
        // console.log(query)
        connection.release();
        if (err) {
          console.log(err)
          deferred.reject(err);
        } else {
          deferred.resolve({
            post_id: results
          });
        }
      });
    }
  });
  console.log("CreateSoundBiteWP function finished")
  return deferred.promise;
}

Adapter.prototype.InsertPostIdAndCategoryId = function(post_id, category_id) {
 var deferred = Q.defer();
 const query = "INSERT INTO wp_term_relationships (object_id, term_taxonomy_id) VALUES ("+post_id+", "+category_id+")";

 this.db.getConnection(function(err, connection) {
   if (err) {
     deferred.reject(err);
   } else {
     connection.query(query, [], function(err, results) {
       console.log(query)
       connection.release();
       if (err) {
         deferred.reject(err);
       } else {
         deferred.resolve(results);
       }
     });
   }
 });
 console.log("InsertPostIdAndCategoryId function finished")
 return deferred.promise;
}

Adapter.prototype.InsertRecordingDetailsWP = function(rsid, duration, is_deleted) {

  const query = "INSERT INTO recording_details(duration, rsid, is_deleted) " +
    "VALUES( " + this.db.escape(duration) + "," + this.db.escape(rsid) + "," + this.db.escape(is_deleted) + ")";

  console.log(query)
  var deferred = Q.defer();
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      console.log("conn successful")
      connection.query(query, [], function(err, results) {
        // console.log(query)
        connection.release();
        if (err) {
          console.log(err)
          deferred.reject(err);
        } else {
          console.log(results)
          deferred.resolve({
            results: results
          });
        }
      });
    }
  });
  console.log("InsertRecordingDetailsWP function finished")
  return deferred.promise;
}

Adapter.prototype.SaveTitleAndUrl = function(rsid, duration, is_deleted) {

  const query = "INSERT INTO recording_details(duration, rsid, is_deleted) " +
    "VALUES( " + this.db.escape(duration) + "," + this.db.escape(rsid) + "," + this.db.escape(is_deleted) + ")";

  console.log(query)
  var deferred = Q.defer();
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      console.log("conn successful")
      connection.query(query, [], function(err, results) {
        // console.log(query)
        connection.release();
        if (err) {
          console.log(err)
          deferred.reject(err);
        } else {
          console.log(results)
          deferred.resolve({
            results: results
          });
        }
      });
    }
  });
  console.log("InsertRecordingDetailsWP function finished")
  return deferred.promise;
}

Adapter.prototype.InsertDeepgramContentId = function(post_id, content_id) {
  var deferred = Q.defer();
  const query = "INSERT INTO `wp_postmeta` (post_id, meta_key, meta_value) VALUES " +
  "(" + post_id + ", 'deepgram_content_id', " + this.db.escape(content_id) + ")"


  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        console.log(query)
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          console.log(results)
          deferred.resolve(results);
        }
      });
    }
  });
  console.log("InsertDeepgramContentId function finished")
  return deferred.promise;
}

Adapter.prototype.SearchContentId = function(content_id) {
 var deferred = Q.defer();
 // const query = SELECT t3.* FROM (
 //  SELECT t2.meta_id, t2.post_id,
 //  MAX(CASE WHEN t2.`meta_key` = 'duration' THEN t2.meta_value end) duration,
 //  MAX(CASE WHEN t2.`meta_key` = 'label' THEN t2.meta_value end) label,
 //  MAX(CASE WHEN t2.`meta_key` = 'transcription' THEN t2.meta_value end) transcription,
 //  MAX(CASE WHEN t2.`meta_key` = 'uri' THEN t2.meta_value end) uri,
 //  MAX(CASE WHEN t2.`meta_key` = 'from_number' THEN t2.meta_value end) from_number,
 //  MAX(CASE WHEN t2.`meta_key` = 'to_number' THEN t2.meta_value end) to_number,
 //  MAX(CASE WHEN t2.`meta_key` = 'call_sid' THEN t2.meta_value end) call_sid,
 //  MAX(CASE WHEN t2.`meta_key` = 'sentiment_positivity' THEN t2.meta_value end) sentiment_positivity,
 //  MAX(CASE WHEN t2.`meta_key` = 'sentiment_negativity' THEN t2.meta_value end) sentiment_negativity,
 //  MAX(CASE WHEN t2.`meta_key` = 'sentiment_neutrality' THEN t2.meta_value end) sentiment_neutrality,
 //  MAX(CASE WHEN t2.`meta_key` = 'rsid' THEN t2.meta_value end) rsid,
 //  MAX(CASE WHEN t2.`meta_key` = 'term_id' THEN t2.meta_value end) term_id,
 //  MAX(CASE WHEN t2.`meta_key` = 'upvotes' THEN t2.meta_value end) upvotes ,
 //  MAX(CASE WHEN t2.`meta_key` = 'downvotes' THEN t2.meta_value end) downvotes
 //  FROM wp_postmeta t2 GROUP BY t2.post_id) t3
 //  WHERE t3.term_id = 33 AND t3.post_id
 //  IN (SELECT post_id FROM wp_postmeta WHERE  meta_key = 'deepgram_content_id' AND meta_value = '1505891756-5082d707-7d4e-48d2-bd4b-1ea104b5e2ed-1595900128');

 const query = "SELECT t3.* FROM (" +
  "SELECT t2.meta_id, t2.post_id," +
  "MAX(CASE WHEN t2.`meta_key` = 'duration' THEN t2.meta_value end) duration," +
  "MAX(CASE WHEN t2.`meta_key` = 'label' THEN t2.meta_value end) label," +
  "MAX(CASE WHEN t2.`meta_key` = 'transcription' THEN t2.meta_value end) transcription," +
  "MAX(CASE WHEN t2.`meta_key` = 'uri' THEN t2.meta_value end) uri," +
  "MAX(CASE WHEN t2.`meta_key` = 'from_number' THEN t2.meta_value end) from_number," +
  "MAX(CASE WHEN t2.`meta_key` = 'to_number' THEN t2.meta_value end) to_number," +
  "MAX(CASE WHEN t2.`meta_key` = 'call_sid' THEN t2.meta_value end) call_sid," +
  "MAX(CASE WHEN t2.`meta_key` = 'sentiment_positivity' THEN t2.meta_value end) sentiment_positivity," +
  "MAX(CASE WHEN t2.`meta_key` = 'sentiment_negativity' THEN t2.meta_value end) sentiment_negativity," +
  "MAX(CASE WHEN t2.`meta_key` = 'sentiment_neutrality' THEN t2.meta_value end) sentiment_neutrality," +
  "MAX(CASE WHEN t2.`meta_key` = 'rsid' THEN t2.meta_value end) rsid," +
  "MAX(CASE WHEN t2.`meta_key` = 'term_id' THEN t2.meta_value end) term_id," +
  "MAX(CASE WHEN t2.`meta_key` = 'upvotes' THEN t2.meta_value end) upvotes," +
  "MAX(CASE WHEN t2.`meta_key` = 'downvotes' THEN t2.meta_value end) downvotes " +
  "FROM wp_postmeta t2 GROUP BY t2.post_id) t3 " +
  "WHERE t3.term_id = 33 AND t3.post_id " +
  "IN (SELECT post_id FROM wp_postmeta WHERE  meta_key = 'deepgram_content_id' AND meta_value IN  (" + this.db.escape(content_id) + ") )";

 this.db.getConnection(function(err, connection) {
   if (err) {
     deferred.reject(err);
   } else {
     connection.query(query, [], function(err, results) {
       console.log(query)
       connection.release();
       if (err) {
         deferred.reject(err);
       } else {
         deferred.resolve(results);
       }
     });
   }
 });
 console.log("SearchContentId function finished")
 return deferred.promise;
}

 
Adapter.prototype.GetAudioAndVideoFromPostId = function(post_id) {
  var deferred = Q.defer();
  const query = "SELECT t3.* FROM  ( SELECT t2.post_id, " +
    " Max( CASE WHEN t2.`meta_key` = 'uri' THEN t2.meta_value end) uri, " +
    " Max( CASE WHEN t2.`meta_key` = 'soundbites_bg_image_url' THEN t2.meta_value end) soundbites_bg_image_url " +
    " from wp_postmeta t2 GROUP BY t2.post_id) t3 " +
    " WHERE  t3.post_id = " + this.db.escape(post_id)
  this.db.getConnection(function(err, connection) {
    if (err) {
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {
        console.log(query)
        connection.release();
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(results);
        }
      });
    }
  });
  console.log("GetAudioAndVideoFromPostId function finished")
  return deferred.promise;
}


// OTP GENERATION AND VERIFICATION


Adapter.prototype.getUserPhoneDetails = function(req, res) {
  var deferred = Q.defer()
  var user_id = req.body.user_id
  var query = "SELECT * FROM wp_usermeta WHERE  (meta_key='phone' || meta_key='countryCode' || meta_key='verified'|| meta_key='modifiedOn'|| meta_key='otp') AND user_id=" + this.db.escape(user_id);
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, doc) {

        if (err) {
          console.log(err)
          res.send(err)
          deferred.reject(err);
        } else {
          console.log(doc)
          var modifiedOn = +new Date()
          const otp = generateOTP()
          var tempModifiedOn, tempOtp, tempVerified, umeta_id_verified, umeta_id_Otp, umeta_id_ModifiedOn,umeta_id_phone, tempPhone, tempCountryCode, umeta_id_country_code
          for (var i = 0; i < doc.length; i++) {
            console.log(doc[i].meta_key)
            console.log(doc[i].umeta_id+'\n')
            if (doc[i].meta_key == 'modifiedOn') {
              // tempModifiedOn = results[i].meta_value
              umeta_id_ModifiedOn = doc[i].umeta_id
            } else if (doc[i].meta_key == 'otp') {
              // tempOtp = doc[i].meta_value
              // console.log(doc[i].umeta_id)
              umeta_id_Otp = doc[i].umeta_id
            } else if (doc[i].meta_key == 'verified') {
              tempVerified = doc[i].meta_value
              umeta_id_verified = doc[i].umeta_id
            } else if (doc[i].meta_key == 'phone') {
              tempPhone = doc[i].meta_value
              umeta_id_phone = doc[i].umeta_id
            } else if (doc[i].meta_key == 'countryCode') {
              tempCountryCode = doc[i].meta_value
              umeta_id_country_code = doc[i].umeta_id
            }
          }
          var params = {
            phone: tempPhone,
            countryCode: tempCountryCode
          }
          console.log(typeof(tempVerified))
          if (tempVerified == 0) {
            var message = 'The otp for your phone number is ' + otp + '. '
            var finalMessage = `Otp has been successfully sent to your Phone number ${tempCountryCode}-${tempPhone}. Please note that OTP is valid for 120 seconds only.`
            console.log(umeta_id_ModifiedOn, umeta_id_Otp)
            var query1 = "UPDATE `wp_usermeta` SET `meta_value` = " + modifiedOn + " WHERE `wp_usermeta`.`umeta_id` = " + umeta_id_ModifiedOn +
              "; UPDATE `wp_usermeta` SET `meta_value` = " + otp + " WHERE `wp_usermeta`.`umeta_id` = " + umeta_id_Otp + ";"

            sendMessage(params, message)
              .then(function(data) {
                console.log(data)
                connection.query(query1, [], function(err, results) {
                  // connection.release();
                  if (err) {
                    console.log(err)
                    res.send(err)
                    deferred.reject(err);
                  } else {
                    res.send({
                      success: true,
                      message: finalMessage

                    })
                    deferred.resolve({
                      success: true,
                      message: finalMessage
                    });
                  }
                })
              }, function(err) {
                res.send({
                  success: false,
                  message: err
                })
                deferred.resolve({
                  success: false,
                  message: err
                });
              })
          } else {
            const message = 'Your number is already verified'
            res.send({
              success: false,
              message: message
            })
            deferred.resolve()
          }
        }

      })
    }
  })
  return deferred.promise;
}


// create a new user based on the form submission
Adapter.prototype.create = function(req, res) {
  const params = req.body

  var deferred = Q.defer();

  const otp = generateOTP()

  const phone = params.phone,
    countryCode = params.countryCode,
    user_id = params.user_id,
    modifiedOn = +new Date()

  const query = "INSERT INTO wp_usermeta (user_id, meta_key, meta_value) VALUES " +
    "(" + user_id + ",'phone', '" + phone + "')," +
    "(" + user_id + ",'countryCode', '" + countryCode + "')," +
    "(" + user_id + ",'otp', '" + otp + "')," +
    "(" + user_id + ",'verified', '" + 0 + "')," +
    "(" + user_id + ",'modifiedOn', '" + modifiedOn + "')";
  console.log(query)
  const query1 = "SELECT * FROM wp_usermeta WHERE meta_key='phone' AND meta_value=" + this.db.escape(phone);
  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      connection.query(query1, [], function(err, doc) {

        if (err) {
          console.log(err)
          res.send(err)
          deferred.reject(err);
        } else {
          if (doc[0] == undefined) {
            var message = 'The otp for your phone number is ' + otp + '. '
            var finalMessage = `Otp has been successfully sent to your Phone number ${countryCode}-${phone}. Please note that OTP is valid for 120 seconds only.`

            sendMessage(params, message)
              .then(function(data) {
                console.log(data)
                connection.query(query, [], function(err, results) {
                  // connection.release();
                  if (err) {
                    console.log(err)
                    res.send(err)
                    deferred.reject(err);
                  } else {
                    res.send({
                      success: true,
                      message: finalMessage,
                      result: {
                        id: results.insertId
                      }
                    })
                    deferred.resolve({
                      success: true,
                      message: finalMessage,
                      result: {
                        id: results.insertId
                      }
                    });
                  }
                })
              }, function(err) {
                res.send({
                  success: false,
                  message: err
                })
                deferred.resolve({
                  success: false,
                  message: err
                });
              })
          } else {
            // var message = 'You are already registered with us. Your verifiction is pending. An otp has been sent '
            // sendMessage(params, message)
            //   .then(function(data) {
            res.send({
              success: false,
              message: 'Number is already registered'
            })
            //   })
          }
        }
      });
    }
    connection.release();

  })
  return deferred.promise;
}

// create a new user based on the form submission
Adapter.prototype.verify = function(req, res) {
  const params = req.body

  var deferred = Q.defer();

  const modifiedOn = new Date(),
    user_id = params.user_id,
    otp = params.otp
  console.log(otp)
  // const query = "SELECT * FROM wp_usermeta WHERE user_id = '" + user_id + "' AND verified = " + 0 + " AND otp = " + otp;
  const query = "SELECT umeta_id, user_id, meta_key, meta_value FROM  `wp_usermeta` WHERE user_id ='" + user_id + "' && ( meta_key =  'verified' || meta_key =  'modifiedOn' || meta_key = 'otp')";

  this.db.getConnection(function(err, connection) {
    if (err) {
      console.log(err)
      deferred.reject(err);
    } else {
      connection.query(query, [], function(err, results) {

        if (err) {
          console.log(err)
          res.send(err)
          deferred.reject(err);
        } else {
          // console.log(results)

          if (results.length > 0) {
            var tempModifiedOn, tempOtp, tempVerified, umeta_id
            for (var i = 0; i < results.length; i++) {
              if (results[i].meta_key == 'modifiedOn') {
                tempModifiedOn = results[i].meta_value
              } else if (results[i].meta_key == 'otp') {
                tempOtp = results[i].meta_value
              } else if (results[i].meta_key == 'verified') {
                tempVerified = results[i].meta_value
                umeta_id = results[i].umeta_id
              }
            }
            // console.log(tempModifiedOn, tempOtp, tempVerified, umeta_id)
            // console.log(tempOtp == otp)
            if (tempVerified == 0) {
              if (tempOtp == otp) {
                var fromTime = tempModifiedOn;
                console.log(fromTime)
                var toTime = +new Date();
                console.log(toTime)

                var differenceTravel = toTime - fromTime
                var seconds = Math.floor((differenceTravel) / (1000));
                console.log(seconds)
                if (seconds > 120) {
                  res.send({
                    success: false,
                    message: 'Your session has expired. To send Otp again, click on resend button!'
                  })
                  connection.release();
                  deferred.resolve()
                } else {
                  const verified = 1
                  const message = 'Your Phone number has been verified successfully. '
                  const query1 = "UPDATE wp_usermeta SET meta_value = " + verified + " WHERE umeta_id = " + umeta_id;
                  connection.query(query1, [], function(err, doc) {
                    connection.release();
                    if (err) {
                      console.log(err)
                      res.send(err)
                      deferred.reject(err);
                    } else {
                      res.send({
                        success: true,
                        message: message
                      })
                      deferred.resolve()
                    }
                  })
                }
              } else {
                const message = 'You have entered an invalid otp. Please try again.'
                res.send({
                  success: false,
                  message: message
                })
                deferred.resolve()
              }
            } else {
              const message = 'Your number is already verified'
              res.send({
                success: false,
                message: message
              })
              deferred.resolve()
            }
          }

        }

      });
    }
  });
  return deferred.promise;
}



module.exports = Adapter;


var generateOTP = function() {
  var val = Math.floor(1000 + Math.random() * 9000);
  // console.log(val);
  return val;
}

var sendMessage = function(params, message) {
  // const self = this;
  var deferred = Q.defer();
  const toNumber = `+${params.countryCode}${params.phone}`;

  twilioClient.messages.create({
    to: toNumber,
    from: '+19786523111',
    body: message,
  }).then(function(data) {
    deferred.resolve(data)
    // successCallback();
  }).catch(function(err) {
    // errorCallback(err);
    deferred.reject(err)
  });
  return deferred.promise;

};
