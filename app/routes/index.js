var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var MessageTemplate = require('../template/index')
var Handler = require('../handler/index')
var Adapter = require("../database/Adapter");
var db = new Adapter()
var twilioSmsService = require('./twilio')
var rp = require('request-promise');
var request = require('request');
var Q = require("q");
var deepgram = require("./deepgram-api");

// var actionJSONPayload = JSON.parse(req.body.payload)
// var CategoryName = actionJSONPayload.actions[0].name

const apiai = require('apiai');
const uuid = require('node-uuid');

const apiAiAccessToken = process.env.accesstoken || '7dc85301e757403d98b75299d19a18a4';
const devConfig = process.env.DEVELOPMENT_CONFIG == 'true';

const apiaiOptions = {};
if (devConfig) {
  apiaiOptions.hostname = process.env.DEVELOPMENT_HOST;
  apiaiOptions.path = "/api/query";
}

const apiAiService = apiai(apiAiAccessToken, apiaiOptions);

const sessionIds = new Map();

const MessagingResponse = require('twilio').twiml.MessagingResponse;

const VoiceResponse = require('twilio').twiml.VoiceResponse;
const _from = '+19786523111'
const term_id = 33

module.exports = {
  configure: function(app) {
    app.get('/', function(req, res) { res.status(200).send('Hello world!'); });

    // Slack Routes

    app.post('/slash-command', function(req, res, next) {
      res.status(200).end()
      var reqBody = req.body
      console.log(reqBody.response_url)
      // console.log(reqBody)
      db.GetSlackUserDetails(reqBody.user_id, reqBody.channel_id)
        .then(function(user) {
          if (user.length > 0) {} else {
            db.InsertNewSlackUser(reqBody.user_id, reqBody.team_id, reqBody.channel_id)
          }
        })
        .then(function() {
          var responseURL = reqBody.response_url
          var message = MessageTemplate.getStartedMessage
          MessageTemplate.sendMessageToSlackResponseURL(responseURL, message)
        })
    });

    app.post('/slash-command-record', function(req, res, next) {
      res.status(200).end()
      var reqBody = req.body
      // console.log(reqBody)
      // console.log(reqBody.response_url)
      console.log(reqBody.text)
      var responseURL = reqBody.response_url
      var msg = 'To start recording soundbites, follow these steps: \n1. Visit this url: http://b2bsoundbites.com \n2. Create an account \n3. Verify your phone number.'
      twilioSmsService.sendMessageToClient(reqBody.text, _from, msg)
        .then(function(result) {
          console.log(result.sid)
          var message = MessageTemplate.promptPhone
          MessageTemplate.sendMessageToSlackResponseURL(responseURL, message)
        })
      // var message = MessageTemplate.promptPhone
      // MessageTemplate.sendMessageToSlackResponseURL(responseURL, message)

    });

    app.post('/slack/actions', urlencodedParser, (req, res) => {
      res.status(200).end() // best practice to respond with 200 status
      var actionJSONPayload = JSON.parse(req.body.payload) // parse URL-encoded payload JSON string
      return Handler.handle(actionJSONPayload)
    })

    // Twilio Routes

    app.post('/record', (req, res) => {
      // Use the Twilio Node.js SDK to build an XML response
      const twiml = new VoiceResponse();
      twiml.say('Hello. Please note that your recording cannot exceed ninety seconds. Leave the message after the beep. ');

      // Use <Record> to record and transcribe the caller's message
      twiml.record({
        transcribe: true,
        transcribeCallback: '/handle_transcribe',
        recordingStatusCallback: '/recording-status',
        recordingStatusCallbackMethod: 'POST'
      });

      // End the call with <Hangup>
      twiml.hangup();

      // Render the response as XML in reply to the webhook request
      res.type('text/xml');
      res.send(twiml.toString());
    });

    app.post('/handle_transcribe', function(req, res) {
      var call_sid = req.body.CallSid;
      var RecordingSid = req.body.RecordingSid;
      var from = req.body.From
      var to = req.body.To
      var TranscriptionText = req.body.TranscriptionText
      // var rec_url = req.body.RecordingUrl
      // var rec = rec_url.replace("https://api.twilio.com", "")
      var uri = req.body.RecordingUrl + '.mp3'
      var user_id;
      var post_id;
      var RecordingDuration;
      var is_deleted;
      console.log(req.body)
      // Get user id from db
      db.getWordPressUser(from)
        .then(function(result1) {
          console.log(result1[0].user_id)
          user_id = result1[0].user_id
          return db.CreatePostWP(user_id, TranscriptionText)
        })
        .then(function(result2) {
          console.log(result2)
          post_id = result2.post_id
          return db.GetRecordingDetailsWP(RecordingSid)
        })
        .then(function(result3) {
          console.log(result3)
          is_deleted = result3[0].is_deleted
          RecordingDuration = result3[0].duration
          if (TranscriptionText) {
            rp.post('http://text-processing.com/api/sentiment/', {
                form: {
                  text: TranscriptionText
                }
              })
              .then(function(req, res) {
                senti = JSON.parse(req)
                console.log(senti)
                var positivity = senti.probability.pos
                var negativity = senti.probability.neg
                var neutrality = senti.probability.neutral
                var label = senti.label
                return db.CreateSoundBiteWP(post_id, call_sid, RecordingSid, from, to, uri, TranscriptionText, positivity, negativity, neutrality, label, RecordingDuration, term_id)
              })
              .then(function(result) {
                db.InsertPostIdAndCategoryId(post_id, term_id)
              })
              .then(function() {
                console.log(is_deleted)
                if (is_deleted > 0) {
                  console.log('is_deleted>0')
                  console.log(is_deleted > 0)
                  var msg = 'Your twilio recording exceeds the limit of 90 seconds. And hence it has been discarded. Please record your message again.'
                  console.log(to, from, msg)
                  twilioSmsService.sendMessageToClient(from.toString(), to.toString(), msg.toString())
                } else {
                  var msg = 'Your twilio recording has been saved successfully. To send the soundbite title and your article url, please reply with the following format :\n<Title>, <URL> '
                  return twilioSmsService.sendMessageToClient(from.toString(), to.toString(), msg.toString())
                }
              })
              .then(function() {
                return saveToDeepgram(uri)
              })
              .then(function(data) {
                console.log(data)
                db.InsertDeepgramContentId(post_id, data.asset_id)
              })
          } else {

          }
        })
    });

    // Deepgram search routes
    app.post('/search', function(req, res) {
      console.log('/search')
      return deepgram.search(req, res)
    });

    app.post('/recording-status', function(req, res) {
      console.log(req.body)
      var is_deleted;
      if (parseInt(req.body.RecordingDuration) <= 90) {
        is_deleted = 0
      } else {
        is_deleted = 1
      }

      db.InsertRecordingDetailsWP(req.body.RecordingSid, parseInt(req.body.RecordingDuration), is_deleted)
      // .then(function(result) {
      //   console.log(result)
      // })
    });

    // app.post('/sms', function(req, res){
    //   console.log(req.body)
    // })

    app.post('/sms', (req, res) => {

      console.log(req.body)
      if (req.body.MediaUrl0) {
        var user_id, post_id;
        db.getWordPressUser(req.body.From)
          .then(function(result) {
            console.log(result)
            // db.SaveTitleAndUrl
            user_id = result[0].user_id
            return db.getPost(user_id)
          })
          .then(function(post) {
            console.log(post[0].ID)
            post_id = post[0].ID
            return db.InsertImageUrlInPostMeta(req.body.MediaUrl0, post_id)
          })
          .then(function(r11) {
            console.log(r11)

            const twiml = new MessagingResponse();

            twiml.message('Your image has been saved successfully!');

            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());
          })
          .then(function() {
            return db.GetAudioAndVideoFromPostId(post_id)
            // ConvertImageAudioToVideo()
          })
          .then(function(av) {
            console.log(av)
            return ConvertImageAudioToVideo(av[0].soundbites_bg_image_url, av[0].uri, post_id)
            // ConvertImageAudioToVideo()
          })

      } else if (req.body.Body) {


        console.log(req.body.Body)
        var temp = req.body.Body.split(',')
        var user_id, post_id;
        db.getWordPressUser(req.body.From)
          .then(function(result) {
            console.log(result)
            // db.SaveTitleAndUrl
            user_id = result[0].user_id
            return db.getPost(user_id)
          })
          .then(function(post) {
            console.log(post[0].ID)
            post_id = post[0].ID
            return db.UpdatePostTitle(temp[0], post_id)
          })
          .then(function(r) {
            console.log(r)
            return db.InsertArticleUrlInPostMeta(temp[1], post_id)
          })
          .then(function(r11) {
            console.log(r11)

            const twiml = new MessagingResponse();

            twiml.message('Title and url has been saved successfully!\nNow you can attach a background image and send it here.');

            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());
            // return db.InsertArticleUrlInPostMeta(temp[1], post_id)
          })

      }
    });


    // OTP verification
    app.post('/registration', function(req, res) {
      console.log('/registration')
      // console.log(req.body)
      return db.create(req, res)
    });
    app.post('/check', function(req, res) {
      console.log('/check')
      console.log(req.body)
      res.send(req.body)
    });

    app.post('/verify', function(req, res) {
      console.log('/verify')
      return db.verify(req, res)
    });

    app.post('/resend', function(req, res) {
      return db.getUserPhoneDetails(req, res)

    })

  }
}

