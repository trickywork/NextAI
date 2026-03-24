import React, { useState } from "react";
import PdfUploader from "./components/PdfUploader";
import ChatComponent from "./components/ChatComponent";
import RenderQA from "./components/RenderQA";
import { Layout, Typography } from "antd";

// Ant Design layout primitives.
const { Header, Content } = Layout;
const { Title } = Typography;

// Fixed chat bar pinned to the bottom of the viewport.
const chatComponentStyle = {
  position: "fixed",
  bottom: "0",
  width: "80%",
  left: "10%", // this will center it because it leaves 10% space on each side
  marginBottom: "20px",
};

// Wrapper for the upload area near top of page.
const pdfUploaderStyle = {
  margin: "auto",
  paddingTop: "80px",
};

// Scrollable area for conversation history.
const renderQAStyle = {
  height: "50%", // adjust the height as you see fit
  overflowY: "auto",
};

const App = () => {
  // App-level shared state:
  // - conversation: [{ question, answer }, ...]
  // - isLoading: spinner flag while backend is generating response
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Called by ChatComponent after each request finishes.
  // Appends one QA pair to conversation history.
  const handleResp = (question, answer) => {
    setConversation([...conversation, { question, answer }]);
  };

  return (
    <>
      {/* Main page skeleton: header + content + fixed bottom chat input */}
      <Layout style={{ height: "100vh", backgroundColor: "white" }}>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Title style={{ color: "white " }}>Next AI</Title>
        </Header>
        <Content style={{ width: "80%", margin: "auto" }}>
          {/* PDF upload panel (sends selected file to backend /upload endpoint) */}
          <div style={pdfUploaderStyle}>
            <PdfUploader />
          </div>

          <br />
          <br />
          {/* Chat history renderer */}
          <div style={renderQAStyle}>
            <RenderQA conversation={conversation} isLoading={isLoading} />
          </div>

          <br />
          <br />
        </Content>
        {/* Chat input controller fixed to screen bottom */}
        <div style={chatComponentStyle}>
          <ChatComponent
            handleResp={handleResp}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
      </Layout>
    </>
  );
};

export default App;
