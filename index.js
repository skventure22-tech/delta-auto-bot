import express from "express";

const app = express();

// IMPORTANT: Railway gives PORT via env
const PORT = process.env.PORT || 8080;

// Health check (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "delta-auto-bot",
    time: new Date().toISOString()
  });
});

// Optional health endpoint
app.get("/health", (req, res) => {
  res.send("healthy");
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
