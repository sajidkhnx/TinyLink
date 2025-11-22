import Link from "../models/Link.js";
import validateUrl from "../utils/validateUrl.js";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export const createLink = async (req, res) => {
  try {
    const { targetUrl, code: providedCode } = req.body;

    // Normalize and validate the URL
    const normalized = validateUrl(targetUrl);
    if (!normalized) return res.status(400).json({ error: "Invalid URL" });

    let code = providedCode;

    if (code) {
      // Validate custom code format
      if (!CODE_REGEX.test(code))
        return res.status(400).json({ error: "Invalid code format. Use A-Za-z0-9, length 6-8." });

      const exists = await Link.findOne({ code });
      if (exists) return res.status(409).json({ error: "Code already exists" });
    } else {
      // Generate unique code (6 chars) that meets the pattern
      do {
        code = Math.random().toString(36).substring(2, 8).substr(0, 6);
      } while (await Link.findOne({ code }));
    }

    const newLink = await Link.create({ targetUrl: normalized, code });
    res.status(201).json(newLink);
  } catch (err) {
    console.error("createLink error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLinks = async (req, res) => {
  const links = await Link.find().sort({ createdAt: -1 });
  res.json(links);
};

export const getLinkStats = async (req, res) => {
  const { code } = req.params;
  const link = await Link.findOne({ code });
  if (!link) return res.status(404).json({ error: "Not found" });

  res.json(link);
};

export const deleteLink = async (req, res) => {
  const { code } = req.params;
  const link = await Link.findOneAndDelete({ code });
  if (!link) return res.status(404).json({ error: "Not found" });

  res.json({ success: true });
};
