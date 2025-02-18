const jwt = require("jsonwebtoken");
require("dotenv").config(); // Charge les variables d'environnement

module.exports = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    const token = authorizationHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    req.auth = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token invalide" });
  }
};
