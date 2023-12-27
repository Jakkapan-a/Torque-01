import express from 'express'
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import * as mqtt from 'mqtt';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server);

app.use(express.static(__dirname + '/public'));


io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const optionsMQTT: mqtt.IClientOptions = {
    host: process.env.MQTT_HOST || "", // Replace with your MQTT broker's hostname
    port: parseInt(process.env.MQTT_PORT || "1883"), // Replace with your MQTT broker's port number
    username: process.env.MQTT_USERNAME || "admin", // Replace if needed
    password: process.env.MQTT_PASSWORD || "test", // Replace if needed
};
const client = mqtt.connect(optionsMQTT);

console.log(`mqtt://${process.env.MQTT_HOST || 'localhost'}:${process.env.MQTT_PORT || 1883}`);
client.on('connect', () => {
    console.log('MQTT client connected');
    client.subscribe('some/topic', (err) => {
        if (!err) {
            client.publish('some/topic', 'Hello MQTT');
        }
    });
    client.subscribe("topic/#");
    client.subscribe("TORQUE-1/#");
});

client.on('message', (topic, message) => {
    console.log(`Received message: ${message.toString()} on topic: ${topic}`);

    io.emit('message', { topic, message: message.toString() });

    if(topic === "TORQUE-1/status"){
        io.emit('status', { topic, message: message.toString() });
    }
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000} : http://localhost:${process.env.PORT || 3000}`)
})