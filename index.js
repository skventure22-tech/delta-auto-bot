import express from "express";

const app = express();
const PORT = process.env.PORT || 8080;

// 🔥 REQUIRED FOR RAILWAY
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "delta-auto-bot",
    time: new Date().toISOString()
  });
});

// OPTIONAL: healthcheck
app.get("/health", (req, res) => {
  res.status(200).send("healthy");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
