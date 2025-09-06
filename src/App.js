import React, { useState } from "react";
import Login from "./pages/Login";
import Chats from "./pages/Chats";

function App() {

  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <>
      {token ? <Chats token={token}/> : <Login setToken={setToken}/>}
    </>
  );
}

export default App;
