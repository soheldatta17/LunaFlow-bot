import { createContext, useContext, useEffect, useState } from "react";
import { data } from "autoprefixer";
import axios from "axios";


const ChatContext = createContext();

export const ChatProvider = ({ children, text, setText, count, setCount, categories }) => {
  const [responses, setResponses] = useState([]);
  const [fetchedItems, setFetchedItems] = useState({});
  const [fetchedUser, setFetchedUser] = useState({});
  const [fetchedUserDetails, setFetchedUserDetails] = useState({});
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [counter, setCounter] = useState(0);
  const defaultStatements = ["Hello"];
  
  useEffect(() => {
    const startingchat = async (message) => {
      if (!message || counter >= 1) {
        return;
      }
      setCounter(counter + 1);
      setMessage(message.replace(/\*/g, ""));
      setMessages([
        {
          text: message,
          expression: "smile",
          animation: "Waving",
          audio: "",
        },
      ]);
      // await textToBase64Audio(message);
    };

    const check = () => {
      if (messages.length > 0) {
        setMessage(messages[0]);
      } else {
        setMessage(null);
      }
    };

    const initializeChat = async () => {
      const randomStatement =
        defaultStatements[Math.floor(Math.random() * defaultStatements.length)];

      await startingchat(randomStatement);
    };


    return () => {
      check();
      // startingchat();
      initializeChat();
    };
  }, []);

  const chatresponse = async (message) => {
    const lowerCaseMessage = message?.toLowerCase() || "";

    if (lowerCaseMessage.trim() === "") {
      return;
    }
    // Check for specific mental health-related keywords
    let generatedText = "";

    let question="Imagine you are a Doctor advicing about menstruation and peiods, answer the question in details : ";

    const requestData = {
      contents: [
        {
          parts: [
            {
              text: question+lowerCaseMessage,
            },
          ],
        },
      ],
    };

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GOOGLE_API_KEY}`,
        requestData
      );

      generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Server Down. Please try later message";


      generatedText = generatedText.replace(/\*/g, "");
      try{
        setText(generatedText);
        console.log("Succesful")
      }catch(err){
        console.error("Error:", err);
      }
      // console.log(text);

      // console.log(generatedText.length);
      console.log(generatedText);
    } catch (error) {
      console.log(error)
    }

    return [
      {
        text: generatedText,
        facialExpression: "smile",
        animation: "Waving",
      },
    ];
  };

  const chat = async (message) => {
    if (!message) {
      console.error("Message is undefined.");
      return;
    }

    setLoading(true);
    try {
      const resp = await chatresponse(message);

      if (resp && resp.length > 0) {
        // console.log("New messages:", resp);
        setMessages([
          {
            text: resp[0].text,
            expression: resp[0].facialExpression,
            animation: resp[0].animation,
            audio: "",
          },
        ]);
        // await textToBase64Audio(resp[0].text);
      } else {
        console.error("No messages found in response.");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // console.log("Message: ", messages);

  const onMessagePlayed = () => {
    setMessages((prevMessages) => prevMessages.slice(1));
  };

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        messages,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
