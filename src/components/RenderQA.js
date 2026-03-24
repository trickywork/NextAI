import React from "react";
import { Spin } from "antd";

// Layout styles for each QA block (user on right, assistant on left).
const containerStyle = {
  display: "flex",
  justifyContent: "space-between",
  flexDirection: "column",
  marginBottom: "20px",
};

const userContainer = {
  textAlign: "right",
};

const agentContainer = {
  textAlign: "left",
};

const userStyle = {
  maxWidth: "50%",
  textAlign: "left",
  backgroundColor: "#1677FF",
  color: "white",
  display: "inline-block",
  borderRadius: "10px",
  padding: "10px",
  marginBottom: "10px",
};

const agentStyle = {
  maxWidth: "50%",
  textAlign: "left",
  backgroundColor: "#F9F9FE",
  color: "black",
  display: "inline-block",
  borderRadius: "10px",
  padding: "10px",
  marginBottom: "10px",
};

const RenderQA = (props) => {
  // conversation shape: [{ question: string, answer: string }, ...]
  // isLoading toggles spinner while waiting for backend response.
  const { conversation, isLoading } = props;

  return (
    <>
      {/* Render conversation history as alternating user/assistant bubbles */}
      {conversation?.map((each, index) => {
        return (
          <div key={index} style={containerStyle}>
            <div style={userContainer}>
              <div style={userStyle}>{each.question}</div>
            </div>
            <div style={agentContainer}>
              <div style={agentStyle}>{each.answer}</div>
            </div>
          </div>
        );
      })}
      {/* Show loading indicator during in-flight /chat requests */}
      {isLoading && <Spin size="large" style={{ margin: "10px" }} />}
    </>
  );
};

export default RenderQA;
