var request = require('request')

exports.getStartedMessage = {
  "text": "Hi.\nWelcome to B2B Soundbites\nYou can listen to soundbites from experts or you can record your own soundbite.",
  "attachments": [{
      "text": "Please select an category",
      "fallback": "You are unable to choose a category",
      "callback_id": "button_tutorial",
      "color": "#3AA3E3",
      "attachment_type": "default",
      "actions": [{
          "name": "Logistics",
          "text": "Logistics",
          "type": "button",
          "value": "Logistics"
        },
        {
          "name": "Cloud Services",
          "text": "Cloud Services",
          "type": "button",
          "value": "Cloud Services"
        },
        {
          "name": "Data Analytics",
          "text": "Data Analytics",
          "type": "button",
          "value": "Data Analytics"
        },
        {
          "name": "Data Centers",
          "text": "Data Centers",
          "type": "button",
          "value": "Data Centers"
        },
        {
          "name": "Information Technology",
          "text": "Information Technology",
          "type": "button",
          "value": "Information Technology"
        }
      ]
    },
    {
      "text": "Use `/record +1234567890` to start recording your soundbites.",
      "mrkdwn_in": ["text"]
    }
  ]
}

exports.promptPhone = {
  "text": "A message has been sent to your phone number with the details on how to start recording soundbites.",
  "attachments": [{
    "text": "Please select an category",
    "fallback": "You are unable to choose a category",
    "callback_id": "button_tutorial",
    "color": "#3AA3E3",
    "attachment_type": "default",
      "actions": [{
          "name": "Logistics",
          "text": "Logistics",
          "type": "button",
          "value": "Logistics"
        },
        {
          "name": "Cloud Services",
          "text": "Cloud Services",
          "type": "button",
          "value": "Cloud Services"
        },
        {
          "name": "Data Analytics",
          "text": "Data Analytics",
          "type": "button",
          "value": "Data Analytics"
        },
        {
          "name": "Data Centers",
          "text": "Data Centers",
          "type": "button",
          "value": "Data Centers"
        },
        {
          "name": "Information Technology",
          "text": "Information Technology",
          "type": "button",
          "value": "Information Technology"
        }
      ]  }]
}


exports.noSoundMsg = function(category, ActionName) {
  var message = {
    "text": "No soundbites for " + category + " category",
    "attachments": [{
      "text": "Click Back button to go back.",
      "fallback": "You are unable to choose a category",
      "callback_id": "category",
      "color": "#3AA3E3",
      "attachment_type": "default",
      "actions": [{
        "name": ActionName,
        "text": ":arrow_left: Back",
        "type": "button",
        "value": "BACK_HOME-" + ActionName
      }]
    }]

  }
  return message;
}

exports.getStartedMessageD = function() {
  var message = {
    "text": "Hi.\nWelcome to B2B Soundbites\n",
    "attachments": [{
      "text": "Please select your category",
      "fallback": "You are unable to choose a category",
      "callback_id": "button_tutorial",
      "color": "#3AA3E3",
      "attachment_type": "default",
      "actions": [{
          "name": "Logistics",
          "text": "Logistics",
          "type": "button",
          "value": "Logistics"
        },
        {
          "name": "Education",
          "text": "Education",
          "type": "button",
          "value": "Education"
        }
      ]
    }]
  }
  return message;
}

exports.topThree = function(ActionName) {
  var message = {
    "text": "Top three soundbites",
    "attachments": [{
      "text": "Choose one of the following options",
      "fallback": "You are unable to choose a category",
      "callback_id": "button_tutorial",
      "color": "#3AA3E3",
      "attachment_type": "default",
      "actions": [{
          "name": ActionName,
          "text": ":arrow_forward: Today",
          "type": "button",
          "value": "TOP_3_UPVOTED_AUDIO-TODAY"
        },
        {
          "name": ActionName,
          "text": ":arrow_forward: Week",
          "type": "button",
          "value": "TOP_3_UPVOTED_AUDIO-WEEK"
        },
        {
          "name": ActionName,
          "text": ":arrow_forward: Month",
          "type": "button",
          "value": "TOP_3_UPVOTED_AUDIO-MONTH"
        },
        {
          "name": ActionName,
          "text": ":arrow_forward: All Time",
          "type": "button",
          "value": "TOP_3_UPVOTED_AUDIO-ALL_TIME"
        }]
    }, {
      "text": "You can click on Back button to go back to previous menu. " + ActionName,
      "fallback": "You are unable to choose a category",
      "callback_id": "category",
      "color": "#3AA3E3",
      "attachment_type": "default",
      "actions": [{
        "name": ActionName,
        "text": ":arrow_left: Back",
        "type": "button",
        "value": "Logistics"
      }]
    }]
  }
  return message;
}