var Botkit = require('botkit');

var controller = Botkit.slackbot({
  debug: false,
});

var bot = controller.spawn({
  token: process.env.SLACK_OAUTH_TOKEN
}).startRTM();


controller.hears(['.*'], 'direct_message,direct_mention,mention', function(bot, message, req) {
  console.log(message)
  // console.log(bot)
  controller.storage.users.get(message.user, function(err, user) {
    if (user && user.name) {
      bot.reply(message, 'Hello ' + user.name + '!!');
    } else {
      db.GetSlackUserDetails(message.user, message.channel)
        .then(function(user) {
          if (user.length > 0) {} else {
            db.InsertNewSlackUser(message.user, message.team, message.channel)
          }
        })
        .then(function() {
          console.log(message.text);
          if (message.type == "message") {
            if (message.user == bot.identity.id) {
              // message from bot can be skipped
            } else {
              var requestText = message.text;
              var channel = message.channel;
              if (!(channel in sessionIds)) {
                sessionIds[channel] = uuid.v1();
              }
              var request = apiAiService.textRequest(requestText, { sessionId: sessionIds[channel] });
              request.on('response', function(response) {

                //var actionJSONPayload = JSON.parse(req.body.payload)
                //var CategoryName = actionJSONPayload.actions[0].name

                console.log(response);
                if (response.result.metadata.intentName == 'greeting') {
                  return bot.reply(message, MessageTemplate.getStartedMessage);
                } else if (response.result.metadata.intentName == 'expert_search') {
                  if (response.result.parameters.any) {
                    console.log("hey it's working");

                    db.GetSoundBiteByName(response.result.parameters.any)
                      .then(function(soundbite) {
                        soundbite[0].name = response.result.parameters.any
                        console.log(soundbite)
                        if (soundbite.length > 0) {
                          var transcription = soundbite[0].transcription,
                            uri = soundbite[0].uri,
                            soundbite_id = soundbite[0].post_id,
                            CategoryName = "No_Category",
                            type = "name_specific",
                            parameter_name = response.result.parameters.any

                          console.log(CategoryName, type, transcription, uri, soundbite_id, "0", parameter_name, "no time");

                          var tmpMessage = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id, "0", parameter_name, "no time")
                          return bot.reply(message, tmpMessage)

                        }
                      })
                  }
                } else if (response.result.metadata.intentName == 'log_search') {
                  type = "ALL"
                  var cat_value = response.result.fulfillment.speech

                  db.GetAllSoundBites(33)
                    .then(function(soundbite) {
                      console.log(soundbite)
                      if (soundbite.length > 0) {
                        var transcription = soundbite[0].transcription,
                          uri = soundbite[0].uri,
                          soundbite_id = soundbite[0].post_id,
                          CategoryName = "log_All"
                        // user_id = soundbite[0].user_id;
                        var nwmessage = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id)
                        return bot.reply(message, nwmessage)

                      }

                    })
                } else if (response.result.metadata.intentName == 'cloud_search') {

                  return bot.reply(message, MessageTemplate.noSoundMsg('Cloud Services', 'Logistics'));
                } else if (response.result.metadata.intentName == 'DA_search') {

                  return bot.reply(message, MessageTemplate.noSoundMsg('Data Analytics', 'Logistics'));
                } else if (response.result.metadata.intentName == 'DC_search') {

                  return bot.reply(message, MessageTemplate.noSoundMsg('Data Centers', 'Logistics'));
                } else if (response.result.metadata.intentName == 'IT_search') {

                  return bot.reply(message, MessageTemplate.noSoundMsg('Information Technology', 'Logistics'));
                } else if (response.result.metadata.intentName == 'block_by_username') {

                  var slack_user = message.user

                  db.GetBlockedByName(slack_user, response.result.parameters.any)
                    .then(function(user) {
                      console.log(user);
                      //  wp_user_id = user[0].wp_user_id
                      //  var slack_user_id = user[0].slack_user_id,
                      console.log(user[0].wp_user_id, user[0].slack_user_id)
                      db.BlockedByName(user[0].slack_user_id, user[0].wp_user_id, 1)
                        .then(function(res) {
                          console.log(res)
                          if (res.insertId == 0) {
                            return bot.reply(message, "You have already blocked " + response.result.parameters.any);
                          } else {
                            return bot.reply(message, "Soundbites of " + response.result.parameters.any + " blocked");
                          }
                        })

                    })

                } else if (response.result.metadata.intentName == 'follow_user') {
                  console.log("follow");

                  var slack_user = message.user

                  db.GetBlockedByName(slack_user, response.result.parameters.any)
                    .then(function(user) {
                      console.log(user);

                      console.log(user[0].wp_user_id, user[0].slack_user_id)
                      db.FollowByName(user[0].slack_user_id, user[0].wp_user_id, 1)
                        .then(function(res) {
                          console.log(res)
                          if (res.insertId == 0) {
                            return bot.reply(message, "You are already following " + response.result.parameters.any);
                          } else {
                            return bot.reply(message, "You started following " + response.result.parameters.any);
                          }
                        })

                    })

                } else if (response.result.metadata.intentName == 'search_by_keyword') {
                  var keyword = response.result.parameters.keyword;
                  console.log(keyword);
                  var request = require('request');

                  var options = {
                    method: 'POST',
                    url: 'https://b2bslack.herokuapp.com/search',
                    headers: { 'content-type': 'application/json' },
                    body: { query: keyword },
                    json: true
                  };

                  request(options, function(error, response, body) {
                    if (response) {
                      var asset_arr = response.body.asset_ids;
                      console.log(asset_arr);
                      var asset_str = asset_arr.toString().split(',');
                      console.log(asset_str);
                    }

                    db.SearchContentId(asset_str)
                      .then(function(soundbite) {
                        console.log(soundbite)
                        console.log("no of soundbites", soundbite.length)
                        var counter = "0"
                        if (soundbite.length > 0) {
                          var transcription = soundbite[0].transcription,
                            uri = soundbite[0].uri,
                            soundbite_id = soundbite[0].post_id,
                            CategoryName = "NoCategory",
                            type = "keyword_specific"



                          var keyMessage = MessageTemplate.TranscriptionMessage2(CategoryName, type, transcription, uri, soundbite_id, counter, keyword)
                          return bot.reply(message, keyMessage)

                        }
                      })

                  });

                  //return bot.reply(message, "we got ur keyword " + keyword);
                }

              });
              request.on('error', function(error) {
                console.log(error);
              });
              request.end();
            }
          }
        })

      // .then(function() {
      //
      //   bot.reply(message, MessageTemplate.getStartedMessage);
      // })
    }
  });
});

