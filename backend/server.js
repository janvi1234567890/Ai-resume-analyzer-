const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

// safer function
function getWords(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(/\s+/);
}

function getAI(score, missing) {
  if (score > 75) return "Strong resume 👍";
  if (score > 50) return "Improve skills: " + missing.join(", ");
  return "Weak resume ❌ Add: " + missing.join(", ");
}

// MAIN API
app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    console.log("API HIT 🔥");

    const jd = req.body.jd || "";
    let resumeText = "";

    if (req.file) {
      const data = await pdfParse(req.file.buffer);
      resumeText = data.text || "";
    }

    console.log("RESUME TEXT LENGTH:", resumeText.length);

    let resumeWords = new Set(getWords(resumeText));
    let jdWords = getWords(jd);

    let match = 0;
    let missing = [];

    jdWords.forEach(word => {
      if (resumeWords.has(word)) match++;
      else if (word.length > 2) missing.push(word);
    });

    let score = jdWords.length
      ? ((match / jdWords.length) * 100).toFixed(2)
      : 0;

    res.json({
      score,
      missing: [...new Set(missing)],
      feedback: getAI(score, missing)
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.json({ error: "Server error" });
  }
});

// test route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ⚠️ IMPORTANT (CRASH HANDLE)
process.on("uncaughtException", (err) => {
  console.error("CRASH:", err);
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});