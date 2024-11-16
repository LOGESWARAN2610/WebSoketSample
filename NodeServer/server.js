const express = require("express");
const { WebSocketServer } = require("ws");
const mongoose = require("mongoose");

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/websocketDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const MessageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  text: String,
  timestamp: Date,
});
const Message = mongoose.model("Message", MessageSchema);

const app = express();
const PORT = 5000;

const wss = new WebSocketServer({ noServer: true });
const clients = new Map();

wss.on("connection", (ws, request) => {
  const params = new URLSearchParams(request.url.split("?")[1]);
  const userId = params.get("userId");
  if (userId) {
    clients.set(userId, ws);
    console.log(`User ${userId} connected`);

    ws.on("close", () => {
      clients.delete(userId);
      console.log(`User ${userId} disconnected`);
    });

    Message.find({ $or: [{ sender: userId }, { receiver: userId }] }).then(
      (messages) => {
        ws.send(JSON.stringify({ type: "history", data: messages }));
      }
    );
  }

  ws.on("message", async (message) => {
    const msgData = JSON.parse(message);
    console.log("Received:", msgData);

    const { sender, receiver, text } = msgData;

    const newMessage = new Message({
      sender,
      receiver,
      text,
      timestamp: new Date(),
    });
    await newMessage.save();

    const targetSocket = clients.get(receiver);
    if (targetSocket && targetSocket.readyState === 1) {
      targetSocket.send(JSON.stringify({ type: "message", data: newMessage }));
    }

    ws.send(JSON.stringify({ type: "message", data: newMessage }));
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
