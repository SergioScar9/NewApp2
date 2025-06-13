const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  code: String,
  users: [String],
  // Traccia i film per utente specifico N
  userMovies: [
    {
      userId: String,
      movies: [
        {
          id: Number,
          title: String,
          poster_path: String,
          release_date: String,
          overview: String,
          popularity: Number,
          likedAt: { type: Date, default: Date.now },
        },
      ],
    },
  ],

  selectedMovies: [{ type: Object }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Room", RoomSchema);