exports.CategoryMessage = function(ActionName) {
  var message = {
    "text": "Wow " + ActionName + " !! :+1:\n ",
    "attachments": [{
      "text": "Tap  \"Positive\" to play sentimentally positive audio\n Or tap \"Negative\" to play sentimentally negative audio \n Or tap \"Neutral\" to play sentimentally neutral audio \n Or Tap \"All\" to play all audio in " + ActionName,
      "fallback": "You are unable to choose a category",
      "callback_id": "category",
      "color": "#3AA3E3",
      "attachment_type": "default",
      "actions": [{
        "name": ActionName,
        "text": ":arrow_forward: Positive",
        "type": "button",
        "value": "POSITIVE"
      }, {
        "name": ActionName,
        "text": ":arrow_forward: Negative",
        "type": "button",
        "value": "NEGATIVE"
      }, {
        "name": ActionName,
        "text": ":arrow_forward: Neutral",
        "type": "button",
        "value": "NEUTRAL"
      }, {
        "name": ActionName,
        "text": ":arrow_forward: All",
        "type": "button",
        "value": "ALL"
      }, {
        "name": ActionName,
        "text": ":arrow_forward: Top 3 Upvoted",
        "type": "button",
        "value": "TOP_3_UPVOTED_AUDIO"
      }]
    }, {
      "text": "You can click on Back button to go back to previous menu. " + ActionName,
      "fallback": "You are unable to choose a category",
      "callback_id": "category",
      "color": "#3AA3E3",
      "attachment_type": "default",
      "actions": [{
        "name": ActionName,
        "text": ":arrow_left: Back",
        "type": "button",
        "value": "BACK_HOME-" + ActionName
      }]
    }]
  }
  return message;
}

exports.TranscriptionMessage2 = function(CategoryName, type, transcription, uri, soundbite_id,counter,keyword) {
  console.log(CategoryName, type, transcription, uri, soundbite_id,counter,keyword)
  if(counter == "0" ){

    var message = {
      "attachments": [{
        "fallback": "ReferenceError ",
        "text": "Here is the transcription for the audio:\n\t\"" + transcription + "\" \n\t<" + uri + "|Click here to play the audio>",
        "callback_id": "category",
        "actions": [{
          "name": CategoryName,
          "text": ":+1: Upvote",
          "type": "button",
          "value": "UPVOTE_AUDIO-" + type + '-' + soundbite_id + '-' + counter
        }, {
          "name": CategoryName,
          "text": ":-1: Downvote",
          "type": "button",
          "value": "DOWNVOTE_AUDIO-" + type + '-' + soundbite_id
        },{
          "name": CategoryName,
          "text": ":black_right_pointing_double_triangle_with_vertical_bar: Next",
          "type": "button",
          "value": "NEXT-" + type + '-' + soundbite_id + '-' + counter + '-' + keyword
        }]
      }, {
        "text": "You can click on Back button to go back to previous menu. ",
        "fallback": "You are unable to choose a category",
        "callback_id": "category",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": [{
          "name": CategoryName,
          "text": ":arrow_left: Back",
          "type": "button",
          "value": "BACK_CATEGORY"
        }]
      }]
    }
    console.log(message.attachments[0].actions)
  } else {
    console.log("this is a counter", counter);
    var message = {
      "attachments": [{
        "fallback": "ReferenceError ",
        "text": "Here is the transcription for the audio:\n\t\"" + transcription + "\" \n\t<" + uri + "|Click here to play the audio>",
        "callback_id": "category",
        "actions": [{
          "name": CategoryName,
          "text": ":+1: Upvote",
          "type": "button",
          "value": "UPVOTE_AUDIO-" + type + '-' + soundbite_id + '-' + counter
        }, {
          "name": CategoryName,
          "text": ":-1: Downvote",
          "type": "button",
          "value": "DOWNVOTE_AUDIO-" + type + '-' + soundbite_id
        }, {
          "name": CategoryName,
          "text": ":black_left_pointing_double_triangle_with_vertical_bar: Previous",
          "type": "button",
          "value": "PREVIOUS-" + type + '-' + soundbite_id + '-' + counter + '-' + keyword
        },{
          "name": CategoryName,
          "text": ":black_right_pointing_double_triangle_with_vertical_bar: Next",
          "type": "button",
          "value": "NEXT-" + type + '-' + soundbite_id + '-' + counter + '-' + keyword
        }]
      }, {
        "text": "You can click on Back button to go back to previous menu. ",
        "fallback": "You are unable to choose a category",
        "callback_id": "category",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": [{
          "name": CategoryName,
          "text": ":arrow_left: Back",
          "type": "button",
          "value": "BACK_CATEGORY"
        }]
      }]
    }
  }
  return message;
}

