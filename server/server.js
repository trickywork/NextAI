import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer"; // Import multer
import chat from "./chat.js";

dotenv.config();

const app = express();
app.use(cors());

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const PORT = Number(process.env.PORT) || 5001;

let filePath;

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
