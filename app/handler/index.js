var MessageTemplate = require('../template/index')
var Adapter = require("../database/Adapter");
var momentTime = require('../time/moment-tut')
var deepgram = require("../routes/deepgram-api")
var db = new Adapter()

exports.handle = function(actionJSONPayload) {
  console.log(actionJSONPayload.actions[0].name)
  console.log(actionJSONPayload.actions[0].value)
  console.log()
  if (actionJSONPayload.actions[0].name == "Logistics") {
    var CategoryName = actionJSONPayload.actions[0].name
    var User = actionJSONPayload.user
    var message;
    var type;
    var category_id = 33
    // var soundbite_id;
    if (actionJSONPayload.actions[0].value.indexOf("POSITIVE") != -1) {
      type = "POSITIVE";
      if (actionJSONPayload.actions[0].value.indexOf("PREVIOUS") != -1) {
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var counter = temp[length - 1]
        var message;
        console.log(temp)
        var counter_num = parseInt(counter, 10)
        counter_num = --counter_num
        var new_counter = counter_num.toString()
        console.log("previous counter ",counter_num);
        db.GetPreviousSoundBite(temp[length - 2], category_id, 'pos')
          .then(function(soundbite) {
            console.log(soundbite)
            if (soundbite.length > 0) {
              var transcription = soundbite[0].transcription,
                  uri = soundbite[0].uri ,
                  soundbite_id = soundbite[0].post_id
              // user_id = soundbite[0].user_id;
              message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter,"","no time")
            } else {
              message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, type)
            }
            MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
          })
      } else if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var counter = temp[length - 1]
        console.log(temp)
        var counter_num = parseInt(counter, 10)
        counter_num = ++counter_num
        var new_counter = counter_num.toString()
        console.log(counter_num);
        console.log(new_counter);
        db.GetNextSoundBite(temp[length - 2], category_id, 'pos')
          .then(function(soundbite) {
            console.log(soundbite)
            if (soundbite.length > 0) {
              var transcription = soundbite[0].transcription,
                  uri = soundbite[0].uri ,
                  soundbite_id = soundbite[0].post_id
              // user_id = soundbite[0].user_id;
              message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter,"","no time")
            } else {
              message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, type)
            }
            MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
          })
      } else if (actionJSONPayload.actions[0].value.indexOf("UPVOTE_AUDIO") != -1) {
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var slack_user_id = User.id
        return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
          .then(function(result) {
            console.log(result)
            if (result.length > 0) {
              message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
              return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
            } else {
              return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "up")
                .then(function(result) {
                  console.log(result)
                  if (result.insertId) {
                    return db.UpvoteSoundbiteWP(temp[length - 1])
                  }
                })
                .then(function() {
                  message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
                  return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                })
            }

          })
      }
      // Downvote
      else if (actionJSONPayload.actions[0].value.indexOf("DOWNVOTE_AUDIO") != -1) {
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var slack_user_id = User.id
        return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
          .then(function(result) {
            if (result.length > 0) {
              message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
              return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
            } else {
              return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "down")
                .then(function(result) {
                  console.log(result)
                  if (result.insertId) {
                    return db.DownvoteSoundbiteWP(temp[length - 1])
                  }
                })
                .then(function() {
                  message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
                  return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                })
            }

          })

      }
       else if (actionJSONPayload.actions[0].value.indexOf("BACK_CATEGORY") != -1) {
        message = MessageTemplate.CategoryMessage(actionJSONPayload.actions[0].name)
        MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
      }
       else {
        var counter = "0"
        db.GetSoundBite(category_id, 'pos')
          .then(function(soundbite) {
            console.log(soundbite)
            if (soundbite.length > 0) {
              var transcription = soundbite[0].transcription,
                  uri = soundbite[0].uri ,
                  soundbite_id = soundbite[0].post_id;
              message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id, counter,"","no time")
            } else {
              message = MessageTemplate.NoSoundbiteErrorMessage(CategoryName, type)
            }
            MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)

          })

      }
    } else if (actionJSONPayload.actions[0].value.indexOf("NEGATIVE") != -1) {
      type = "NEGATIVE";
      if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var counter = temp[length - 1]
        console.log(temp)
        var counter_num = parseInt(counter, 10)
        counter_num = ++counter_num
        var new_counter = counter_num.toString()
        console.log(counter_num);
        console.log(new_counter);
        db.GetNextSoundBite(temp[length - 2], category_id, 'neg')
          .then(function(soundbite) {
            console.log(soundbite)
            if (soundbite.length > 0) {
              var transcription = soundbite[0].transcription,
               uri = soundbite[0].uri ,
                soundbite_id = soundbite[0].post_id;
              user_id = soundbite[0].user_id;
              message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter,"","no time")
            } else {
              message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "NEGATIVE")
            }
            MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)

          })
      } else if (actionJSONPayload.actions[0].value.indexOf("PREVIOUS") != -1) {
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var counter = temp[length - 1]
        var message;
        console.log(temp)
        var counter_num = parseInt(counter, 10)
        counter_num = --counter_num
        var new_counter = counter_num.toString()
        console.log("previous counter ",counter_num);
        db.GetPreviousSoundBite(temp[length - 2], category_id, 'neg')
          .then(function(soundbite) {
            console.log(soundbite)
            if (soundbite.length > 0) {
              var transcription = soundbite[0].transcription,
                  uri = soundbite[0].uri ,
                  soundbite_id = soundbite[0].post_id
              // user_id = soundbite[0].user_id;
              message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter)
            } else {
              message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, type)
            }
            MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
          })
      } else if (actionJSONPayload.actions[0].value.indexOf("UPVOTE_AUDIO") != -1) {
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var slack_user_id = User.id
        return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
          .then(function(result) {
            if (result.length > 0) {
              message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
              return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
            } else {
              return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "up")
                .then(function(result) {
                  console.log(result)
                  if (result.insertId) {
                    return db.UpvoteSoundbiteWP(temp[length - 1])
                  }
                })
                .then(function() {
                  message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
                  return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                })
            }

          })
      } else if (actionJSONPayload.actions[0].value.indexOf("DOWNVOTE_AUDIO") != -1) {
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var slack_user_id = User.id
        return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
          .then(function(result) {
            if (result.length > 0) {
              message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
              return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
            } else {
              return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "down")
                .then(function(result) {
                  console.log(result)
                  if (result.insertId) {
                    return db.DownvoteSoundbiteWP(temp[length - 1])
                  }
                })
                .then(function() {
                  message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
                  return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                })
            }

          })
      }
      //  else if (actionJSONPayload.actions[0].value.indexOf("BACK_CATEGORY") != -1) {
      //   message = MessageTemplate.CategoryMessage(actionJSONPayload.actions[0].name)
      //   MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
      // }
       else {
        var counter = "0"
        db.GetSoundBite(category_id, 'neg')
          .then(function(soundbite) {
            console.log(soundbite)
            if (soundbite.length > 0) {
              var transcription = soundbite[0].transcription,
               uri = soundbite[0].uri ,
                soundbite_id = soundbite[0].post_id;
                user_id = soundbite[0].user_id;
              message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,counter,"","no time")
            } else {
              message = MessageTemplate.NoSoundbiteErrorMessage(CategoryName, "NEGATIVE")
            }
            MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)

          })
      }
    } else if (actionJSONPayload.actions[0].value.indexOf("NEUTRAL") != -1) {
      type = "NEUTRAL"
      // next
      if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
        console.log('\n\nhihihihihi\n\n')
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var counter = temp[length - 1]
        console.log(temp)
        var counter_num = parseInt(counter, 10)
        counter_num = ++counter_num
        var new_counter = counter_num.toString()
        console.log(counter_num);
        console.log(new_counter);
        db.GetNextSoundBite(temp[length - 2], category_id, 'neutral')
          .then(function(soundbite) {
            console.log(soundbite.length)
            if (soundbite.length > 0) {
              var transcription = soundbite[0].transcription,
               uri = soundbite[0].uri ,
                soundbite_id = soundbite[0].post_id
              // user_id = soundbite[0].user_id;
              message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter,"","no time")
            } else {
              message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "NEUTRAL")
            }
            MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)

          })
      }
      // PREVIOUS
      else if (actionJSONPayload.actions[0].value.indexOf("PREVIOUS") != -1) {
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var counter = temp[length - 1]
        var message;
        console.log(temp)
        var counter_num = parseInt(counter, 10)
        counter_num = --counter_num
        var new_counter = counter_num.toString()
        console.log("previous counter ",counter_num);
        db.GetPreviousSoundBite(temp[length - 2], category_id, 'neutral')
          .then(function(soundbite) {
            console.log(soundbite)
            if (soundbite.length > 0) {
              var transcription = soundbite[0].transcription,
                  uri = soundbite[0].uri ,
                  soundbite_id = soundbite[0].post_id
              // user_id = soundbite[0].user_id;
              message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter)
            } else {
              message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, type)
            }
            MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
          })
      }
      // Upvote
      else if (actionJSONPayload.actions[0].value.indexOf("UPVOTE_AUDIO") != -1) {
        console.log(actionJSONPayload.actions[0].value)
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var slack_user_id = User.id
        return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
          .then(function(result) {
            if (result.length > 0) {
              message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
              return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
            } else {
              return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "up")
                .then(function(result) {
                  console.log(result)
                  if (result.insertId) {
                    return db.UpvoteSoundbiteWP(temp[length - 1])
                  }
                })
                .then(function() {
                  message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
                  return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                })
            }

          })
      }
      // Downvote
      else if (actionJSONPayload.actions[0].value.indexOf("DOWNVOTE_AUDIO") != -1) {
        console.log(actionJSONPayload.actions[0].value)
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var slack_user_id = User.id
        return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
          .then(function(result) {
            if (result.length > 0) {
              message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
              return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
            } else {
              return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "down")
                .then(function(result) {
                  console.log(result)
                  if (result.insertId) {
                    return db.DownvoteSoundbiteWP(temp[length - 1])
                  }
                })
                .then(function() {
                  message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
                  return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                })
            }

          })

      }
      //  else if (actionJSONPayload.actions[0].value.indexOf("BACK_CATEGORY") != -1) {
      //   message = MessageTemplate.CategoryMessage(actionJSONPayload.actions[0].name)
      //   MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
      // }
       else {
        db.GetSoundBite(category_id, 'neutral')
          .then(function(soundbite) {
            console.log(soundbite)
            if (soundbite.length > 0) {
              var transcription = soundbite[0].transcription,
               uri = soundbite[0].uri ,
                soundbite_id = soundbite[0].post_id,
                counter = "0"
              /*,
                              user_id = soundbite[0].user_id;*/
              message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,counter,"","no time")
            } else {
              message = MessageTemplate.NoSoundbiteErrorMessage(CategoryName, "NEUTRAL")
            }
            MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
          })
      }
    } else if (actionJSONPayload.actions[0].value.indexOf("ALL") != -1) {
      type = "ALL"
      console.log("GetAllSoundBites")
      if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var message;
        var length = temp.length
        var counter = temp[length - 1]
        console.log(temp)
        var counter_num = parseInt(counter, 10)
        counter_num = ++counter_num
        var new_counter = counter_num.toString()
        console.log(counter_num);
        console.log(new_counter);
        db.GetNextSoundBite(temp[length - 2], category_id)
          .then(function(soundbite) {
            console.log(soundbite)
            if (soundbite.length > 0) {
              var transcription = soundbite[0].transcription,
                  uri = soundbite[0].uri ,
                  soundbite_id = soundbite[0].post_id
              // user_id = soundbite[0].user_id;
              message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter,"","no time")
            } else {
              message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
            }
            MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
          })
       } else if (actionJSONPayload.actions[0].value.indexOf("PREVIOUS") != -1) {
            var temp = actionJSONPayload.actions[0].value.split('-')
            var length = temp.length
            var counter = temp[length - 1]
            var message;
            console.log(temp)
            var counter_num = parseInt(counter, 10)
            counter_num = --counter_num
            var new_counter = counter_num.toString()
            console.log("previous counter ",counter_num);
            db.GetPreviousSoundBite(temp[length - 2], category_id)
              .then(function(soundbite) {
                console.log(soundbite)
                if (soundbite.length > 0) {
                  var transcription = soundbite[0].transcription,
                      uri = soundbite[0].uri ,
                      soundbite_id = soundbite[0].post_id
                  // user_id = soundbite[0].user_id;
                  message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter)
                } else {
                  message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, type)
                }
                MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
              })
          } else if (actionJSONPayload.actions[0].value.indexOf("UPVOTE_AUDIO") != -1) {
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var slack_user_id = User.id
        return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
          .then(function(result) {
            if (result.length > 0) {
              message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
              return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
            } else {
              return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "up")
                .then(function(result) {
                  console.log(result)
                  if (result.insertId) {
                    return db.UpvoteSoundbiteWP(temp[length - 1])
                  }
                })
                .then(function() {
                  message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
                  return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                })
            }

          })
      }
      // Downvote
      else if (actionJSONPayload.actions[0].value.indexOf("DOWNVOTE_AUDIO") != -1) {
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var slack_user_id = User.id
        return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
          .then(function(result) {
            if (result.length > 0) {
              message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
              return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
            } else {
              return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "down")
                .then(function(result) {
                  console.log(result)
                  if (result.insertId) {
                    return db.DownvoteSoundbiteWP(temp[length - 1])
                  }
                })
                .then(function() {
                  message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
                  return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                })
            }

          })

      } else {
        // var temp = actionJSONPayload.actions[0].value.split('-')
        // var length = temp.length
        var message;

        db.GetAllSoundBites(category_id)
          .then(function(soundbite) {
            console.log(soundbite)
            if (soundbite.length > 0) {
              var transcription = soundbite[0].transcription,
                  uri = soundbite[0].uri ,
                  soundbite_id = soundbite[0].post_id,
                  counter = "0"
              // user_id = soundbite[0].user_id;
              message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,counter,"","no time")
              // console.log(message)

            } else {
              message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")

            }
            console.log(message.attachments[0].actions)
            MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)

          })
      }
      // message = MessageTemplate.getStartedMessage
      // MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
    } else if (actionJSONPayload.actions[0].value.indexOf("BACK_HOME") != -1) {
      message = MessageTemplate.getStartedMessage
      MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
    } else if (actionJSONPayload.actions[0].value.indexOf("TOP_3_UPVOTED_AUDIO") != -1) {
      type = "TOP_3_UPVOTED_AUDIO"
         message = MessageTemplate.topThree(actionJSONPayload.actions[0].name)
         MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
      if (actionJSONPayload.actions[0].value.indexOf("TODAY") != -1) {
        //soundbite[0].count = count
        if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
         console.log("nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn");
         var temp = actionJSONPayload.actions[0].value.split('-')
         var length = temp.length
         var counter = temp[length - 1]
         var message;
         console.log(temp)
         var counter_num = parseInt(counter, 10)
         counter_num = ++counter_num
         var new_counter = counter_num.toString()
         console.log(counter_num);
         console.log(new_counter);
         var time = momentTime.getToday()
             t1 = time[0]
             t2 = time[1]
         console.log(t1,t2,"today");
         db.GetTop3SoundbitesForDate(t1,t2,category_id)
           .then(function(soundbite) {
             console.log(soundbite)
             if (soundbite.length >= 2 && counter_num < 3) {
               var transcription = soundbite[counter_num].transcription,
                   uri = soundbite[counter_num].uri ,
                   soundbite_id = soundbite[counter_num].post_id,
                   parameter_name = "no name",
                   time_slot = "TODAY"
               // user_id = soundbite[0].user_id;
               console.log(new_counter);
               message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter,parameter_name,time_slot)
             } else {
               message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
             }
             MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
           })
       } else if (actionJSONPayload.actions[0].value.indexOf("PREVIOUS") != -1) {
            console.log("pppppppppppppppppppppppppppppppppp");
            var temp = actionJSONPayload.actions[0].value.split('-')
            var length = temp.length
            var counter = temp[length - 1]
            var message;
            console.log(temp)
            var counter_num = parseInt(counter, 10)
            counter_num = --counter_num
            var new_counter = counter_num.toString()
            console.log("previous counter ",counter_num);
            var time = momentTime.getToday()
                t1 = time[0]
                t2 = time[1]
            console.log(t1,t2,"today");
            db.GetTop3SoundbitesForDate(t1,t2,category_id)
              .then(function(soundbite) {
                console.log(soundbite)
                if (soundbite.length >= 2 && counter_num < 3) {
                  var transcription = soundbite[counter_num].transcription,
                      uri = soundbite[counter_num].uri ,
                      soundbite_id = soundbite[counter_num].post_id,
                      parameter_name = "no name",
                      time_slot = "TODAY"
                  // user_id = soundbite[0].user_id;
                  message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter,parameter_name,time_slot)
                } else {
                  message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
                }
                MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
              })
            }else {
              var temp = actionJSONPayload.actions[0].value.split('-')
              var length = temp.length
              var message;
              console.log(temp)
              var time = momentTime.getToday()
                  t1 = time[0]
                  t2 = time[1]
              console.log(t1,t2,"today");
              db.GetTop3SoundbitesForDate(t1,t2, category_id)
                .then(function(soundbite) {
                  console.log(soundbite)
                  if (soundbite.length > 0) {
                    var transcription = soundbite[0].transcription,
                        uri = soundbite[0].uri ,
                        soundbite_id = soundbite[0].post_id,
                        parameter_name = "no name",
                        time_slot = "TODAY",
                        counter = "0"
                    // user_id = soundbite[0].user_id;
                    console.log(CategoryName, type, transcription, uri, soundbite_id,time_slot,counter);
                    message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter,parameter_name,time_slot)
                  } else {
                    message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
                  }
                  MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                })
             }

     } else if (actionJSONPayload.actions[0].value.indexOf("WEEK") != -1) {
       //soundbite[0].count = count
       if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
        console.log("NNNNNNNNNNNNNNNNNNNNNNNN");
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var counter = temp[length - 1]
        var message;
        console.log(temp)
        var counter_num = parseInt(counter, 10)
        counter_num = ++counter_num
        var new_counter = counter_num.toString()
        console.log(counter_num);
        var time = momentTime.getLastWeek()
            t1 = time[0]
            t2 = time[1]
        console.log(t1,t2,"week");
        db.GetTop3SoundbitesForDate(t1,t2,category_id)
          .then(function(soundbite) {
            console.log(soundbite)
            if (soundbite.length >= 2 && counter_num < 3) {
              var transcription = soundbite[counter_num].transcription,
                  uri = soundbite[counter_num].uri ,
                  soundbite_id = soundbite[counter_num].post_id,
                  parameter_name = "no name",
                  time_slot = "WEEK"
              // user_id = soundbite[0].user_id;
              message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter,parameter_name,time_slot)
            } else {
              message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
            }
            MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
          })
        } else if (actionJSONPayload.actions[0].value.indexOf("PREVIOUS") != -1) {
             console.log("pppppppppppppppppppppppppppppppppp");
             var temp = actionJSONPayload.actions[0].value.split('-')
             var length = temp.length
             var counter = temp[length - 1]
             var message;
             console.log(temp)
             var counter_num = parseInt(counter, 10)
             counter_num = --counter_num
             var new_counter = counter_num.toString()
             console.log("previous counter ",counter_num);
             var time = momentTime.getLastWeek()
                 t1 = time[0]
                 t2 = time[1]
             console.log(t1,t2,"week");
             db.GetTop3SoundbitesForDate(t1,t2,category_id)
               .then(function(soundbite) {
                 console.log(soundbite)
                 if (soundbite.length >= 2 && counter_num < 3) {
                   var transcription = soundbite[counter_num].transcription,
                       uri = soundbite[counter_num].uri ,
                       soundbite_id = soundbite[counter_num].post_id,
                       parameter_name = "no name",
                       time_slot = "WEEK"
                   // user_id = soundbite[0].user_id;
                   message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter,parameter_name,time_slot)
                 } else {
                   message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
                 }
                 MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
               })
             }else {
             var temp = actionJSONPayload.actions[0].value.split('-')
             var length = temp.length
             var message;
             console.log(temp)
             var time = momentTime.getLastWeek()
                 t1 = time[0]
                 t2 = time[1]
             console.log(t1,t2,"week");
               db.GetTop3SoundbitesForDate(t1,t2, category_id)
                 .then(function(soundbite) {
                   console.log(soundbite)
                   if (soundbite.length > 0) {
                     var transcription = soundbite[0].transcription,
                         uri = soundbite[0].uri ,
                         soundbite_id = soundbite[0].post_id,
                         parameter_name = "no name",
                         time_slot = "WEEK",
                         counter = "0"
                     // user_id = soundbite[0].user_id;
                     console.log(CategoryName, type, transcription, uri, soundbite_id,time_slot,counter);
                     message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,counter,parameter_name,time_slot)
                   } else {
                     message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
                   }
                   MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                 })
              }

        } else if (actionJSONPayload.actions[0].value.indexOf("MONTH") != -1) {
          //soundbite[0].count = count
          if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
           console.log("NNNNNNNNNNNNNNNNNNNNNNNN");
           var temp = actionJSONPayload.actions[0].value.split('-')
           var length = temp.length
           var counter = temp[length - 1]
           var message;
           console.log(temp)
           var counter_num = parseInt(counter, 10)
           counter_num = ++counter_num
           var new_counter = counter_num.toString()
           console.log(counter_num);
           var time = momentTime.getLastMonth()
               t1 = time[0]
               t2 = time[1]
           console.log(t1,t2,"month");
           db.GetTop3SoundbitesForDate(t1,t2,category_id)
             .then(function(soundbite) {
               console.log(soundbite.length)
               if (soundbite.length >= 2 && counter_num < 3) {
                 var transcription = soundbite[counter_num].transcription,
                     uri = soundbite[counter_num].uri ,
                     soundbite_id = soundbite[counter_num].post_id,
                     parameter_name = "no name",
                     time_slot = "MONTH"
                 // user_id = soundbite[0].user_id;
                 message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter,parameter_name,time_slot)
               } else {
                 message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
               }
               MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
             })
           } else if (actionJSONPayload.actions[0].value.indexOf("PREVIOUS") != -1) {
                console.log("pppppppppppppppppppppppppppppppppp");
                var temp = actionJSONPayload.actions[0].value.split('-')
                var length = temp.length
                var counter = temp[length - 1]
                var message;
                console.log(temp)
                var counter_num = parseInt(counter, 10)
                counter_num = --counter_num
                var new_counter = counter_num.toString()
                console.log("previous counter ",counter_num);
                var time = momentTime.getToday()
                    t1 = time[0]
                    t2 = time[1]
                console.log(t1,t2,"month");
                db.GetTop3SoundbitesForDate(t1,t2,category_id)
                  .then(function(soundbite) {
                    console.log(soundbite)
                    if (soundbite.length >= 2 && counter_num < 3) {
                      var transcription = soundbite[counter_num].transcription,
                          uri = soundbite[counter_num].uri ,
                          soundbite_id = soundbite[counter_num].post_id,
                          parameter_name = "no name",
                          time_slot = "MONTH"
                      // user_id = soundbite[0].user_id;
                      message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter,parameter_name,time_slot)
                    } else {
                      message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
                    }
                    MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                  })
                }else {
            var temp = actionJSONPayload.actions[0].value.split('-')
            var length = temp.length
            var message;
            console.log(temp)
            var time = momentTime.getLastMonth()
                t1 = time[0]
                t2 = time[1]
            console.log(t1,t2,"month");
              db.GetTop3SoundbitesForDate(t1,t2, category_id)
                .then(function(soundbite) {
                  console.log(soundbite)
                  if (soundbite.length > 0) {
                    var transcription = soundbite[0].transcription,
                        uri = soundbite[0].uri ,
                        soundbite_id = soundbite[0].post_id,
                        parameter_name = "no name",
                        time_slot = "MONTH",
                        counter = "0"
                    // user_id = soundbite[0].user_id;
                    console.log(CategoryName, type, transcription, uri, soundbite_id,time_slot,counter);
                    message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,counter,parameter_name,time_slot)
                  } else {
                    message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
                  }
                  MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                })
             }
      } else if (actionJSONPayload.actions[0].value.indexOf("ALL_TIME") != -1) {
        //soundbite[0].count = count
        if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
         console.log("NNNNNNNNNNNNNNNNNNNNNNNN");
         var temp = actionJSONPayload.actions[0].value.split('-')
         var length = temp.length
         var counter = temp[length - 1]
         var message;
         console.log(temp)
         var counter_num = parseInt(counter, 10)
         counter_num = ++counter_num
         var new_counter = counter_num.toString()
         console.log(counter_num);
         db.GetTop3UpvotedSoundBites(category_id)
           .then(function(soundbite) {
             console.log(soundbite.length)
             if (soundbite.length >= 2 && counter_num < 3) {
               var transcription = soundbite[counter_num].transcription,
                   uri = soundbite[counter_num].uri ,
                   soundbite_id = soundbite[counter_num].post_id,
               // user_id = soundbite[0].user_id;
               message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter)
             } else {
               message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
             }
             MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
           })
         } else if (actionJSONPayload.actions[0].value.indexOf("PREVIOUS") != -1) {
              console.log("pppppppppppppppppppppppppppppppppp");
              var temp = actionJSONPayload.actions[0].value.split('-')
              var length = temp.length
              var counter = temp[length - 1]
              var message;
              console.log(temp)
              var counter_num = parseInt(counter, 10)
              counter_num = --counter_num
              var new_counter = counter_num.toString()
              console.log("previous counter ",counter_num);
              db.GetTop3UpvotedSoundBites(category_id)
                .then(function(soundbite) {
                  console.log(soundbite)
                  if (soundbite.length >= 2 && counter_num < 3) {
                    var transcription = soundbite[counter_num].transcription,
                        uri = soundbite[counter_num].uri ,
                        soundbite_id = soundbite[counter_num].post_id,
                    // user_id = soundbite[0].user_id;
                    message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter)
                  } else {
                    message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
                  }
                  MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                })
              }else {
                var temp = actionJSONPayload.actions[0].value.split('-')
                var length = temp.length
                var message;
                console.log(temp)
                db.GetTop3UpvotedSoundBites(category_id)
                    .then(function(soundbite) {
                      console.log(soundbite)
                      if (soundbite.length > 0) {
                        var transcription = soundbite[0].transcription,
                            uri = soundbite[0].uri ,
                            soundbite_id = soundbite[0].post_id,
                            counter = "0"
                        // user_id = soundbite[0].user_id;
                        console.log(CategoryName, type, transcription, uri, soundbite_id,time_slot,counter);
                        message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,counter)
                      } else {
                        message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
                      }
                      MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                    })
           }
    }
    //  else if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
    //   console.log("NNNNNNNNNNNNNNNNNNNNNNNN");
    //   count = --count
    //   console.log(count);
    //   var temp = actionJSONPayload.actions[0].value.split('-')
    //   var length = temp.length
    //   var message;
    //   console.log(temp)
    //   var time = momentTime.getToday()
    //       t1 = time[0]
    //       t2 = time[1]
    //   console.log(t1,t2,"today");
    //   db.GetTop3SoundbitesForDate(t1,t2, category_id)
    //     .then(function(soundbite) {
    //       console.log(soundbite)
    //       if (soundbite.length > 0) {
    //         var transcription = soundbite[1].transcription,
    //             uri = soundbite[1].uri ,
    //             soundbite_id = soundbite[1].post_id
    //         // user_id = soundbite[0].user_id;
    //         message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id)
    //       } else {
    //         message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
    //       }
    //       MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
    //     })
    //   }
       else if (actionJSONPayload.actions[0].value.indexOf("UPVOTE_AUDIO") != -1) {
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var slack_user_id = User.id
        return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
          .then(function(result) {
            if (result.length > 0) {
              message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
              return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
            } else {
              return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "up")
                .then(function(result) {
                  console.log(result)
                  if (result.insertId) {
                    return db.UpvoteSoundbiteWP(temp[length - 1])
                  }
                })
                .then(function() {
                  message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
                  return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                })
            }

          })
      }
      // Downvote
      else if (actionJSONPayload.actions[0].value.indexOf("DOWNVOTE_AUDIO") != -1) {
        var temp = actionJSONPayload.actions[0].value.split('-')
        var length = temp.length
        var slack_user_id = User.id
        return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
          .then(function(result) {
            if (result.length > 0) {
              message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
              return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
            } else {
              return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "down")
                .then(function(result) {
                  console.log(result)
                  if (result.insertId) {
                    return db.DownvoteSoundbiteWP(temp[length - 1])
                  }
                })
                .then(function() {
                  message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
                  return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                })
            }

          })

       }
      //  else {
      //
      //   //  message = MessageTemplate.topThree(actionJSONPayload.actions[0].name)
      //   //  MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
      //   // var temp = actionJSONPayload.actions[0].value.split('-')
      //   // var length = temp.length
      //
      //   // var message;
      //   db.GetTop3SoundbitesForDate(t1,t2, category_id)
      //     .then(function(soundbite) {
      //       console.log(soundbite)
      //       if (soundbite.length > 0) {
      //         var transcription = soundbite[0].transcription,
      //             uri = soundbite[0].uri ,
      //             soundbite_id = soundbite[0].post_id
      //         // user_id = soundbite[0].user_id;
      //         message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id)
      //       } else {
      //         message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
      //       }
      //       MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
      //     })
      //
      // }

    } else {
      message = MessageTemplate.CategoryMessage(actionJSONPayload.actions[0].name)
      MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)

    }
    // console.log(message)
  }
  // //
  // else if (actionJSONPayload.actions[0].name == "Logistics") {
  //   var message, type;
  //   var CategoryName = actionJSONPayload.actions[0].name
  //   if (actionJSONPayload.actions[0].value.indexOf("POSITIVE") != -1) {
  //     type = "POSITIVE";
  //     if (actionJSONPayload.actions[0].value.indexOf("PREVIOUS") != -1) {
  //
  //     } else if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
  //       var temp = actionJSONPayload.actions[0].value.split('-')
  //       var length = temp.length
  //       db.GetNextSoundBite(temp[length - 1], 33, 'pos')
  //         .then(function(soundbite) {
  //           console.log(soundbite)
  //           if (soundbite.length > 0) {
  //             var transcription = soundbite[0].transcription,
  //              uri = soundbite[0].uri ,
  //               soundbite_id = soundbite[0].post_id;
  //             user_id = soundbite[0].user_id;
  //             message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id)
  //           } else {
  //             message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, type)
  //           }
  //           MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //         })
  //     } else if (actionJSONPayload.actions[0].value.indexOf("UPVOTE_AUDIO") != -1) {
  //       var temp = actionJSONPayload.actions[0].value.split('-')
  //       var length = temp.length
  //       var slack_user_id = User.id
  //       return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
  //         .then(function(result) {
  //           if (result.length > 0) {
  //             message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
  //             return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //           } else {
  //             return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], 1)
  //               .then(function(result) {
  //                 console.log(result)
  //                 if (result.insertId) {
  //                   return db.UpvoteSoundbiteWP(temp[length - 1])
  //                 }
  //               })
  //               .then(function() {
  //                 message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
  //                 return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //               })
  //           }
  //
  //         })
  //     }
  //     // Downvote
  //     else if (actionJSONPayload.actions[0].value.indexOf("DOWNVOTE_AUDIO") != -1) {
  //       var temp = actionJSONPayload.actions[0].value.split('-')
  //       var length = temp.length
  //       var slack_user_id = User.id
  //       return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
  //         .then(function(result) {
  //           if (result.length > 0) {
  //             message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
  //             return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //           } else {
  //             return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], 0)
  //               .then(function(result) {
  //                 console.log(result)
  //                 if (result.insertId) {
  //                   return db.DownvoteSoundbiteWP(temp[length - 1])
  //                 }
  //               })
  //               .then(function() {
  //                 message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
  //                 return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //               })
  //           }
  //
  //         })
  //
  //     } else if (actionJSONPayload.actions[0].value.indexOf("BACK_CATEGORY") != -1) {
  //       message = MessageTemplate.CategoryMessage(actionJSONPayload.actions[0].name)
  //       MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //     } else {
  //       db.GetSoundBite(33, 'pos')
  //         .then(function(soundbite) {
  //           console.log(soundbite)
  //           if (soundbite.length > 0) {
  //             var transcription = soundbite[0].transcription,
  //              uri = soundbite[0].uri ,
  //               soundbite_id = soundbite[0].post_id;
  //             user_id = soundbite[0].user_id;
  //             message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id)
  //           } else {
  //             message = MessageTemplate.NoSoundbiteErrorMessage(CategoryName, type)
  //           }
  //           MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //
  //         })
  //
  //     }
  //   } else if (actionJSONPayload.actions[0].value.indexOf("NEGATIVE") != -1) {
  //     type = "NEGATIVE";
  //     if (actionJSONPayload.actions[0].value.indexOf("PREVIOUS") != -1) {
  //
  //     } else if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
  //       var temp = actionJSONPayload.actions[0].value.split('-')
  //       var length = temp.length
  //       db.GetNextSoundBite(temp[length - 1], 33, 'neg')
  //         .then(function(soundbite) {
  //           console.log(soundbite)
  //           if (soundbite.length > 0) {
  //             var transcription = soundbite[0].transcription,
  //              uri = soundbite[0].uri ,
  //               soundbite_id = soundbite[0].post_id;
  //             user_id = soundbite[0].user_id;
  //             message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id)
  //           } else {
  //             message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, type)
  //           }
  //           MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //         })
  //     } else if (actionJSONPayload.actions[0].value.indexOf("UPVOTE_AUDIO") != -1) {
  //       var temp = actionJSONPayload.actions[0].value.split('-')
  //       var length = temp.length
  //       var slack_user_id = User.id
  //       return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
  //         .then(function(result) {
  //           if (result.length > 0) {
  //             message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
  //             return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //           } else {
  //             return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], 1)
  //               .then(function(result) {
  //                 console.log(result)
  //                 if (result.insertId) {
  //                   return db.UpvoteSoundbiteWP(temp[length - 1])
  //                 }
  //               })
  //               .then(function() {
  //                 message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
  //                 return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //               })
  //           }
  //
  //         })
  //     }
  //     // Downvote
  //     else if (actionJSONPayload.actions[0].value.indexOf("DOWNVOTE_AUDIO") != -1) {
  //       var temp = actionJSONPayload.actions[0].value.split('-')
  //       var length = temp.length
  //       var slack_user_id = User.id
  //       return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
  //         .then(function(result) {
  //           if (result.length > 0) {
  //             message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
  //             return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //           } else {
  //             return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], 0)
  //               .then(function(result) {
  //                 console.log(result)
  //                 if (result.insertId) {
  //                   return db.DownvoteSoundbiteWP(temp[length - 1])
  //                 }
  //               })
  //               .then(function() {
  //                 message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
  //                 return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //               })
  //           }
  //
  //         })
  //
  //     } else if (actionJSONPayload.actions[0].value.indexOf("BACK_CATEGORY") != -1) {
  //       message = MessageTemplate.CategoryMessage(actionJSONPayload.actions[0].name)
  //       MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //     } else {
  //       db.GetSoundBite(33, 'neg')
  //         .then(function(soundbite) {
  //           console.log(soundbite)
  //           if (soundbite.length > 0) {
  //             var transcription = soundbite[0].transcription,
  //              uri = soundbite[0].uri ,
  //               soundbite_id = soundbite[0].post_id;
  //             user_id = soundbite[0].user_id;
  //             message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id)
  //           } else {
  //             message = MessageTemplate.NoSoundbiteErrorMessage(CategoryName, type)
  //           }
  //           MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //
  //         })
  //
  //     }
  //   } else if (actionJSONPayload.actions[0].value.indexOf("NEUTRAL") != -1) {
  //     type = "NEUTRAL"
  //     // next
  //     if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
  //       console.log('\n\nhihihihihi\n\n')
  //       var temp = actionJSONPayload.actions[0].value.split('-')
  //       var length = temp.length
  //       db.GetNextSoundBite(temp[length - 1], 33, 'neutral')
  //         .then(function(soundbite) {
  //           console.log(soundbite.length)
  //           if (soundbite.length > 0) {
  //             var transcription = soundbite[0].transcription,
  //              uri = soundbite[0].uri,
  //               soundbite_id = soundbite[0].post_id
  //             console.log('soundbite_id')
  //             console.log(soundbite_id)
  //             // user_id = soundbite[0].user_id;
  //             message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id)
  //           } else {
  //             message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "NEUTRAL")
  //           }
  //           MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //
  //         })
  //     }
  //     // PREVIOUS
  //     else if (actionJSONPayload.actions[0].value.indexOf("PREVIOUS") != -1) {
  //
  //     }
  //     // Upvote
  //     else if (actionJSONPayload.actions[0].value.indexOf("UPVOTE_AUDIO") != -1) {
  //       console.log(actionJSONPayload.actions[0].value)
  //       var temp = actionJSONPayload.actions[0].value.split('-')
  //       var length = temp.length
  //       var slack_user_id = User.id
  //       return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
  //         .then(function(result) {
  //           if (result.length > 0) {
  //             message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
  //             return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //           } else {
  //             return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], 1)
  //               .then(function(result) {
  //                 console.log(result)
  //                 if (result.insertId) {
  //                   return db.UpvoteSoundbiteWP(temp[length - 1])
  //                 }
  //               })
  //               .then(function() {
  //                 message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
  //                 return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //               })
  //           }
  //
  //         })
  //     }
  //     // Downvote
  //     else if (actionJSONPayload.actions[0].value.indexOf("DOWNVOTE_AUDIO") != -1) {
  //       console.log(actionJSONPayload.actions[0].value)
  //       var temp = actionJSONPayload.actions[0].value.split('-')
  //       var length = temp.length
  //       var slack_user_id = User.id
  //       return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
  //         .then(function(result) {
  //           if (result.length > 0) {
  //             message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
  //             return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //           } else {
  //             return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], 0)
  //               .then(function(result) {
  //                 console.log(result)
  //                 if (result.insertId) {
  //                   return db.DownvoteSoundbiteWP(temp[length - 1])
  //                 }
  //               })
  //               .then(function() {
  //                 message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
  //                 return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //               })
  //           }
  //
  //         })
  //
  //     } else if (actionJSONPayload.actions[0].value.indexOf("BACK_CATEGORY") != -1) {
  //       message = MessageTemplate.CategoryMessage(actionJSONPayload.actions[0].name)
  //       MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //     } else {
  //       db.GetSoundBite(33, 'neutral')
  //         .then(function(soundbite) {
  //           console.log(soundbite)
  //           if (soundbite.length > 0) {
  //             var transcription = soundbite[0].transcription,
  //              uri = soundbite[0].uri ,
  //               soundbite_id = soundbite[0].post_id
  //             /*,
  //                             user_id = soundbite[0].user_id;*/
  //             message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id)
  //           } else {
  //             message = MessageTemplate.NoSoundbiteErrorMessage(CategoryName, "NEUTRAL")
  //           }
  //           MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //         })
  //     }
  //   } else if (actionJSONPayload.actions[0].value.indexOf("ALL") != -1) {
  //     type = "ALL"
  //     console.log("GetAllSoundBites")
  //     if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
  //       var temp = actionJSONPayload.actions[0].value.split('-')
  //       var length = temp.length
  //       var message;
  //       console.log(temp)
  //       db.GetNextSoundBite(temp[length - 1], 33)
  //         .then(function(soundbite) {
  //           console.log(soundbite)
  //           if (soundbite.length > 0) {
  //             var transcription = soundbite[0].transcription,
  //              uri = soundbite[0].uri ,
  //               soundbite_id = soundbite[0].post_id
  //             // user_id = soundbite[0].user_id;
  //             message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id)
  //           } else {
  //             message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
  //           }
  //           MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //         })
  //     } else {
  //       // var temp = actionJSONPayload.actions[0].value.split('-')
  //       // var length = temp.length
  //       var message;
  //       db.GetAllSoundBites(33)
  //         .then(function(soundbite) {
  //           console.log(soundbite)
  //           if (soundbite.length > 0) {
  //             var transcription = soundbite[0].transcription,
  //              uri = soundbite[0].uri ,
  //               soundbite_id = soundbite[0].post_id
  //             // user_id = soundbite[0].user_id;
  //             message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id)
  //             // console.log(message)
  //
  //           } else {
  //             message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "")
  //
  //           }
  //           console.log(message.attachments[0].actions)
  //           MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //
  //         })
  //     }
  //     // message = MessageTemplate.getStartedMessage
  //     // MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  //   } else if (actionJSONPayload.actions[0].value.indexOf("BACK_HOME") != -1) {
  //     message = MessageTemplate.getStartedMessage
  //   } else {
  //     message = MessageTemplate.CategoryMessage(actionJSONPayload.actions[0].name)
  //   }
  //   MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
  // }
  else if(actionJSONPayload.actions[0].name == "NoCategory"){
    CategoryName = "NoCategory",
    type = "keyword_specific";
    console.log("nocategory");
    var User = actionJSONPayload.user
    if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
      var temp = actionJSONPayload.actions[0].value.split('-')
      var length = temp.length
      var counter = temp[length - 2]
      var counter_num = parseInt(counter, 10)
      counter_num = ++counter_num
      var new_counter = counter_num.toString()
      console.log("this is new counter", new_counter);

        var request = require('request');

        var options = { method: 'POST',
          url: 'https://b2bslack.herokuapp.com/search',
          headers:
           { 'content-type': 'application/json' },
          body: { query: 'country' },
          json: true
        };

        request(options, function (error, response, body) {
          if (response){
            var asset_arr = response.body.asset_ids;
            var asset_str = asset_arr.toString().split(',');
            console.log(asset_str);
          }

      db.SearchContentId(asset_str)
        .then(function(soundbite) {
          console.log(soundbite)
          if (soundbite.length > 0) {
            var transcription = soundbite[new_counter].transcription,
                uri = soundbite[new_counter].uri ,
                soundbite_id = soundbite[new_counter].post_id,
                CategoryName = "NoCategory",
                type = "keyword_specific"

            var message =  MessageTemplate.TranscriptionMessage2(CategoryName, type, transcription, uri, soundbite_id,new_counter)

          } else {
            CategoryName = "NoCategory",
            type = "keyword_specific"
            message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, type)
          }
          MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
        })
      });
    }
    else if (actionJSONPayload.actions[0].value.indexOf("PREVIOUS") != -1) {
      var temp = actionJSONPayload.actions[0].value.split('-')
      var length = temp.length
      var counter = temp[length - 2 ]
      var counter_num = parseInt(counter, 10)
      counter_num = --counter_num
      var new_counter = counter_num.toString()
      console.log("this is new counter", new_counter);

        var request = require('request');

        var options = { method: 'POST',
          url: 'https://b2bslack.herokuapp.com/search',
          headers:
           { 'content-type': 'application/json' },
          body: { query: 'country' },
          json: true
        };

        request(options, function (error, response, body) {
          if (response){
            var asset_arr = response.body.asset_ids;
            var asset_str = asset_arr.toString().split(',');
            console.log(asset_str);
          }

      db.SearchContentId(asset_str)
        .then(function(soundbite) {
          console.log(soundbite)
          if (soundbite.length > 0) {
            var transcription = soundbite[new_counter].transcription,
                uri = soundbite[new_counter].uri ,
                soundbite_id = soundbite[new_counter].post_id,
                CategoryName = "NoCategory",
                type = "keyword_specific"

            var message =  MessageTemplate.TranscriptionMessage2(CategoryName, type, transcription, uri, soundbite_id,new_counter)

          } else {
            CategoryName = "NoCategory",
            type = "keyword_specific"
            message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, type)
          }
          MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
        })
      });
    }
    else if (actionJSONPayload.actions[0].value.indexOf("UPVOTE_AUDIO") != -1) {
      console.log("next");
      var temp = actionJSONPayload.actions[0].value.split('-')
      var length = temp.length
      var slack_user_id = User.id
      var counter = temp[length - 1]
      console.log("this is counter", counter)
      return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
        .then(function(result) {
          if (result.length > 0) {
            message = MessageTemplate.VoteExistMessage2(CategoryName, type, temp[length - 1])
            return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
          } else {
            return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "up")
              .then(function(result) {
                console.log(result)
                if (result.insertId) {
                  return db.UpvoteSoundbiteWP(temp[length - 1])
                }
              })
              .then(function() {
                message = MessageTemplate.VotePostMessage2(CategoryName, type, temp[length - 1])
                return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
              })
          }

        })
    } else if (actionJSONPayload.actions[0].value.indexOf("DOWNVOTE_AUDIO") != -1) {
      var temp = actionJSONPayload.actions[0].value.split('-')
      var length = temp.length
      var slack_user_id = User.id
      return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
        .then(function(result) {
          if (result.length > 0) {
            message = MessageTemplate.VoteExistMessage2(CategoryName, type, temp[length - 1])
            return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
          } else {
            return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "down")
              .then(function(result) {
                console.log(result)
                if (result.insertId) {
                  return db.DownvoteSoundbiteWP(temp[length - 1])
                }
              })
              .then(function() {
                message = MessageTemplate.VotePostMessage2(CategoryName, type, temp[length - 1])
                return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
              })
          }

        })

    } else if (actionJSONPayload.actions[0].value.indexOf("BACK_CATEGORY") != -1) {
      message = MessageTemplate.getStartedMessage
      MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
     } else {
       db.GetSoundBite(category_id, 'pos')
         .then(function(soundbite) {
           console.log(soundbite)
           if (soundbite.length > 0) {
             var transcription = soundbite[0].transcription,
                 uri = soundbite[0].uri ,
                 soundbite_id = soundbite[0].post_id,
                 CategoryName = "Positive";
             message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id)
           } else {
             message = MessageTemplate.NoSoundbiteErrorMessage(CategoryName, type)
           }
           MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)

         })

     }

  } else if(actionJSONPayload.actions[0].name == "No_Category"){

    type = "name_specific"
    console.log(type);
    var User = actionJSONPayload.user
    if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
      var temp = actionJSONPayload.actions[0].value.split('-')
      var length = temp.length
      var counter = temp[length - 1]
      var counter_num = parseInt(counter, 10)
      counter_num = ++counter_num
      var new_counter = counter_num.toString()
      db.GetNextSoundBiteByName(temp[length - 2], temp[length - 4])
        .then(function(soundbite) {
          console.log(soundbite)
          if (soundbite.length > 0) {
            var transcription = soundbite[0].transcription,
                uri = soundbite[0].uri ,
                soundbite_id = soundbite[0].post_id,
                CategoryName = "NoCategory",
                parameter_name = temp[length - 4]

            // user_id = soundbite[0].user_id;
            message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter, parameter_name)
          } else {
            CategoryName = "NoCategory",
            type = "name_specific"
            message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, type)
          }
          MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
        })
    } else if (actionJSONPayload.actions[0].value.indexOf("PREVIOUS") != -1) {
      var temp = actionJSONPayload.actions[0].value.split('-')
      var length = temp.length
      var counter = temp[length - 1]
      var counter_num = parseInt(counter, 10)
      counter_num = --counter_num
      var new_counter = counter_num.toString()
      db.GetPreviousSoundBiteByName(temp[length - 2], temp[length - 4])
        .then(function(soundbite) {
          console.log(soundbite)
          if (soundbite.length > 0) {
            var transcription = soundbite[0].transcription,
                uri = soundbite[0].uri ,
                soundbite_id = soundbite[0].post_id,
                CategoryName = "NoCategory",
                parameter_name = temp[length - 4]

            // user_id = soundbite[0].user_id;
            message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id,new_counter, parameter_name)
          } else {
            CategoryName = "NoCategory",
            type = "name_specific"
            message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, type)
          }
          MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
        })
    }
    else if (actionJSONPayload.actions[0].value.indexOf("UPVOTE_AUDIO") != -1) {
      console.log("next");
      var temp = actionJSONPayload.actions[0].value.split('-')
      var length = temp.length
      var slack_user_id = User.id
      return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
        .then(function(result) {
          if (result.length > 0) {
            message = MessageTemplate.VoteExistMessage2(CategoryName, type, temp[length - 1])
            return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
          } else {
            return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "up")
              .then(function(result) {
                console.log(result)
                if (result.insertId) {
                  return db.UpvoteSoundbiteWP(temp[length - 1])
                }
              })
              .then(function() {
                message = MessageTemplate.VotePostMessage2(CategoryName, type, temp[length - 1])
                return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
              })
          }

        })
    } else if (actionJSONPayload.actions[0].value.indexOf("DOWNVOTE_AUDIO") != -1) {
      var temp = actionJSONPayload.actions[0].value.split('-')
      var length = temp.length
      var slack_user_id = User.id
      return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
        .then(function(result) {
          if (result.length > 0) {
            message = MessageTemplate.VoteExistMessage2(CategoryName, type, temp[length - 1])
            return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
          } else {
            return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "down")
              .then(function(result) {
                console.log(result)
                if (result.insertId) {
                  return db.DownvoteSoundbiteWP(temp[length - 1])
                }
              })
              .then(function() {
                message = MessageTemplate.VotePostMessage2(CategoryName, type, temp[length - 1])
                return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
              })
          }

        })

    } else if (actionJSONPayload.actions[0].value.indexOf("BACK_CATEGORY") != -1) {
        message = MessageTemplate.getStartedMessage
        MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
     } else {
       db.GetSoundBite(category_id, 'pos')
         .then(function(soundbite) {
           console.log(soundbite)
           if (soundbite.length > 0) {
             var transcription = soundbite[0].transcription,
                 uri = soundbite[0].uri ,
                 soundbite_id = soundbite[0].post_id,
                 CategoryName = "Positive";
             message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id)
           } else {
             message = MessageTemplate.NoSoundbiteErrorMessage(CategoryName, type)
           }
           MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)

         })

     }

  } else if(actionJSONPayload.actions[0].name == "log_All"){
    type = "All"
    var User = actionJSONPayload.user
    if (actionJSONPayload.actions[0].value.indexOf("NEXT") != -1) {
      var temp = actionJSONPayload.actions[0].value.split('-')
      var length = temp.length
      var message;
      console.log(temp)
      db.GetNextSoundBite(temp[length - 1], 33)
        .then(function(soundbite) {
          console.log(soundbite)
          if (soundbite.length > 0) {
            var transcription = soundbite[0].transcription,
                uri = soundbite[0].uri ,
                soundbite_id = soundbite[0].post_id,
                CategoryName = "log_All"
            // user_id = soundbite[0].user_id;
            message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id)
          } else {
            message = MessageTemplate.NoMoreSoundbiteErrorMessage(CategoryName, "Logistics Category")
          }
          MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
        })
     }  else if (actionJSONPayload.actions[0].value.indexOf("UPVOTE_AUDIO") != -1) {
           var temp = actionJSONPayload.actions[0].value.split('-')
           var length = temp.length
           var slack_user_id = User.id
           return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
             .then(function(result) {
               if (result.length > 0) {
                 message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
                 return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
               } else {
                 return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "up")
                   .then(function(result) {
                     console.log(result)
                     if (result.insertId) {
                       return db.UpvoteSoundbiteWP(temp[length - 1])
                     }
                   })
                   .then(function() {
                     message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
                     return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                   })
               }

             })
         }  else if (actionJSONPayload.actions[0].value.indexOf("DOWNVOTE_AUDIO") != -1) {

             var temp = actionJSONPayload.actions[0].value.split('-')
             var length = temp.length
             var slack_user_id = User.id
             return db.CheckVoteSoundbiteWP(slack_user_id, temp[length - 1])
               .then(function(result) {
                 if (result.length > 0) {
                   message = MessageTemplate.VoteExistMessage(CategoryName, type, temp[length - 1])
                   return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                 } else {
                   return db.VoteSoundBiteWP(slack_user_id, temp[length - 1], "down")
                     .then(function(result) {
                       console.log(result)
                       if (result.insertId) {
                         return db.DownvoteSoundbiteWP(temp[length - 1])
                       }
                     })
                     .then(function() {
                       message = MessageTemplate.VotePostMessage(CategoryName, type, temp[length - 1])
                       return MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
                     })
                 }

               })

         }  else if (actionJSONPayload.actions[0].value.indexOf("BACK_CATEGORY") != -1) {
            message = MessageTemplate.CategoryMessage("Logistics")
            MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
          } else {
            db.GetSoundBite(category_id, 'pos')
              .then(function(soundbite) {
                console.log(soundbite)
                if (soundbite.length > 0) {
                  var transcription = soundbite[0].transcription,
                      uri = soundbite[0].uri ,
                      soundbite_id = soundbite[0].post_id,
                      CategoryName = "log_All";
                  message = MessageTemplate.TranscriptionMessage(CategoryName, type, transcription, uri, soundbite_id)
                } else {
                  message = MessageTemplate.NoSoundbiteErrorMessage(CategoryName, type)
                }
                MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)

              })

          }

    } else {
      //bot.reply("No soundbites for" + actionJSONPayload.actions[0].name + "category");
      message = MessageTemplate.noSoundMsg(actionJSONPayload.actions[0].name, 'Logistics')
      MessageTemplate.sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
    }

}
