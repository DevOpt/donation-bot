/* Donation bot description */

// npm packages
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const token = process.env.FB_VERIFY_TOKEN
const access = process.env.FB_ACCESS_TOKEN

app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', function(req, res){
  res.send('Hello World!!')
})

// Verify the Facebook page token
app.get('/webhook/', function(req, res){
  if(req.query['hub.verify_token'] === token) {
      res.send(req.query['hub.challenge'])
  }
  res.send('Failed to verify token!')
})

// Set up the server
app.listen(app.get('port'), function(){
  console.log('Running on port', app.get('port'))
})

// Creates the endpoint for our webhook
app.post('/webhook/', function (req, res) {

    // Get the body of the event webhook
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]

      // Get the sender ID
      let sender = event.sender.id

      // Check if the event is message or postback
      if (event.message) {
        handleMessage(sender, event.message);
        console.log(event.message);
      } else if (event.postback) {
        handlePostback(sender, event.postback)
      }

    }
    res.sendStatus(200)
})

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:access},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

// List of charity organizations
function orgList(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "International Rescue Committee",
                    "subtitle": "The International Rescue Committee (IRC) responds to the world's worst humanitarian crises and helps people to survive and rebuild their lives.",
                    "image_url": "https://4.bp.blogspot.com/-55VVyrI5s-E/WH3fXzc55zI/AAAAAAAAAHk/g0IurhuHLmE8IRiaNIZQ77rvJeTNfuZWQCLcB/s400/irc.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://help.rescue.org/donate",
                        "title": "Donate"
                    }],
                }, {
                    "title": "Islamic Relief",
                    "subtitle": "Islamic Relief is a charity organised under UK law that serves as catalyst and coordinator for many relief projects around the globe",
                    "image_url": "https://www.islamic-relief.org/wp-content/uploads/2014/06/irw-post-img-605x340.jpg",
                    "buttons": [{
                      "type": "postback",
                      "title": "Postback",
                      "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:access},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

// Donation order confirmation
function orderConfirmation(sender){
  messageData = {
    "attachment": {
        "type": "template",
        "payload": {
          "template_type": "receipt",
          "recipient_name": "Mark Zuckerberg",
          "order_number": "12345678901",
          "currency": "USD",
          "payment_method": "Visa 2345",
          "order_url": "https://rockets.chatfuel.com/store?order_id=12345678901",
          "timestamp": "1428444666",
          "address": {
            "street_1": "1 Hacker Way",
            "street_2": "",
            "city": "Menlo Park",
            "postal_code": "94025",
            "state": "CA",
            "country": "US"
          },
          "summary": {
            "subtotal": 105,
            "shipping_cost": 4.95,
            "total_tax": 9,
            "total_cost": 118.95
          },
          "adjustments": [
            {
              "name": "CF Rockets Superstar",
              "amount": -25
            }
          ],
          "elements": [
            {
              "title": "Chatfuel Rockets Jersey",
              "subtitle": "Size: M",
              "quantity": 1,
              "price": 65,
              "currency": "USD",
              "image_url":   "http://rockets.chatfuel.com/assets/shirt.jpg"
            },
            {
              "title": "Chatfuel Rockets Jersey",
              "subtitle": "Size: L",
              "quantity": 1,
              "price": 65,
              "currency": "USD",
              "image_url": "http://rockets.chatfuel.com/assets/shirt.jpg"
            }
          ]
        }
      }
  }
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:access},
      method: 'POST',
      json: {
          recipient: {id:sender},
          message: messageData,
      }
  }, function(error, response, body) {
      if (error) {
          console.log('Error sending messages: ', error)
      } else if (response.body.error) {
          console.log('Error: ', response.body.error)
      }
  })
}

// Loop
function loop(sender){
  messageData = {
      "text":  "Would you like to make another payment?",
      "quick_replies":[
        {
          "content_type":"text",
          "title":"Search",
          "payload":"post"
        },
        {
          "content_type":"location"
        }
    ]
  }
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:access},
      method: 'POST',
      json: {
          recipient: {id:sender},
          message: messageData,
      }
  }, function(error, response, body) {
      if (error) {
          console.log('Error sending messages: ', error)
      } else if (response.body.error) {
          console.log('Error: ', response.body.error)
      }
  })
}

