var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var fs = require("fs");

io.on("connection", function(client) {
    client.emit('connected', {
        connected: true
    });

    client.on("setUsername", function(name) {
      if(client.username!==undefined){
        // stuurt disconnect bij namechange omdat het zogezegt nieuwe user is en zodat elke client naam verwijderd.
        client.broadcast.emit("userDisconnected", client.username);
      }
        client.username = name;
        client.emit("recievedUsername", client.username);
        client.broadcast.emit("userConnected", client.username);
        console.log(client.username + ' connected');
    });
    client.on("getAllConnected", function() {
      var clients = io.sockets.connected;
      var clientNames = [];
      for (var clientId in clients){
        var clientObj=io.sockets.connected[clientId];
        clientNames.push(clientObj.username);
      }
      client.emit("RecieveAllConnected",clientNames);

    });
    client.on('disconnect', function(){
      console.log(client.username + ' disconnected');
      client.broadcast.emit("userDisconnected", client.username);
  });
  client.on("message", function(to,message){
    var clients = io.sockets.connected;
    var toClientId = "";
    for (var clientId in clients){
      var clientObj=io.sockets.connected[clientId];
      if (clientObj.username===to){
        toClientId=clientId;
      }
    }
    io.clients[toClientId].emit("messageRevieved",{from:client.username,message:message});
  });
});
app.get("*", function(req, res) {
    fs.createReadStream("./public/index.html").pipe(res);
});
server.listen(process.env.port || 1337);
