'use strict';

const request = require('request');

// You can use your favorite http client package to make REST calls, however, the node fetch API is pre-installed with the bots-node-sdk.
// Documentation can be found at https://www.npmjs.com/package/node-fetch
// Un-comment the next line if you want to make REST calls using node-fetch. 
// const fetch = require("node-fetch");
 
module.exports = {
  metadata: () => ({
    name: 'orderStatus',
    properties: {
      url: { required: true, type: 'string' },
      apikey: { required: true, type: 'string' },
      siteid: { required: true, type: 'string' },
      ordernumberpart: { required: true, type: 'string' },
    },
    supportedActions: ['next', 'error', 'tryagain']
  }),
  invoke: (context, done) => {
    // Retrieve the value of the 'human' component property.
    const { url } = context.properties();
    const { apikey } = context.properties();
    var { siteid } = context.properties();
    var { ordernumberpart } = context.properties();
    var urlQuery = "";
      
    urlQuery = url + siteid + "/" + ordernumberpart;
    
    console.log(urlQuery);
    context.logger().info(urlQuery);
    context.logger().info('query: ' + urlQuery);

    request({
        followAllRedirects: true,
        url: urlQuery,
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'ApiKey': apikey
        }
      }, function (error, response, body){
      if (error) { 
        context.logger().info("Error: " + error); 
        context.transition('error'); 
        context.reply(urlQuery + ' ' + error);
      }

     var bodyResponse = JSON.parse(body);

     context.logger().info("Data received: \n" + JSON.stringify(bodyResponse));

     if(!bodyResponse.order_status || bodyResponse.order_status == "null")
     {
         context.reply("Order was not found. Please try again.");
         context.keepTurn(true);
         context.transition('tryagain');
     } else {
         // Translate the status
         switch(bodyResponse.order_status) {
             case "1.9":
                 context.reply("Your order is being packed.");
                 break;
             case "2.0":
                 context.reply("Your order has been shipped.");
                 break;
         };
         context.keepTurn(true);
         context.transition('next');
     }
     done();
    });
  }
};
