import express from "express";
import {
  createLink,
  getLinks,
  getLinkStats,
  deleteLink
} from "../controllers/linkController.js";

const router = express.Router();

// POST /api/links
router.post("/", createLink);

// GET /api/links
router.get("/", getLinks);

// GET /api/links/:code
router.get("/:code", getLinkStats);

// DELETE /api/links/:code
router.delete("/:code", deleteLink);

export default router;
