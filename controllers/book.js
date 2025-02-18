const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  book
    .save()
    .then((createdBook) => res.status(201).json(createdBook))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findById(req.params.id)

    .then((book) => {
      if (book.userId != req.auth.userId) {
        return res.status(403).json({ message: "403: unauthorized request" });
      }

      // Empêcher la modification du userId
      const updatedBook = { ...bookObject, userId: book.userId };

      Book.updateOne({ _id: req.params.id }, updatedBook)
        .then(() => res.status(200).json({ message: "Objet modifié!" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  Book.findById(req.params.id)

    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
      if (book.userId != req.auth.userId) {
        return res.status(403).json({ message: "403: unauthorized request" });
      }

      const filename = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, (err) => {
        if (err) {
          console.error("Erreur suppression fichier :", err);
        }

        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Objet supprimé !" }))
          .catch((error) => res.status(500).json({ error })); // Correction ici
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findById(req.params.id)

    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.rateBook = async (req, res) => {
  try {
    const { id } = req.params; // ID du livre
    const { grade } = req.body; // Note
    const userId = req.auth.userId; // L'ID de l'utilisateur connecté (on le prend du middleware auth)

    console.log("Livre ID:", id);
    console.log("Note:", grade);
    console.log("User ID:", userId);

    // Vérifier que la note est entre 0 et 5
    if (grade < 0 || grade > 5) {
      return res
        .status(400)
        .json({ message: "La note doit être entre 0 et 5." });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé." });
    }

    console.log("Livre trouvé:", book);

    // Vérifier si l'utilisateur a déjà noté ce livre
    const existingRating = book.ratings.find(
      (rating) => rating.userId.toString() === userId.toString()
    );
    if (existingRating) {
      return res.status(400).json({ message: "Vous avez déjà noté ce livre." });
    }

    // Ajouter la nouvelle note
    book.ratings.push({ userId, grade });

    // Recalculer la moyenne
    const totalRatings = book.ratings.length;
    const sumRatings = book.ratings.reduce(
      (sum, rating) => sum + rating.grade,
      0
    );
    book.averageRating = sumRatings / totalRatings;

    // Sauvegarde du livre mis à jour
    await book.save();

    console.log("Livre mis à jour:", book);

    res.status(200).json(book);
  } catch (error) {
    console.error("Erreur lors du rating:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

exports.getBestRatedBooks = async (req, res) => {
  try {
    const bestBooks = await Book.find().sort({ averageRating: -1 }).limit(3); // Trie par note moyenne décroissante et limite à 3
    res.status(200).json(bestBooks);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
