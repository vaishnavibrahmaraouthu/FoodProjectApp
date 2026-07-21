import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [keyword, setKeyword] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  const performSearch = (query, type = searchType) => {
    const cleanedQuery = query?.trim();

    if (cleanedQuery) {
      const params = new URLSearchParams();
      params.set("keyword", cleanedQuery);

      if (type && type !== "all") {
        params.set("searchType", type);
      }

      const queryString = params.toString();
      navigate({
        pathname: `/eats/stores/search/${encodeURIComponent(cleanedQuery)}`,
        search: queryString ? `?${queryString}` : "",
      });
    } else {
      navigate("/");
    }
  };

  const searchHandler = (e) => {
    e.preventDefault();
    performSearch(keyword, searchType);
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
          performSearch(transcript, searchType);
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
    <form onSubmit={searchHandler} className="simple-search-form">
      <div className="simple-search-input-group">
        <i className="fa fa-search simple-search-icon" aria-hidden="true"></i>

        <input
          type="text"
          id="search_field"
          className="form-control"
          placeholder={
            isListening
              ? "Listening... speak a restaurant or dish name 🎙️"
              : "Search restaurants or food items"
          }
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          className="search-type-select"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          aria-label="Search type"
        >
          <option value="all">All</option>
          <option value="restaurant">Restaurants</option>
          <option value="fooditem">Food Items</option>
        </select>

        <button
          type="button"
          id="voice_btn"
          className={`btn voice-search-btn ${isListening ? "listening" : ""}`}
          onClick={toggleVoiceSearch}
          title={isListening ? "Listening... Click to stop" : "Search by voice"}
        >
          <i
            className={`fa ${isListening ? "fa-microphone-slash" : "fa-microphone"}`}
            aria-hidden="true"
          ></i>
        </button>

        <button id="search_btn" type="submit" className="btn">
          <i className="fa fa-search" aria-hidden="true"></i>
        </button>
      </div>
    </form>
  );
};

export default Search;
