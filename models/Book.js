const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [
    {
      userId: { type: String, required: true }, // ID de l'utilisateur qui note
      grade: { type: Number, required: true, min: 0, max: 5 }, // Note sur 5
    },
  ],
  averageRating: { type: Number, default: 0 }, // Note moyenne, calculée dynamiquement
});

module.exports = mongoose.model("Book", bookSchema);
