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
      statuscodes: { required: true, type: 'array' },
      notfoundmsg: { required: true, type: 'string' },
      notransmsg: { required: true, type: 'string' },
    },
    supportedActions: ['next', 'error', 'tryagain']
  }),
  invoke: (context, done) => {
    // Retrieve the value of the 'human' component property.
    const { url } = context.properties();
    const { apikey } = context.properties();
    var { siteid } = context.properties();
    var { ordernumberpart } = context.properties();
    var { statuscodes } = context.properties();
    var { notfoundmsg } = context.properties();
    var { notransmsg } = context.properties();
    var urlQuery = "";
      
    urlQuery = url + siteid + "/" + ordernumberpart;
    
    console.log(urlQuery);
    console.log(statuscodes);
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
         context.reply(notfoundmsg);
         context.keepTurn(true);
         context.transition('tryagain');
     } else {
         // Translate the status
         var statuscodesArr = statuscodesArr = JSON.parse(statuscodes); // This works in ODA
         // var statuscodesArr = statuscodes; // Do this when running locally
         var status = notransmsg;
         var i=0;
         for(i; i < statuscodesArr.length; i++)
         {
             if(bodyResponse.order_status.valueOf() == statuscodesArr[i].status.valueOf())
             {
                 status = statuscodesArr[i].text;
                 i = statuscodesArr.length;
             }
         }
         context.reply(status);
         context.keepTurn(true);
         context.transition('next');
     }
     done();
    });
  }
};
