import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChatProvider } from "./hooks/useChat";
import "./index.css";

const Root = () => {
  const [text, setText] = useState("No reports loaded. Waiting for input...");

  return (
    <ChatProvider text={text} setText={setText}>
      <App text={text} setText={setText} />
    </ChatProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <Root />
  // </React.StrictMode>
);
