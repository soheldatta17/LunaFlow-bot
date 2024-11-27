import { useRef, useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { FiMinimize2, FiMaximize2, FiDownload } from "react-icons/fi";
import { PiUserSwitchBold } from "react-icons/pi";
import { HiSpeakerWave } from "react-icons/hi2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";

export const UI = ({
  hidden,
  text,
  setText,
  count,
  setCount,
  categories,
  speak,
  setSpeak,
}) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();
  const [isMinimized, setIsMinimized] = useState(false);
  // let synth = window.speechSynthesis;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 530);
      window.innerWidth < 530 ? setCameraZoomed(false) : setCameraZoomed(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    if (text === "No reports loaded. Waiting for input..." && isMobile) {
      setIsMinimized(true);
      return;
    }
    if (text !== "No reports loaded. Waiting for input..." && isMobile) {
      setIsMinimized(false);
    }
  }, [text]);

  const [voices, setVoices] = useState([]);

  useEffect(() => {
    // Function to load and set voices
    const loadVoices = () => {
      const synth = window.speechSynthesis;
      const availableVoices = synth.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    // Load voices and add event listener
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      // Clean up event listener
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const textToBase64Audio = async () => {
    if (voices.length === 0) {
      console.error("No voices are available yet.");
      alert("Voice data is still loading. Please try again.");
      return null;
    }

    const selectedVoice = voices[4] || voices[0]; // Fallback to the first voice if index 4 is unavailable
    const utterThis = new SpeechSynthesisUtterance(text);
    setSpeak(true);
    utterThis.voice = selectedVoice;

    utterThis.onend = () => {
      console.log(`Finished speaking with voice: ${selectedVoice.name}`);
      setSpeak(false);
    };

    utterThis.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
    };

    window.speechSynthesis.speak(utterThis);
    return utterThis;
  };
  const downloadPDF = () => {
    const doc = new jsPDF();
    const lines = text.split("\n");

    // Add a diagonal watermark in gray (from bottom-left to top-right, filling the page)
    const watermarkText = "MADE BY SOHEL";
    doc.setFontSize(100); // Increased the font size to cover the page
    doc.setFont("helvetica", "bold");
    doc.setTextColor(200, 200, 200); // Light gray for watermark
    doc.text(watermarkText, 10, 250, { angle: 45, opacity: 0.1 }); // Bottom-left to top-right

    // Title Styling with padding and a larger font
    doc.setFontSize(22); // Increased title size
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204); // Blue color for title
    const title = `${
      categories[count].charAt(0).toUpperCase() + categories[count].slice(1)
    }'s Report`;
    doc.text(title, 15, 30); // Added padding on the left and top for the title

    // Subtitle with date
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(14); // Slightly larger font for subtitle
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Black color for the subtitle
    doc.text(`Date: ${currentDate}`, 10, 45);

    // Content Styling with padding
    let y = 55; // Start the content below the title and subtitle
    const maxWidth = doc.internal.pageSize.width - 20; // Page width with padding

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    lines.forEach((line) => {
      if (line.trim() === "") {
        y += 5; // Add extra space for empty lines
      } else {
        // Use splitTextToSize to wrap text
        const wrappedText = doc.splitTextToSize(line, maxWidth);
        doc.text(wrappedText, 10, y);
        y += wrappedText.length * 7; // Adjust line height based on the number of lines
      }
    });

    // Finalize PDF
    doc.save(`${categories[count]}_Report.pdf`);
  };

  const toggleHeight = () => {
    setIsMinimized((prev) => !prev);
  };

  const sendMessage = () => {
    const text = input.current.value;

    if (!loading && !message) {
      chat(text);
      input.current.value = "";
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div
          className={`absolute top-4 left-4
    ${isMobile ? "w-68 max-w-[68vw]" : "w-80"}
    ${isMinimized ? "h-[14vh]" : "h-[70vh]"}
    bg-gray-800 ${
      text === "No reports loaded. Waiting for input..."
        ? "bg-opacity-60"
        : "bg-opacity-90"
    } border-2 border-gray-600 rounded-md p-4 text-white overflow-y-scroll pointer-events-auto shadow-lg transition-all duration-300`}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-left text-pink-500">
              {categories[count].charAt(0).toUpperCase() +
                categories[count].slice(1)}
              's Report
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={downloadPDF}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md flex items-center justify-center"
                title="Download PDF"
              >
                <FiDownload className="text-xl" />
              </button>
              <button
                onClick={textToBase64Audio}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md flex items-center justify-center"
                title="Speak Text"
              >
                <HiSpeakerWave className="text-xl" />
              </button>
              <button
                onClick={toggleHeight}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md flex items-center justify-center"
                title={isMinimized ? "Expand" : "Minimize"} // Tooltip
              >
                {isMinimized ? (
                  <FiMaximize2 className="text-xl" /> // Expand Icon
                ) : (
                  <FiMinimize2 className="text-xl" /> // Minimize Icon
                )}
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-white-300 leading-relaxed">
              {text.split("\n").map((line, index, arr) => {
                // Check if the line is a heading (has a newline before and after it)
                const isHeading =
                  index > 0 &&
                  index < arr.length - 1 &&
                  arr[index - 1] === "" &&
                  arr[index + 1] === "";

                return (
                  <span key={index}>
                    {isHeading ? (
                      <strong className="font-bold text-red-500">{line}</strong>
                    ) : (
                      line
                    )}
                    <br />
                  </span>
                );
              })}
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col items-end justify-center gap-4">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              // setCount((count+1)% categories.length);
              const body = document.querySelector("body");
              body.classList.remove(...categories);
              body.classList.add(categories[(count + 1) % categories.length]);
              setCount((count + 1) % categories.length);
              setText("No reports loaded. Waiting for input...");
            }}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md flex items-center justify-center"
          >
            <PiUserSwitchBold size={24} />
          </button>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder="Type a message..."
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button
            disabled={loading || message}
            onClick={sendMessage}
            className={`bg-pink-500 hover:bg-pink-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
              loading || message ? "cursor-not-allowed opacity-30" : ""
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};
