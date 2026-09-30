import express from "express";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Crypto market bot is running",
  });
});


export default app;