exports.TranscriptionMessage3 = function(CategoryName, type, transcription, uri, soundbite_id,parameter_name) {
  console.log("search by expert name",CategoryName, type, transcription, uri, soundbite_id,counter,keyword)

    var message = {
      "attachments": [{
        "fallback": "ReferenceError ",
        "text": "Here is the transcription for the audio:\n\t\"" + transcription + "\" \n\t<" + uri + "|Click here to play the audio>",
        "callback_id": "category",
        "actions": [{
          "name": CategoryName,
          "text": ":+1: Upvote",
          "type": "button",
          "value": "UPVOTE_AUDIO-" + parameter_name + '-' + type + '-' + soundbite_id
        }, {
          "name": CategoryName,
          "text": ":-1: Downvote",
          "type": "button",
          "value": "DOWNVOTE_AUDIO-" + parameter_name + '-' + type + '-' + soundbite_id
        },{
          "name": CategoryName,
          "text": ":black_right_pointing_double_triangle_with_vertical_bar: Next",
          "type": "button",
          "value": "NEXT-" + parameter_name + '-' + type + '-' + soundbite_id
        }]
      }, {
        "text": "You can click on Back button to go back to previous menu. ",
        "fallback": "You are unable to choose a category",
        "callback_id": "category",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": [{
          "name": CategoryName,
          "text": ":arrow_left: Back",
          "type": "button",
          "value": "BACK_CATEGORY"
        }]
      }]
    }
  return message;
}

