const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.memoryStorage(); // Stockage temporaire en mémoire

const upload = multer({ storage: storage }).single("image");

const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  const extension = MIME_TYPES[req.file.mimetype] || "jpg"; // Fallback sur jpg
  const filename = `images/${req.file.originalname
    .split(" ")
    .join("_")}_${Date.now()}.${extension}`;

  try {
    await sharp(req.file.buffer)
      .resize(800) // Redimensionner à une largeur max de 800px
      .jpeg({ quality: 70 }) // Convertir en JPEG avec 70% de qualité
      .toFile(filename);

    req.file.filename = filename.split("/")[1]; // Mettre à jour le nom du fichier
    next();
  } catch (error) {
    console.error("Erreur d'optimisation de l'image :", error);
    res.status(500).json({ message: "Erreur lors du traitement de l'image" });
  }
};

module.exports = { upload, optimizeImage };
