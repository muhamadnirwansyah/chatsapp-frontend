import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  List,
  ListItem,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";

export default function Chats({ token }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [userFullName, setUserFullName] = useState(null);
  const stompClientRef = useRef(null);
  const [phoneBooks, setPhoneBooks] = useState([]);
  const [receiveId, setReceiveId] = useState("");

  useEffect(() => {
    if (token) {
      setUserId(localStorage.getItem("userId"));
      setUserFullName(localStorage.getItem("userFullName"));

      //fetch phone books
      axios.get("http://localhost:9999/api/secure/phone-books", {
        headers: {Authorization: `Bearer ${token}`},
      }).then((res) => {
        setPhoneBooks(res.data.phoneBooks);
      }).catch((err) => {
        console.log("Error fetching phone books : ",err);
      })

      //connect web socket
      const storeUserId = localStorage.getItem("userId");
      const socket = new SockJS("http://localhost:9999/ws");
      const client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: { Authorization: `Bearer ${token}` },
        debug: (str) => console.log("STOMP debug:", str),
        onConnect: () => {
          console.log("Connected..");
          client.subscribe(`/queue/user-${storeUserId}`, (msg) => {
            const body = JSON.parse(msg.body);
            console.log("Body Messages : ",JSON.stringify(body));
            setMessages((prev) => [...prev, body]);
          });
        },
        onStompError: (err) => {
          console.error("Broker error : ", err);
        },
        onWebSocketError: (err) => {
          console.error("Websocket error : ", err);
        },
      });

      client.activate();
      stompClientRef.current = client;

      return () => {
        if (stompClientRef.current) {
          stompClientRef.current.deactivate();
          stompClientRef.current = null;
        }
      };
    }
  }, [token]);

  const sendMessage = () => {
    const client = stompClientRef.current;
    if (client && client.connected && input.trim() !== "") {
      const chatMessage = {
        fullName: userFullName,
        senderId: userId,
        receiverId: receiveId,
        content: input,
      };

      client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(chatMessage),
      });
      setInput("");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5">Chat</Typography>
        {/** dropdown phone books */}
        <FormControl fullWidth sx={{ mb: 2}}>
            <InputLabel>Choose Phone Number</InputLabel>
            <Select
             value={receiveId}
             onChange={(e) => setReceiveId(e.target.value)}>   
                {phoneBooks.map((contact) => (
                    <MenuItem key={contact.userId} value={contact.userId}>
                        {contact.fullName} - {contact.phoneNumber}
                    </MenuItem>
                ))}        
            </Select>
        </FormControl>
        <List
        sx={{
        border: "1px solid #ccc",
        height: 300,
        overflowY: "auto",
        mb: 2,
        p: 1,
        }}
        >
        {messages.map((msg, index) => {
        const isMine = msg.userId === localStorage.getItem("userId"); // cek apakah pesan dari saya
        return (
            <ListItem
            key={index}
            sx={{
                display: "flex",
            justifyContent: isMine ? "flex-end" : "flex-start",
            }}
        >
        <Box
          sx={{
            maxWidth: "70%",
            bgcolor: isMine ? "#1976d2" : "#f1f1f1",
            color: isMine ? "white" : "black",
            px: 2,
            py: 1,
            borderRadius: 2,
            borderTopRightRadius: isMine ? 0 : 2,
            borderTopLeftRadius: isMine ? 2 : 0,
            wordWrap: "break-word",
          }}
        >
          {!isMine && (
            <Typography
              variant="caption"
              sx={{ display: "block", fontWeight: "bold", mb: 0.5 }}
            >
              {msg.fullName}
            </Typography>
          )}
          <Typography variant="body2">{msg.content}</Typography>
        </Box>
      </ListItem>
    );
  })}
    </List>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            label="Type a message.."
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
