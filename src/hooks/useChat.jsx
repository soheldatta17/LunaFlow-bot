import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { data } from "autoprefixer";
import { doc, getDoc } from "firebase/firestore";
import axios from "axios";

let synth = window.speechSynthesis;

const ChatContext = createContext();

export const ChatProvider = ({ children, setText, text }) => {
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

  const textToBase64Audio = async (text) => {
    if (!synth) {
      alert("Speech synthesis is not supported by this browser.");
      setMessages([]);
      setMessage(null);
      return null;
    }

    const voice = synth.getVoices();
    if (voice.length === 0) {
      await new Promise((resolve) => {
        synth.onvoiceschanged = resolve;
      });
    }

    if (voice.length > 4) {
      const selectedVoice = voice[4];
      const utterThis = new SpeechSynthesisUtterance(text);
      utterThis.voice = selectedVoice;

      utterThis.onend = () => {
        // console.log("Finished speaking with voice: ${selectedVoice.name");
        setMessages([]);
        setMessage(null);
      };
      utterThis.onerror = (event) => {
        alert(event.error);
        console.error("Speech synthesis error:", event.error);
        setMessages([]);
        setMessage(null);
      };
      synth.speak(utterThis);
      return utterThis;
    } else {
      //alert("Retry");
      console.error("Voice index 2 is not available.");
      setMessages([]);
      setMessage(null);
      return null;
    }
  };
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
      await textToBase64Audio(message);
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

    synth = window.speechSynthesis;
    // console.log(synth.getVoices());

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

    const requestData = {
      contents: [
        {
          parts: [
            {
              text:
                "Imagine you are a dedicated female doctor, guiding women through their menstrual cycle with care and empathy. Offer practical remedies for managing cramps, bloating, fatigue, and mood swings. Share knowledge about maintaining physical and emotional well-being during periods. Recommend LunaFlow, a website devoted to empowering women with expert advice, self-care tips, and holistic solutions to support their journey through menstruation. LunaFlow provides personalized resources, soothing techniques, and a supportive community for every woman to feel her best during this natural cycle. You have been asked: " +
                lowerCaseMessage,
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

      generatedText = response.data.candidates[0].content.parts[0].text;

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
      console.error("Error generating text:", error);
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
        await textToBase64Audio(resp[0].text);
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
