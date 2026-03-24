import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer"; // Import multer
import chat from "./chat.js";

// Load environment variables from server/.env at startup.
dotenv.config();

// Express app bootstrap + CORS so the React frontend (localhost:3000)
// can call this backend (localhost:5001).
const app = express();
app.use(cors());

// Multer storage strategy:
// 1) Save uploaded files under server/uploads/
// 2) Keep the original filename as-is
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// Backend port (can be overridden by environment variable).
const PORT = Number(process.env.PORT) || 5001;

// In-memory pointer to "the latest uploaded file".
// Important: this resets every time the server restarts.
let filePath;

// Upload endpoint:
// - Accepts multipart/form-data with field name "file"
// - Stores file on disk and remembers the path in memory
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Use form-data with field name: file" });
    }

    // Use multer to handle file upload
    filePath = req.file.path; // The path where the file is temporarily saved
    return res.status(200).json({
      message: `${filePath} upload successfully.`,
      filePath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: error.message || "Upload failed." });
  }
});

// Chat endpoint:
// - Reads user question from query string (?question=...)
// - Uses the latest uploaded PDF path
// - Calls chat() in server/chat.js to run retrieval + LLM answer generation
app.get("/chat", async (req, res) => {
  try {
    const question = String(req.query.question || "").trim();
    if (!question) {
      return res.status(400).json({ error: "Missing query param: question" });
    }

    if (!filePath) {
      return res.status(400).json({ error: "No uploaded PDF found. Please call /upload first." });
    }

    const resp = await chat(question, filePath); // Pass the question and file path to chat
    return res.status(200).send(resp.text);
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({ error: error.message || "Chat failed." });
  }
});

// Start HTTP server.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
