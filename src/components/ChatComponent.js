import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Button, Input } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import Speech from "speak-tts";

const { Search } = Input;

// Frontend -> backend base URL (from root .env)
const DOMAIN = process.env.REACT_APP_DOMAIN || "";

// Container style for search bar + control buttons.
const searchContainer = {
  display: "flex",
  justifyContent: "center",
};

const ChatComponent = (props) => {
  // Parent callbacks/state from App.js
  const { handleResp, isLoading, setIsLoading } = props;

  // UI states for input + voice chat mode.
  const [searchValue, setSearchValue] = useState("");
  const [isChatModeOn, setIsChatModeOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speech, setSpeech] = useState(null);

  // Speech recognition state provided by react-speech-recognition.
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition, isMicrophoneAvailable } =
    useSpeechRecognition();

  // Initialize browser text-to-speech engine once on mount.
  useEffect(() => {
    const speech = new Speech();
    speech
      .init({
        volume: 1,
        lang: "en-US",
        rate: 1,
        pitch: 1,
        voice: "Google US English",
        splitSentences: true,
      })
      .then(() => {
        setSpeech(speech);
      })
      .catch((e) => {
        console.warn("Speech init failed:", e);
      });
  }, []);

  // Speak out assistant response using TTS.
  // In Chat Mode, restart microphone after speaking so conversation can continue.
  const talk = useCallback((text) => {
    if (!speech || !text) return;

    speech
      .speak({
        text,
        queue: false,
      })
      .then(() => {
        if (isChatModeOn) {
          SpeechRecognition.startListening();
          setIsRecording(true);
          resetTranscript();
        }
      })
      .catch((e) => {
        console.error("Speech speak failed:", e);
      });
  }, [isChatModeOn, resetTranscript, speech]);

  // Toggle conversational voice mode.
  const chatModeClickHandler = () => {
    setIsChatModeOn((prev) => !prev);
    setIsRecording(false);
    SpeechRecognition.stopListening();
    resetTranscript();
  };

  // Manual start/stop recording for microphone input.
  const recordingClickHandler = () => {
    if (isRecording) {
      setIsRecording(false);
      SpeechRecognition.stopListening();
      return;
    }

    setIsRecording(true);
    SpeechRecognition.startListening();
  };

  // Core request function:
  // - Sends user question to backend /chat
  // - Pushes result back to App conversation state
  // - Optionally reads response aloud in Chat Mode
  const onSearch = useCallback(async (question) => {
    if (!question) return;
    setSearchValue("");
    setIsLoading(true);

    try {
      const response = await axios.get(`${DOMAIN}/chat`, {
        params: {
          question,
        },
      });

      handleResp(question, response.data);
      if (isChatModeOn && typeof response.data === "string") {
        talk(response.data);
      }
    } catch (error) {
      console.error(`Error: ${error}`);
      handleResp(question, error?.response?.data?.error || String(error));
    } finally {
      setIsLoading(false);
    }
  }, [handleResp, isChatModeOn, setIsLoading, talk]);

  // When recording stops and transcript exists, auto-send transcript as a question.
  useEffect(() => {
    if (!listening && transcript) {
      (async () => await onSearch(transcript))();
      setIsRecording(false);
      resetTranscript();
    }
  }, [listening, onSearch, resetTranscript, transcript]);

  const handleChange = (e) => {
    setSearchValue(e.target.value);
  };

  return (
    <div style={searchContainer}>
      {/* In voice chat mode, hide text search bar and use microphone controls instead */}
      {!isChatModeOn && (
        <Search
          placeholder="input search text"
          enterButton="Ask"
          size="large"
          onSearch={onSearch}
          loading={isLoading}
          value={searchValue}
          onChange={handleChange}
        />
      )}
      <Button
        type="primary"
        size="large"
        danger={isChatModeOn}
        onClick={chatModeClickHandler}
        style={{ marginLeft: "5px" }}
      >
        Chat Mode: {isChatModeOn ? "On" : "Off"}
      </Button>
      {isChatModeOn && (
        <>
          {/* Disable record button when browser/microphone support is unavailable. */}
          <Button
            type="primary"
            icon={<AudioOutlined />}
            size="large"
            danger={isRecording}
            onClick={recordingClickHandler}
            style={{ marginLeft: "5px" }}
            disabled={!browserSupportsSpeechRecognition || !isMicrophoneAvailable}
          >
            {isRecording ? "Recording..." : "Click to record"}
          </Button>
        </>
      )}
    </div>
  );
};

export default ChatComponent;
