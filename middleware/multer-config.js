const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Stockage temporaire en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("image");

const optimizeImage = async (req, res, next) => {
  if (!req.file) return next(); // Si pas d’image, on passe au middleware suivant

  const filename = `image_${Date.now()}.webp`; // Nom unique en .webp
  const outputPath = path.join(__dirname, "../images/", filename);

  try {
    // Vérifier si le dossier 'images/' existe, sinon le créer
    if (!fs.existsSync(path.join(__dirname, "../images/"))) {
      fs.mkdirSync(path.join(__dirname, "../images/"), { recursive: true });
    }

    // Conversion et optimisation de l’image
    await sharp(req.file.buffer)
      .resize({ width: 800 }) // Redimensionnement max 800px de largeur
      .webp({ quality: 70 }) // Conversion en WebP avec compression
      .toFile(outputPath);

    // Mise à jour de l’objet req.file pour l'utiliser dans le contrôleur
    req.file.filename = filename;
    req.file.path = outputPath;

    next();
  } catch (error) {
    console.error("Erreur d'optimisation de l'image :", error);
    res.status(500).json({ message: "Erreur lors du traitement de l'image" });
  }
};

module.exports = { upload, optimizeImage };