// Handles conversations
function chat(sender, text){
  let messageData = { text:text }

  if (text === 'Help') {
    messageData = {
        "text":  "How can I help you today?",
        "quick_replies":[
          {
            "content_type":"text",
            "title":"Donate",
            "payload":"donate"
          },
          {
            "content_type":"text",
            "title":"Learn more",
            "payload":"learn-more"
          }
      ]
    }

  } else if (text === 'Donate') {
    sendTextMessage(sender, "Choose your preferred organization:")
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "International Rescue Committee",
                    "subtitle": "The International Rescue Committee (IRC) responds to the world's worst humanitarian crises and helps people to survive and rebuild their lives.",
                    "image_url": "https://4.bp.blogspot.com/-55VVyrI5s-E/WH3fXzc55zI/AAAAAAAAAHk/g0IurhuHLmE8IRiaNIZQ77rvJeTNfuZWQCLcB/s400/irc.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://help.rescue.org/donate",
                        "title": "Donate"
                    }],
                }, {
                    "title": "Islamic Relief",
                    "subtitle": "Islamic Relief is a charity organised under UK law that serves as catalyst and coordinator for many relief projects around the globe",
                    "image_url": "https://www.islamic-relief.org/wp-content/uploads/2014/06/irw-post-img-605x340.jpg",
                    "buttons": [{
                      "type": "postback",
                      "title": "Postback",
                      "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        },
        "quick_replies":[
            {
                "content_type":"text",
                "title":"Thanks",
                "payload":"awesome"
            },
            {
                "content_type":"text",
                "title":"Learn more",
                "payload":"blah"
            }
        ]
     }
  } else {
    text = "Sorry! I don't know what you're talking about. 😅"
    messageData = { text:text }
  }
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:access},
      method: 'POST',
      json: {
          recipient: {id:sender},
          message: messageData,
      }
  }, function(error, response, body) {
      if (error) {
          console.log('Error sending messages: ', error)
      } else if (response.body.error) {
          console.log('Error: ', response.body.error)
      }
  })
}

function handleMessage(sender, received_message){
  let response;

  // Check if the message sent is text or attachments
  if (received_message.text) {
    let text = received_message.text;
    if (text === "Hi") {
      response = {"text":`Hi Human!`}
    }else {
      response = {"text":`You sent the message: "${received_message.text}"!`}
    }
  } else if (received_message.attachments) {
    response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "International Rescue Committee",
                    "subtitle": "The International Rescue Committee (IRC) responds to the world's worst humanitarian crises and helps people to survive and rebuild their lives.",
                    "image_url": "https://4.bp.blogspot.com/-55VVyrI5s-E/WH3fXzc55zI/AAAAAAAAAHk/g0IurhuHLmE8IRiaNIZQ77rvJeTNfuZWQCLcB/s400/irc.jpg",
                    "buttons": [{
                        "type": "postback",
                        "payload": "donate",
                        "title": "Donate"
                    }],
                }, {
                    "title": "Islamic Relief",
                    "subtitle": "Islamic Relief is a charity organised under UK law that serves as catalyst and coordinator for many relief projects around the globe",
                    "image_url": "https://www.islamic-relief.org/wp-content/uploads/2014/06/irw-post-img-605x340.jpg",
                    "buttons": [{
                      "type": "postback",
                      "title": "Learn",
                      "payload": "learn",
                    }],
                }]
            }
        }
    }
  }

  changeState(sender, response)

  // Send the response message
  callSendAPI(sender, response);
}

function handlePostback(sender, received_postback){
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  switch (payload) {
    case "greeting":
      response = {"text":"Welcome to Donation Bot!"}
      break;
    case "donate":
      response = {"text":"You can donate to IRC"}
      break;
    case "learn":
      response = {"text":"Learn about the charity organizations"}
      break;
    default:
      response = {"text":"I'm not sure how to handle this postback 😅"}
  }

  changeState(sender, response)
  // Send the response
  callSendAPI(sender, response)
}

function changeState(sender, response){
  // Construct sender action
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:access},
      method: 'POST',
      json: {
          recipient: {id:sender},
          "sender_action":"typing_on",
      }
  }, function(error, response, body) {
      if (error) {
          console.log('Error sending messages: ', error)
      } else if (response.body.error) {
          console.log('Error: ', response.body.error)
      }
  })
}

function callSendAPI(sender, response){
  // Construct the message
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:access},
      method: 'POST',
      json: {
          recipient: {id:sender},
          message: response,
      }
  }, function(error, response, body) {
      if (error) {
          console.log('Error sending messages: ', error)
      } else if (response.body.error) {
          console.log('Error: ', response.body.error)
      }
  })
}