exports.TranscriptionMessage = function(CategoryName, type, transcription, uri, soundbite_id,counter, parameter_name,time_slot) {
  console.log(CategoryName, type, transcription, uri, soundbite_id, parameter_name,counter,time_slot)
  if ( type  == "name_specific" && counter == "0") {
    var message = {
      "attachments": [{
        "fallback": "ReferenceError ",
        "text": "Here is the transcription for the audio:\n\t\"" + transcription + "\" \n\t<" + uri + "|Click here to play the audio>",
        "callback_id": "category",
        "actions": [{
          "name": CategoryName,
          "text": ":+1: Upvote",
          "type": "button",
          "value": "UPVOTE_AUDIO-" + parameter_name + '-' + type + '-' + soundbite_id
        }, {
          "name": CategoryName,
          "text": ":-1: Downvote",
          "type": "button",
          "value": "DOWNVOTE_AUDIO-" + parameter_name + '-' + type + '-' + soundbite_id
        }, {
          "name": CategoryName,
          "text": ":black_right_pointing_double_triangle_with_vertical_bar: Next",
          "type": "button",
          "value": "NEXT-" + parameter_name + '-' + type + '-' + soundbite_id + '-' + counter
        }]
      }, {
        "text": "You can click on Back button to go back to previous menu. ",
        "fallback": "You are unable to choose a category",
        "callback_id": "category",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": [{
          "name": CategoryName,
          "text": ":arrow_left: Back",
          "type": "button",
          "value": "BACK_CATEGORY"
        }]
      }]
    }
  } else if ( type  == "name_specific" && counter !== "0") {
      var message = {
        "attachments": [{
          "fallback": "ReferenceError ",
          "text": "Here is the transcription for the audio:\n\t\"" + transcription + "\" \n\t<" + uri + "|Click here to play the audio>",
          "callback_id": "category",
          "actions": [{
            "name": CategoryName,
            "text": ":+1: Upvote",
            "type": "button",
            "value": "UPVOTE_AUDIO-" + parameter_name + '-' + type + '-' + soundbite_id
          }, {
            "name": CategoryName,
            "text": ":-1: Downvote",
            "type": "button",
            "value": "DOWNVOTE_AUDIO-" + parameter_name + '-' + type + '-' + soundbite_id
          }, {
            "name": CategoryName,
            "text": ":black_left_pointing_double_triangle_with_vertical_bar: Previous",
            "type": "button",
            "value": "PREVIOUS-" + parameter_name + '-' + type + '-' + soundbite_id + '-' + counter
          }, {
            "name": CategoryName,
            "text": ":black_right_pointing_double_triangle_with_vertical_bar: Next",
            "type": "button",
            "value": "NEXT-" + parameter_name + '-' + type + '-' + soundbite_id + '-' + counter
          }]
        }, {
          "text": "You can click on Back button to go back to previous menu. ",
          "fallback": "You are unable to choose a category",
          "callback_id": "category",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [{
            "name": CategoryName,
            "text": ":arrow_left: Back",
            "type": "button",
            "value": "BACK_CATEGORY"
          }]
        }]
      }
    }
   else if (counter=="0" && time_slot=="no time") {
      console.log("counter is " + counter);
      console.log("no previous");
      var message = {
        "attachments": [{
          "fallback": "ReferenceError ",
          "text": "Here is the transcription for the audio:\n\t\"" + transcription + "\" \n\t<" + uri + "|Click here to play the audio>",
          "callback_id": "category",
          "actions": [{
            "name": CategoryName,
            "text": ":+1: Upvote",
            "type": "button",
            "value": "UPVOTE_AUDIO-" + time_slot + '-' + type + '-' + soundbite_id + '-' + counter
          }, {
            "name": CategoryName,
            "text": ":-1: Downvote",
            "type": "button",
            "value": "DOWNVOTE_AUDIO-" + time_slot + '-' + type + '-' + soundbite_id + '-' + counter
          },{
            "name": CategoryName,
            "text": ":black_right_pointing_double_triangle_with_vertical_bar: Next",
            "type": "button",
            "value": "NEXT-" + time_slot + '-' + type + '-' + soundbite_id + '-' + counter
          }]
        }, {
          "text": "You can click on Back button to go back to previous menu. ",
          "fallback": "You are unable to choose a category",
          "callback_id": "category",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [{
            "name": CategoryName,
            "text": ":arrow_left: Back",
            "type": "button",
            "value": "BACK_CATEGORY"
          }]
        }]
      }
    } else if (counter=="0") {
      console.log("counter is " + counter);
      console.log("no previous");
      var message = {
        "attachments": [{
          "fallback": "ReferenceError ",
          "text": "Here is the transcription for the audio:\n\t\"" + transcription + "\" \n\t<" + uri + "|Click here to play the audio>",
          "callback_id": "category",
          "actions": [{
            "name": CategoryName,
            "text": ":+1: Upvote",
            "type": "button",
            "value": "UPVOTE_AUDIO-" + time_slot + '-' + type + '-' + soundbite_id + '-' + counter
          }, {
            "name": CategoryName,
            "text": ":-1: Downvote",
            "type": "button",
            "value": "DOWNVOTE_AUDIO-" + time_slot + '-' + type + '-' + soundbite_id + '-' + counter
          },{
            "name": CategoryName,
            "text": ":black_right_pointing_double_triangle_with_vertical_bar: Next",
            "type": "button",
            "value": "NEXT-" + time_slot + '-' + type + '-' + soundbite_id + '-' + counter
          }]
        }, {
          "text": "You can click on Back button to go back to previous menu. ",
          "fallback": "You are unable to choose a category",
          "callback_id": "category",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [{
            "name": CategoryName,
            "text": ":arrow_left: Back",
            "type": "button",
            "value": "TOP_3_UPVOTED_AUDIO"
          }]
        }]
      }
    } else if (!counter=="0" && time_slot=="no time") {
        console.log("counter is " + counter);
        var message = {
          "attachments": [{
            "fallback": "ReferenceError ",
            "text": "Here is the transcription for the audio:\n\t\"" + transcription + "\" \n\t<" + uri + "|Click here to play the audio>",
            "callback_id": "category",
            "actions": [{
              "name": CategoryName,
              "text": ":+1: Upvote",
              "type": "button",
              "value": "UPVOTE_AUDIO-" + time_slot + '-' + type + '-' + soundbite_id + '-' + counter
            }, {
              "name": CategoryName,
              "text": ":-1: Downvote",
              "type": "button",
              "value": "DOWNVOTE_AUDIO-" + time_slot + '-' + type + '-' + soundbite_id + '-' + counter
            }, {
              "name": CategoryName,
              "text": ":black_left_pointing_double_triangle_with_vertical_bar: Previous",
              "type": "button",
              "value": "PREVIOUS-"+ time_slot + '-' + type + '-' + soundbite_id + '-' + counter
            }, {
              "name": CategoryName,
              "text": ":black_right_pointing_double_triangle_with_vertical_bar: Next",
              "type": "button",
              "value": "NEXT-" + time_slot + '-' + type + '-' + soundbite_id + '-' + counter
            }]
          }, {
            "text": "You can click on Back button to go back to previous menu. ",
            "fallback": "You are unable to choose a category",
            "callback_id": "category",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [{
              "name": CategoryName,
              "text": ":arrow_left: Back",
              "type": "button",
              "value": "BACK_CATEGORY"
            }]
          }]
        }
      } else if (!counter=="0") {
        console.log("counter is " + counter);
        var message = {
          "attachments": [{
            "fallback": "ReferenceError ",
            "text": "Here is the transcription for the audio:\n\t\"" + transcription + "\" \n\t<" + uri + "|Click here to play the audio>",
            "callback_id": "category",
            "actions": [{
              "name": CategoryName,
              "text": ":+1: Upvote",
              "type": "button",
              "value": "UPVOTE_AUDIO-" + time_slot + '-' + type + '-' + soundbite_id + '-' + counter
            }, {
              "name": CategoryName,
              "text": ":-1: Downvote",
              "type": "button",
              "value": "DOWNVOTE_AUDIO-" + time_slot + '-' + type + '-' + soundbite_id + '-' + counter
            }, {
              "name": CategoryName,
              "text": ":black_left_pointing_double_triangle_with_vertical_bar: Previous",
              "type": "button",
              "value": "PREVIOUS-"+ time_slot + '-' + type + '-' + soundbite_id + '-' + counter
            }, {
              "name": CategoryName,
              "text": ":black_right_pointing_double_triangle_with_vertical_bar: Next",
              "type": "button",
              "value": "NEXT-" + time_slot + '-' + type + '-' + soundbite_id + '-' + counter
            }]
          }, {
            "text": "You can click on Back button to go back to previous menu. ",
            "fallback": "You are unable to choose a category",
            "callback_id": "category",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [{
              "name": CategoryName,
              "text": ":arrow_left: Back",
              "type": "button",
              "value": "TOP_3_UPVOTED_AUDIO"
            }]
          }]
        }
      } else {
          console.log("counter is " + counter);
          var message = {
            "attachments": [{
              "fallback": "ReferenceError ",
              "text": "Here is the transcription for the audio:\n\t\"" + transcription + "\" \n\t<" + uri + "|Click here to play the audio>",
              "callback_id": "category",
              "actions": [{
                "name": CategoryName,
                "text": ":+1: Upvote",
                "type": "button",
                "value": "UPVOTE_AUDIO-" + type + '-' + soundbite_id
              }, {
                "name": CategoryName,
                "text": ":-1: Downvote",
                "type": "button",
                "value": "DOWNVOTE_AUDIO-" + type + '-' + soundbite_id
              }, {
                "name": CategoryName,
                "text": ":black_left_pointing_double_triangle_with_vertical_bar: Previous",
                "type": "button",
                "value": "PREVIOUS-" + type + '-' + soundbite_id + '-' + counter
              }, {
                "name": CategoryName,
                "text": ":black_right_pointing_double_triangle_with_vertical_bar: Next",
                "type": "button",
                "value": "NEXT-" + type + '-' + soundbite_id + '-' + counter
              }, {
                "name": CategoryName,
                "text": ":arrow_left: Back",
                "type": "button",
                "value": "BACK_CATEGORY"
              }],
              "color": "#F35A00"
            }]
          }
  }
  return message;
}

