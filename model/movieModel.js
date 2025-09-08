const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  imbId: {
    type: String,
    required: [true, "IMDB ID is required"],
    unique: true
  },
  originalTitle: {
    type: String,
    required: [true, "Original title is required"]
  },
  description: {
    type: String,
    required: [true, "Description is required"]
  },
  primaryImage: {
    type: String
  },
  trailer: {
    type: String
  },
  releaseDate: {
    type: String
  },
  countriesOfOrigin: {
    type: [String]
  },
  spokenLanguages: {
    type: [String]
  },
  filmingLocations: {
    type: [String]
  },
  productionCompanies: [
    {
      name: {
        type: String,
        required: [true, "Company name is required"]
      }
    }
  ],
  genres: {     
    type: [String]
  },
  subGenres: {
    type: [String]
  },
  isAdult: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const movieModel = mongoose.model('Movies', movieSchema);

module.exports = movieModel;