import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import linkRoutes from "./routes/linkRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/links", linkRoutes);

// Health check
app.get("/healthz", (req, res) => {
  res.status(200).json({ ok: true, version: "1.0" });
});

// Redirect Route
import Link from "./models/Link.js";
app.get("/:code", async (req, res) => {
  const { code } = req.params;

  const link = await Link.findOne({ code });
  if (!link) return res.status(404).send("Not found");

  link.totalClicks += 1;
  link.lastClicked = new Date();
  await link.save();

  return res.redirect(302, link.targetUrl);
});

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.log(err));
