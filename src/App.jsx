import { useState, useEffect } from "react";

const queryStringToObject = (queryString) => {
  if (!queryString) queryString = window.location.href;
  queryString = queryString.split("?")[1];
  const params = new URLSearchParams(queryString),
    result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};
const { userId } = queryStringToObject();
const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [receiver, setReceiver] = useState(""); // Receiver's user ID
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Connect to WebSocket server with user ID
    const socket = new WebSocket(`ws://localhost:5000?userId=${userId}`);
    setWs(socket);

    // Listen for messages
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "history") {
        setMessages(msg.data);
      } else if (msg.type === "message") {
        setMessages((prev) => [...prev, msg.data]);
      }
    };

    socket.onclose = () => {
      console.log("Disconnected from server");
    };

    return () => {
      socket.close();
    };
  }, [userId]);

  const sendMessage = () => {
    if (ws && input && receiver) {
      ws.send(JSON.stringify({ sender: userId, receiver, text: input }));
      setInput("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>WebSocket Chat - {userId}</h1>
      <div
        style={{
          border: "1px solid black",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>
              {msg.sender === userId ? "You" : `User ${msg.sender}`}:
            </strong>{" "}
            {msg.text}
            <br />
            <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
        placeholder="Receiver's User ID"
        style={{ marginRight: "10px" }}
      />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default App;
