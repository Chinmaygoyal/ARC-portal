var https = require('https');
var request=require('request');

function search(email){
var username = email.split("@")[0];
    var agent;
    agentOptions = {
      host: 'search.pclub.in'
    , port: '443'
    , path: '/'
    , rejectUnauthorized: false
    };
    agent = new https.Agent(agentOptions);
      request({
      url: "https://search.pclub.in/api/students"
    , method: 'GET'
    , agent: agent
    }, function (err, resp, body) {
    var bodyjson = JSON.parse(body);
    var filteredObj = bodyjson.find(function(item, i){
      if(item.u == username){
        index = i;
        return i;
      }
        });
    
    return filteredObj;   
        
        

        
  });
}
exports.search = search;
