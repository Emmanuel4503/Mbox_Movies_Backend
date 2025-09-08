const movieModel = require("../model/movieModel");
  

const addMovie = async (req, res, next) => {
  try {
    const {
      imbId,
      originalTitle,
      description,
      trailer,
      releaseDate,
      countriesOfOrigin,
      spokenLanguages,
      filmingLocations,
      productionCompanies,
      genres,
      subGenres,
      isAdult,
      averageRating,
    } = req.body;

    
    if (!imbId || !originalTitle || !description) {
      return res.status(400).json({
        status: "error",
        message: "imbId, originalTitle, and description are required fields",
      });
    }

    
    if (!imbId.trim()) {
      return res.status(400).json({
        status: "error",
        message: "imbId cannot be empty",
      });
    }

    const normalizedImbId = imbId.toLowerCase(); 

    
    const existingMovie = await movieModel.findOne({ imbId: normalizedImbId });
    if (existingMovie) {
      return res.status(400).json({
        status: "error",
        message: "Movie with this imbId already exists",
        data: existingMovie,
      });
    }

    
    const normalizeArrayField = (field, fieldName) => {
      if (!field) return [];
      if (Array.isArray(field)) {
        
        const validArray = field
          .map((item) => String(item).trim())
          .filter((item) => item && item !== "data"); 
        if (validArray.length === 0) {
          console.warn(`Warning: ${fieldName} contains invalid data:`, field);
        }
        return validArray;
      }
      if (typeof field === "string") {
        try {
          
          const parsed = JSON.parse(field);
          if (Array.isArray(parsed)) {
            return parsed
              .map((item) => String(item).trim())
              .filter((item) => item && item !== "data");
          }
        } catch (e) {
          
          return field
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item && item !== "data");
        }
      }
      console.warn(`Warning: Invalid ${fieldName} format:`, field);
      return [];
    };

    
    const normalizedCountriesOfOrigin = normalizeArrayField(countriesOfOrigin, "countriesOfOrigin");
    const normalizedSpokenLanguages = normalizeArrayField(spokenLanguages, "spokenLanguages");
    const normalizedFilmingLocations = normalizeArrayField(filmingLocations, "filmingLocations");
    const normalizedGenres = normalizeArrayField(genres, "genres");
    const normalizedSubGenres = normalizeArrayField(subGenres, "subGenres");

    const formattedProductionCompanies = Array.isArray(productionCompanies)
      ? productionCompanies.map((name) => ({ name: String(name).trim() }))
      : [];

    
    const newMovie = await movieModel.create({
      imbId: normalizedImbId,
      originalTitle,
      description,
      primaryImage: req.file?.path || null,
      trailer: trailer || null,
      releaseDate: releaseDate || null,
      countriesOfOrigin: normalizedCountriesOfOrigin,
      spokenLanguages: normalizedSpokenLanguages,
      filmingLocations: normalizedFilmingLocations,
      productionCompanies: formattedProductionCompanies,
      genres: normalizedGenres,
      subGenres: normalizedSubGenres,
      isAdult: isAdult || false,
      averageRating: averageRating || null,
    });

    res.status(201).json({
      status: "success",
      message: "Movie added successfully",
      data: newMovie,
    });

    console.log("req.body:", req.body);
    console.log("req.file:", req.file);
  } catch (error) {
    
    if (error.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "Movie with this imbId already exists",
      });
    }
    next(error);
  }
};



const getAllMovies = async (req, res, next) => {
  try {
    const movies = await movieModel.find();

    res.status(200).json({
      status: "success",
      message: "Movies retrieved successfully",
      count: movies.length,
      data: movies
    });
  } catch (error) {
    next(error);
  }
};

const getMovieById = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    const movie = await movieModel.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        status: "error",
        message: "Movie not found in database",
      });
    }

    // Helper function to normalize array fields
    const normalizeArrayField = (field, fieldName) => {
      if (!field) return [];
      if (Array.isArray(field)) {
        return field
          .map((item) => String(item).trim())
          .filter((item) => item && item !== "data");
      }
      if (typeof field === "string") {
        try {
          const parsed = JSON.parse(field);
          if (Array.isArray(parsed)) {
            return parsed
              .map((item) => String(item).trim())
              .filter((item) => item && item !== "data");
          }
        } catch (e) {
          return field
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item && item !== "data");
        }
      }
      console.warn(`Warning: Invalid ${fieldName} format for movie ${movie._id}:`, field);
      return [];
    };

    // Transform movie data with description included
    const transformedMovie = {
      _id: movie._id.toString(),
      imbId: movie.imbId,
      originalTitle: movie.originalTitle || "",
      description: movie.description || "", // ADD THIS LINE
      primaryImage: movie.primaryImage || null,
      trailer: movie.trailer || null,
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString() : null,
      countriesOfOrigin: normalizeArrayField(movie.countriesOfOrigin, "countriesOfOrigin"),
      spokenLanguages: normalizeArrayField(movie.spokenLanguages, "spokenLanguages"),
      filmingLocations: normalizeArrayField(movie.filmingLocations, "filmingLocations"),
      productionCompanies: movie.productionCompanies || [],
      genres: normalizeArrayField(movie.genres, "genres"),
      subGenres: normalizeArrayField(movie.subGenres, "subGenres"),
      isAdult: movie.isAdult || false,
      averageRating: movie.averageRating || 0,
      createdAt: movie.createdAt ? new Date(movie.createdAt).toISOString() : null,
    };

    res.status(200).json({
      status: "success",
      message: "Movie retrieved successfully",
      data: transformedMovie,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Invalid movie ID format",
    });
  }
};


const updateMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    let updateData = { ...req.body };

  
    if (req.file) {
      updateData.primaryImage = req.file.path;
    }

    const updatedMovie = await movieModel.findOneAndUpdate(
      { imbId: movieId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({
        status: "error",
        message: "Movie not found in database"
      });
    }

    res.status(200).json({
      status: "success",
      message: "Movie updated successfully",
      data: updatedMovie
    });
  } catch (error) {
    next(error);
  }
};


const deleteMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    const deletedMovie = await movieModel.findOneAndDelete({ imbId: movieId });

    if (!deletedMovie) {
      return res.status(404).json({
        status: "error",
        message: "Movie not found in database"
      });
    }

    res.status(200).json({
      status: "success",
      message: "Movie deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};



const searchMovies = async (req, res, next) => {
  try {
    const {
      keyword,
      genres,
      releaseYearMin,
      releaseYearMax,
      minRating,
      maxRating,
      isAdult,
      sortBy,
      sortOrder,
      limit,
      page
    } = req.query;

    
    let query = {};

    
  

    if (keyword) {
      const cleanedKeyword = keyword.trim().replace(/\s+/g, ' ').replace(/[.*+?^${}()|[\]\\]/g, () => '\\$&').toLowerCase();
      if (cleanedKeyword.length) {
        query.$or = [
          { originalTitle: { $regex: cleanedKeyword, $options: 'i' } },
          { imbId: { $regex: cleanedKeyword, $options: 'i' } },
          { genres: { $regex: cleanedKeyword, $options: 'i' } }
        ];
      }
    }

    
    if (genres) {
      const genresList = genres.split(',').map(g => g.trim().toLowerCase()).filter(g => g);
      if (genresList.length > 0) {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { genres: { $in: genresList } }, 
            { subGenres: { $in: genresList } }, 
            { genres: { $regex: genresList.join('|'), $options: 'i' } }, 
            { subGenres: { $regex: genresList.join('|'), $options: 'i' } } 
          ]
        });
      }
    }

    
    if (releaseYearMin || releaseYearMax) {
      query.releaseDate = {};
      if (releaseYearMin) {
        const minYear = parseInt(releaseYearMin);
        if (!isNaN(minYear)) {
          query.releaseDate.$gte = new Date(`${minYear}-01-01T00:00:00.000Z`);
        }
      }
      if (releaseYearMax) {
        const maxYear = parseInt(releaseYearMax);
        if (!isNaN(maxYear)) {
          query.releaseDate.$lte = new Date(`${maxYear}-12-31T23:59:59.999Z`);
        }
      }
    }

    
    if (minRating || maxRating) {
      query.averageRating = {};
      if (minRating) {
        const min = parseFloat(minRating);
        if (!isNaN(min)) {
          query.averageRating.$gte = min;
        }
      }
      if (maxRating) {
        const max = parseFloat(maxRating);
        if (!isNaN(max)) {
          query.averageRating.$lte = max;
        }
      }
    }

    
    if (isAdult !== undefined) {
      query.isAdult = isAdult === 'true';
    }

    
    const currentPage = parseInt(page) || 1;
    const moviesPerPage = parseInt(limit) || 25;
    const skip = (currentPage - 1) * moviesPerPage;

    
    let sort = {};
    if (sortBy) {
      switch (sortBy) {
        case 'releaseDate':
          sort.releaseDate = sortOrder === 'desc' ? -1 : 1;
          break;
        case 'originalTitle':
          sort.originalTitle = sortOrder === 'asc' ? 1 : -1;
          break;
        case 'averageRating':
          sort.averageRating = sortOrder === 'desc' ? -1 : 1;
          break;
        default:
          sort.releaseDate = -1;
          break;
      }
    } else {
      sort.releaseDate = -1;
    }

    
    console.log('Search Query:', JSON.stringify(query, null, 2));
    console.log('Sort Configuration:', sort);
    console.log('Sort Parameters - sortBy:', sortBy, 'sortOrder:', sortOrder);
    console.log('Pagination:', { currentPage, moviesPerPage, skip });

    
    const totalMovies = await movieModel.countDocuments(query).catch(err => {
      console.error('Error counting documents:', err);
      throw new Error('Database query failed: countDocuments');
    });

    
    let queryBuilder = movieModel
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(moviesPerPage)
      .lean()
      .select('_id originalTitle primaryImage averageRating releaseDate description genres subGenres isAdult runtime');

    
    if (sortBy === 'originalTitle') {
      queryBuilder = queryBuilder.collation({ 
        locale: 'en', 
        strength: 2, 
        numericOrdering: true 
      });
    }

    const movies = await queryBuilder.catch(err => {
      console.error('Error executing query:', err);
      throw new Error('Database query failed: find');
    });

    
    console.log('First 5 sorted movies:', movies.slice(0, 5).map(m => ({
      _id: m._id,
      originalTitle: m.originalTitle,
      releaseDate: m.releaseDate,
      averageRating: m.averageRating,
      sortField: sortBy === 'releaseDate' ? m.releaseDate : 
                 sortBy === 'originalTitle' ? m.originalTitle : 
                 sortBy === 'averageRating' ? m.averageRating : 'default'
    })));

    
  const transformedMovies = movies.map((movie) => {
  
  const normalizeArrayField = (field, fieldName) => {
    if (!field) return [];
    if (Array.isArray(field)) {
      return field
        .map((item) => String(item).trim())
        .filter((item) => item && item !== "data");
    }
    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => String(item).trim())
            .filter((item) => item && item !== "data");
        }
      } catch (e) {
        return field
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item && item !== "data");
      }
    }
    console.warn(`Warning: Invalid ${fieldName} format for movie ${movie._id}:`, field);
    return [];
  };

  
  let formattedReleaseDate = null;
  if (movie.releaseDate) {
    if (movie.releaseDate instanceof Date) {
      formattedReleaseDate = movie.releaseDate.toISOString();
    } else if (typeof movie.releaseDate === "string") {
      const parsedDate = new Date(movie.releaseDate);
      if (!isNaN(parsedDate.getTime())) {
        formattedReleaseDate = parsedDate.toISOString();
      } else {
        console.warn(`Invalid releaseDate format for movie ${movie._id}: ${movie.releaseDate}`);
      }
    } else {
      console.warn(`Unexpected releaseDate type for movie ${movie._id}: ${typeof movie.releaseDate}`);
    }
  }

  return {
    _id: movie._id ? movie._id.toString() : null,
    imbId: movie._id ? movie._id.toString() : null,
    originalTitle: movie.originalTitle || "",
    primaryImage: movie.primaryImage || null,
    averageRating: movie.averageRating || 0,
    releaseDate: formattedReleaseDate,
    description: movie.description || "",
    genres: normalizeArrayField(movie.genres, "genres"),
    subGenres: normalizeArrayField(movie.subGenres, "subGenres"),
    countriesOfOrigin: normalizeArrayField(movie.countriesOfOrigin, "countriesOfOrigin"),
    spokenLanguages: normalizeArrayField(movie.spokenLanguages, "spokenLanguages"),
    filmingLocations: normalizeArrayField(movie.filmingLocations, "filmingLocations"),
    isAdult: movie.isAdult || false,
    runtime: movie.runtime || 0,
  };
}).filter((movie) => movie._id !== null);

    
    const totalPages = Math.ceil(totalMovies / moviesPerPage);

    
    console.log('Movies found:', transformedMovies.length);
    console.log('Total movies in database:', totalMovies);
    console.log('Sort verification - First 3 transformed movies:', transformedMovies.slice(0, 3).map(m => ({
      title: m.originalTitle,
      releaseDate: m.releaseDate,
      rating: m.averageRating,
      sortApplied: `${sortBy}-${sortOrder}`
    })));

    res.status(200).json({
      status: 'success',
      message: 'Movies retrieved successfully',
      count: transformedMovies.length,
      totalMovies,
      totalPages,
      currentPage,
      sortApplied: {
        sortBy: sortBy || 'releaseDate',
        sortOrder: sortOrder || 'desc',
        sortDescription: getSortDescription(sortBy, sortOrder)
      },
      data: transformedMovies,
      pagination: {
        currentPage,
        totalPages,
        moviesPerPage,
        totalMovies
      }
    });
  } catch (error) {
    console.error('Error in searchMovies:', error.message, error.stack);
    res.status(500).json({
      status: 'error',
      message: `Failed to search movies: ${error.message}`,
      error: error.message
    });
  }
};


function getSortDescription(sortBy, sortOrder) {
  if (!sortBy) return 'Latest Release (default)';
  
  const descriptions = {
    'releaseDate-desc': 'Latest Release (Most recent first: 2024, 2023, 2022...)',
    'releaseDate-asc': 'Oldest Release (Oldest first: 1995, 1998, 2001...)',
    'originalTitle-asc': 'Title A-Z (Alphabetical ascending: A, B, C...)',
    'originalTitle-desc': 'Title Z-A (Alphabetical descending: Z, Y, X...)',
    'averageRating-desc': 'Highest Rating (Highest first: 9.8, 9.2, 8.5...)',
    'averageRating-asc': 'Lowest Rating (Lowest first: 3.2, 4.0, 5.1...)'
  };
  
  return descriptions[`${sortBy}-${sortOrder}`] || `${sortBy} ${sortOrder}`;
}


module.exports = {
  addMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
  searchMovies
};