exports.VotePostMessage = function(CategoryName, type, soundbite_id) {
  console.log(CategoryName, type, soundbite_id)
  var message = {
    "attachments": [{
      "fallback": "ReferenceError ",
      "text": "Your vote has been saved successfully.",
      "callback_id": "category",
      "actions": [{
        "name": CategoryName,
        "text": ":black_right_pointing_double_triangle_with_vertical_bar: Next",
        "type": "button",
        "value": "NEXT-" + type + '-' + soundbite_id
      }, {
        "name": CategoryName,
        "text": ":arrow_left: Back",
        "type": "button",
        "value": "Back-Category"
      }],
      "color": "#F35A00"
    }]
  }
  return message;
}

exports.VotePostMessage2 = function(CategoryName, type, soundbite_id) {
  console.log(CategoryName, type, soundbite_id)
  var message = {
    "attachments": [{
      "fallback": "ReferenceError ",
      "text": "Your vote has been saved successfully.",
      "callback_id": "category",
      "actions": [{
        "name": CategoryName,
        "text": ":black_right_pointing_double_triangle_with_vertical_bar: Next",
        "type": "button",
        "value": "NEXT-" + type + '-' + soundbite_id
      }, {
        "name": CategoryName,
        "text": ":arrow_left: Back",
        "type": "button",
        "value": "BACK_CATEGORY"
      }],
      "color": "#F35A00"
    }]
  }
  return message;
}

