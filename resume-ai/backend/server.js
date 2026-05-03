
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

// 🔥 synonym map
const synonymMap = {
  js: "javascript",
  javascript: "javascript",
  html5: "html",
  css3: "css",
  ml: "machinelearning",
  "machine learning": "machinelearning",
  reactjs: "react",
  nodejs: "node"
};

function normalize(word) {
  word = word.toLowerCase().trim();
  return synonymMap[word] || word;
}

function getWords(text) {
  text = text.toLowerCase();

  // phrase fix
  text = text.replace(/machine learning/g, "machinelearning");

  // special characters remove
  text = text.replace(/[^a-z0-9\s]/g, " ");

  return text
    .split(/\s+/)
    .map(w => normalize(w))
    .filter(w => w.length > 1);
}

// 🔥 extract text
async function extractText(file) {
  const type = file.mimetype;

  if (type === "application/pdf") {
    const data = await pdfParse(file.buffer);
    return data.text;
  }

  if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  if (type === "text/plain") {
    return file.buffer.toString();
  }

  throw new Error("Unsupported file format");
}

// 🔥 main API
app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    const jd = req.body.jd;

    if (!req.file) {
      return res.status(400).json({ error: "Resume missing" });
    }

    const resumeText = await extractText(req.file);

    const resumeWords = getWords(resumeText);
    const jdWords = getWords(jd);

    const found = [];
    const missing = [];

    const resumeSet = new Set(resumeWords);

jdWords.forEach(word => {
  if (resumeSet.has(word)) {
    found.push(word);
  } else {
    missing.push(word);
  }
});
   

    const uniqueFound = [...new Set(found)];
    const uniqueMissing = [...new Set(missing)];

    const score = ((uniqueFound.length / jdWords.length) * 100).toFixed(2);

    // 🔥 feedback
    let feedback = "";

    if (score > 80) {
      feedback = "Excellent match! Your resume is highly aligned with the job role.";
    } else if (score > 50) {
      feedback = "Good match. Adding a few more relevant skills can boost your chances.";
    } else {
      feedback = "Low match. Try including more relevant skills and projects from the job description.";
    }

    res.json({
      score,
      found: uniqueFound,
      missing: uniqueMissing,
      feedback
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
const path = require("path");

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});