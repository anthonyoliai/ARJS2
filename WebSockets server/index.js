const path = require('path');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const httpServer = http.createServer(app); //Node function to create a http server
var Canvas = require('canvas');
var new_data = '';

const PORT = process.env.PORT || 3000;
const wsServer = new WebSocket.Server({
    server: httpServer
}, () => console.log(`WS server is listening at ws://localhost:${WS_PORT}`));

// array of connected websocket clients
let connectedClients = [];


wsServer.on('connection', (ws, req) => {
    console.log('Client connected');
    connectedClients.push(ws); // A list of connected clients to the server
    ws.on('message', data => {
        if (ws.readyState === ws.OPEN) {
            var image = new Canvas.Image();
            image.src = data;

            var canvas = new Canvas.createCanvas(426, 240);
            var context = canvas.getContext('2d');
            var height = image.height;
            var width = image.width;

            canvas.width = width;
            canvas.height = height;
            context.clearRect(0, 0, width, height);
            context.translate(width, 0);
            context.scale(-1, 1);
            context.drawImage(image, 0, 0);
            new_data = canvas.toDataURL('image/png');
            console.log(new_data);

            ws.send(new_data); // Send the new flipped base64 text after canvas manipulation
        } else { // if it's not connected remove from the array of connected ws
            connectedClients.splice(i, 1);
        }
    });
});

// HTTP stuff
app.get('/streamer', (req, res) => res.sendFile(path.resolve(__dirname, './streamer.html')));
app.get('/', (req, res) => {
    res.send(`
        <a href="streamer"><button>Start streaming data</button></a><br>
    `);
});
httpServer.listen(PORT, () => console.log(`HTTP server listening at http://localhost:${PORT}`));

// ignore: <a href="streamer">Start streaming data from client.</a><br>