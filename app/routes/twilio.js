const accountSid = 'AC310036f39b6beced1842554c59f6ec53';
const authToken = '7ddeee8b7568b865cefa97b8ca5957bc';

// require the Twilio module and create a REST client
const client = require('twilio')(accountSid, authToken);


exports.sendMessageToClient = function(to, from, body) {
  console.log(to, from, body)
  return client.messages.create({
      to: to,
      from: from,
      body: body
    })
    // .then(message => console.log(message.sid));
}