//Deepgram

var saveToDeepgram = function(uri) {
  console.log('saveToDeepgram')
  var deferred = Q.defer();
  var options = {
    method: 'POST',
    url: 'https://secret-brain.deepgram.com/speech:recognize',
    qs: { signed_username: '2|1:0|10:1507026398|15:signed_username|32:a3JpdGlrYUB0aG91Z2h0bmV4dC5jb20=|004cf5ed2bbe98116c97f11d57f000607b881c369d159aa28717fdb961ca1ae6' },
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      "config": { "async": "true" },
      "audio": { "url": uri }
    },
    json: true
  };
  console.log(options.url)
  request(options, function(error, response, body) {
    if (error) {
      deferred.reject(error);
    } else {
      deferred.resolve(body)
    }
  });
  return deferred.promise;
}



var ConvertImageAudioToVideo = function(image, audio, post_id) {
  console.log('ConvertImageAudioToVideo')
  var deferred = Q.defer();
  var options = {
    method: 'POST',
    url: 'http://ec2-34-228-32-128.compute-1.amazonaws.com:9000/upload',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      image: image,
      audio: audio,
      post_id: post_id
    },
    json: true
  };
  request(options, function(error, response, body) {
    if (error) {
      deferred.reject(error);
    } else {
      deferred.resolve(body)
    }
  });
  return deferred.promise;
}
