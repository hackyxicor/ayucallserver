const express = require('express');
const path = require('path');
const fs = require('fs');
const open = require('open');
const https = require('https')
const http = require('http')
const socketclient = require('socket.io')

const PORT = process.env.PORT || 3333;
const app = express();
let server;

if (process.env.DEV == true) {
    const options = {
        key: fs.readFileSync('./keys/privatekey.pem'),
        cert: fs.readFileSync('./keys/certificate.pem')
    }
    server = https.createServer(options, app);
} else {
    server = http.createServer(app);
}

const io = socketclient(server);

const users = {}

//Start Server
server.listen(PORT, () => {
    console.log("Server running at localhost:%s", PORT);

    if (process.env.DEV) {
        open('http://localhost:' + PORT);
    }
})

app.get('/', function (req, res) {
    res.send("Hello World");
});

io.on('connection', (socket) => {
    //on Connected
    console.log("Connected", socket.id);


    //on Disconnected
    socket.on('disconnect', () => {
        socket.leave("room1");
    })

    socket.on("message", (data) => {
        switch (data.type) {
            case "hello":

                break;
            case "login":
                users[socket.id] = {
                    id: socket.id,
                    name: data.name,
                }
                socket.join("room1");
                console.log('login', users);
                break;
            default:
                socket.to("room1").emit("message", data)
                break;
        }
    })
})