exports.VoteExistMessage = function(CategoryName, type, soundbite_id) {
  console.log(CategoryName, type, soundbite_id)
  var message = {
    "attachments": [{
      "fallback": "ReferenceError ",
      "text": "You have already voted for this soundbite!",
      "callback_id": "category",
      "actions": [{
        "name": CategoryName,
        "text": ":black_right_pointing_double_triangle_with_vertical_bar: Next",
        "type": "button",
        "value": "NEXT-" + type + '-' + soundbite_id
      }, {
        "name": CategoryName,
        "text": ":arrow_left: Back",
        "type": "button",
        "value": "Back-Category"
      }],
      "color": "#F35A00"
    }]
  }
  return message;
}

exports.VoteExistMessage2 = function(CategoryName, type, soundbite_id) {
  console.log(CategoryName, type, soundbite_id)
  var message = {
    "attachments": [{
      "fallback": "ReferenceError ",
      "text": "You have already voted for this soundbite!",
      "callback_id": "category",
      "actions": [{
        "name": CategoryName,
        "text": ":black_right_pointing_double_triangle_with_vertical_bar: Next",
        "type": "button",
        "value": "NEXT-" + type + '-' + soundbite_id
      }, {
        "name": CategoryName,
        "text": ":arrow_left: Back",
        "type": "button",
        "value": "BACK_CATEGORY"
      }],
      "color": "#F35A00"
    }]
  }
  return message;
}


exports.NoSoundbiteErrorMessage = function(CategoryName, Type) {
  var message = {
    "attachments": [{
      "fallback": "ReferenceError",
      "text": "I'm sorry. There are no " + Type + " audio in " + CategoryName,
      "callback_id": "category",
      "actions": [{
        "name": CategoryName,
        "text": ":arrow_left: Back",
        "type": "button",
        "value": "Back"
      }],
      "color": "#F35A00"
    }]
  }
  return message;
}

exports.NoMoreSoundbiteNoTypeErrorMessage = function(CategoryName) {
  var message = {
    "attachments": [{
      "fallback": "ReferenceError",
      "text": "I'm sorry. There are no more audios in " + CategoryName,
      "callback_id": "category",
      "actions": [{
        "name": CategoryName,
        "text": ":arrow_left: Back",
        "type": "button",
        "value": "Back"
      }],
      "color": "#F35A00"
    }]
  }
  return message;
}


exports.NoMoreSoundbiteErrorMessage = function(CategoryName, Type) {
  var tempText;
  if (Type !== "") {
    tempText = "I'm sorry. There are no more " + Type + " audios in " + CategoryName
  } else {
    tempText = "I'm sorry. There are no more audios in " + CategoryName
  }
  var message = {
    "attachments": [{
      "fallback": "ReferenceError",
      "text": tempText,
      "callback_id": "category",
      "actions": [{
        "name": CategoryName,
        "text": ":arrow_left: Back",
        "type": "button",
        "value": "Back"
      }],
      "color": "#F35A00"
    }]
  }
  return message;
}




exports.message = {
  "text": "logistics",
  "replace_original": false
}


exports.sendMessageToSlackResponseURL = function(responseURL, JSONmessage) {
  var postOptions = {
    uri: responseURL,
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    json: JSONmessage
  }
  request(postOptions, (error, response, body) => {
    if (error) {
      // handle errors as you see fit
    }
  })
}


// var message = {
//     "text": actionJSONPayload.user.name+" clicked: "+actionJSONPayload.actions[0].name,
//     "replace_original": true
// }
