import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import axios from "axios";

export default function Login({ setToken }){
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try{
            const res = await axios.post(`http://localhost:9999/api/auth/login`, {
                phoneNumber,
                password
            });
            setToken(res.data.token);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", res.data.userId);
            localStorage.setItem("userFullName",res.data.fullName);
        }catch(err){
            console.log("Failed Login : ",err);
            alert("Failed Login !");
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h4">Login</Typography>
                <TextField
                label="Phone Number"
                variant="outlined"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                fullWidth
                />
                <TextField
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                <Button variant="contained" onClick={handleLogin}>
                    Login
                </Button>
            </Box>
        </Container>
    )
}