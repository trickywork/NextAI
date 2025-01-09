// use npm start under this file

import express from "express";
// cross origin resources  
import cors from "cors";
// to use .env file
import dotenv from "dotenv";
// to use API
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
const upload = multer({ storage });

// express asks to initalize a port num
const PORT = 5001;

let filePath;

app.post("/upload", upload.single("file"), async (req, res) => {
// use multer to handle file upload
filePath = req.file.path; // The path where the file is temporarily saved
res.send(filePath + " upload successfully.");
});

// default parameter at the end
app.get("/chat", async (req, res) => {
const resp = await chat(req.query.question, filePath); // Pass the file path to main function
res.send(resp.text);
});

app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});