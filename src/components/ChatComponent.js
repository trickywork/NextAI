import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Input } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import Speech from "speak-tts";

const { Search } = Input;

const DOMAIN = process.env.REACT_APP_DOMAIN;

const searchContainer = {
  display: "flex",
  justifyContent: "center",
};

const ChatComponent = (props) => {
  const { handleResp, isLoading, setIsLoading } = props;
  const [searchValue, setSearchValue] = useState("");
  const [isChatModeOn, setIsChatModeOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speech, setSpeech] = useState(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition, isMicrophoneAvailable } =
    useSpeechRecognition();

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

  useEffect(() => {
    if (!listening && transcript) {
      (async () => await onSearch(transcript))();
      setIsRecording(false);
      resetTranscript();
    }
  }, [listening, transcript]);

  const talk = (text) => {
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
  };

  const chatModeClickHandler = () => {
    setIsChatModeOn((prev) => !prev);
    setIsRecording(false);
    SpeechRecognition.stopListening();
    resetTranscript();
  };

  const recordingClickHandler = () => {
    if (isRecording) {
      setIsRecording(false);
      SpeechRecognition.stopListening();
      return;
    }

    setIsRecording(true);
    SpeechRecognition.startListening();
  };

  const onSearch = async (question) => {
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
  };

  const handleChange = (e) => {
    setSearchValue(e.target.value);
  };

  return (
    <div style={searchContainer}>
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
      )}
    </div>
  );
};

export default ChatComponent;
