import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_KEY = "14ea6ec8";
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPopularMovies();
  }, []);

  const fetchPopularMovies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const responses = await Promise.all([
        axios.get(`${BASE_URL}&s=avengers`),
        axios.get(`${BASE_URL}&s=batman`),
        axios.get(`${BASE_URL}&s=star wars`),
      ]);
      const allMovies = responses.flatMap((response) =>
        response.data.Search ? response.data.Search : []
      );
      setMovies(allMovies.slice(0, 12));
    } catch (err) {
      setError("Failed to fetch popular movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const searchMovies = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}&s=${searchTerm}`);
      if (response.data.Response === "True") {
        setMovies(response.data.Search);
      } else {
        setMovies([]);
        setError(response.data.Error || "No movies found.");
      }
    } catch (err) {
      setError("Failed to search movies. Please try again later.");
    } finally {
      setIsLoading(false);
      setSearchTerm("");

    }
  };

  const fetchMovieDetails = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}&i=${id}&plot=full`);
      if (response.data.Response === "True") {
        setSelectedMovie(response.data);
      } else {
        setError("Movie details not available.");
      }
    } catch (err) {
      setError("Failed to load movie details.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedMovie(null);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Movie Search</h1>
        <form onSubmit={searchMovies} className="search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a movie..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </header>

      <main className="main-content">
        {isLoading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}

        {!isLoading && !error && (
          <>
            <h2>{searchTerm ? "Search Results" : "Popular Movies"}</h2>
            <div className="movie-grid">
              {movies.length > 0 ? (
                movies.map((movie) => (
                  <div key={movie.imdbID} className="movie-card">
                    <img
                      src={
                        movie.Poster !== "N/A"
                          ? movie.Poster
                          : "https://via.placeholder.com/300x450?text=No+Poster"
                      }
                      alt={movie.Title}
                      className="movie-poster"
                      onClick={() => fetchMovieDetails(movie.imdbID)}
                    />
                    <div className="movie-info">
                      <h3 className="movie-title">{movie.Title}</h3>
                      <p>{movie.Year}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-movies">
                  No movies found. Try a different search.
                </p>
              )}
            </div>
          </>
        )}
      </main>

      {selectedMovie && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>
              ×
            </button>
            {isLoading ? (
              <div className="loading">Loading details...</div>
            ) : (
              <div className="modal-body">
                <div className="modal-poster">
                  <img
                    src={
                      selectedMovie.Poster !== "N/A"
                        ? selectedMovie.Poster
                        : "https://via.placeholder.com/300x450?text=No+Poster"
                    }
                    alt={selectedMovie.Title}
                  />
                </div>
                <div className="modal-details">
                  <h2>
                    {selectedMovie.Title} ({selectedMovie.Year})
                  </h2>
                  <p>
                    <strong>Genre:</strong> {selectedMovie.Genre || "N/A"}
                  </p>
                  <p>
                    <strong>Plot:</strong> {selectedMovie.Plot || "N/A"}
                  </p>
                  <p>
                    <strong>Rating:</strong> {selectedMovie.imdbRating || "N/A"}
                    /10 (IMDb)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
