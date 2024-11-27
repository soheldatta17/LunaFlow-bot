import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChatProvider } from "./hooks/useChat";
import "./index.css";

const Root = () => {
  const [text, setText] = useState("No reports loaded. Waiting for input...");
  const [count, setCount] = useState(0);
  const categories = ["doctor"];
  const [speak, setSpeak] = useState(false);

  return (
    <>
    <ChatProvider text={text} setText={setText} count={count} setCount={setCount} categories={categories}>
      <App text={text} setText={setText} count={count} setCount={setCount} categories={categories} speak={speak} setSpeak={setSpeak} />
    </ChatProvider>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  
    <Root />
  
);
