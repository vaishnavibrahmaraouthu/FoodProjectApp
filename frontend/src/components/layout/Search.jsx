import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [keyword, setKeyword] = useState("");
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  const performSearch = (query) => {
    if (query && query.trim()) {
      navigate(`/eats/stores/search/${query.trim()}`);
    } else {
      navigate("/");
    }
  };

  const searchHandler = (e) => {
    e.preventDefault();
    performSearch(keyword);
  };

  const toggleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported in your browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");

        setKeyword(transcript);

        if (event.results[0] && event.results[0].isFinal) {
          setIsListening(false);
          performSearch(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setIsListening(false);
    }
  };

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <form onSubmit={searchHandler}>
      <div className="input-group">
        <input
          type="text"
          id="search_field"
          className="form-control"
          placeholder={
            isListening
              ? "Listening... Speak food item or restaurant 🎙️"
              : "Search restaurant or food item (e.g. Pizza, Biryani)..."
          }
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <div className="input-group-append">
          <button
            type="button"
            id="voice_btn"
            className={`btn voice-search-btn ${isListening ? "listening" : ""}`}
            onClick={toggleVoiceSearch}
            title={isListening ? "Listening... Click to stop" : "Search by voice"}
          >
            <i
              className={`fa ${
                isListening ? "fa-microphone-slash" : "fa-microphone"
              }`}
              aria-hidden="true"
            ></i>
          </button>

          <button id="search_btn" type="submit" className="btn">
            <i className="fa fa-search" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </form>
  );
};

export default Search;
