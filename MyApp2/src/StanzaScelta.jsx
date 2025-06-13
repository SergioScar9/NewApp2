import { useEffect, useState, useRef } from "react";
import { FcLike } from "react-icons/fc";
import { useNavigate, useParams } from "react-router-dom";
import { FaCircleChevronLeft } from "react-icons/fa6";
import { LuOctagonX } from "react-icons/lu";
import axios from "axios";
import { useAuth } from "./AuthContext";
import MatchCard from "./MatchCard";

const API_URL = "https://newapp2-production.up.railway.app";

const StanzaScelta = () => {
  const [films, setFilms] = useState();
  const [genresId, setGenresId] = useState("");
  const [likedMovies, setLikedMovies] = useState([]);
  const [matchedMovies, setMatchedMovies] = useState([]);

  const [showMatchCard, setShowMatchCard] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [currentMatchMovie, setCurrentMatchMovie] = useState(null);

  //  polling dei match
  const [knownMatches, setKnownMatches] = useState(new Set());
  const pollingInterval = useRef(null);

  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id;

  useEffect(() => {
    if (genresId) {
      fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=e9c9f58df446627aea3404ef2d52701f&with_genres=${genresId}`
      )
        .then((response) => {
          if (!response.ok) throw new Error("Il server non risponde");
          return response.json();
        })
        .then((data) => {
          console.log("🎬 Film caricati:", data);
          setFilms(data);
        });
    }
  }, [genresId]);

  useEffect(() => {
    if (roomCode && currentUserId) {
      loadUserMovies();
      startMatchPolling();
    }

    // Cleanup quando il componente viene smontato
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [roomCode, currentUserId]);

  //  Polling per controllare nuovi match
  const startMatchPolling = () => {
    console.log("🔄 Avvio polling per match...");

    checkForNewMatches();

    // controlla ogni 3 secondi
    pollingInterval.current = setInterval(() => {
      checkForNewMatches();
    }, 3000);
  };

  //Controlla se ci sono nuovi match
  const checkForNewMatches = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/room/${roomCode}/check-matches`
      );

      if (response.data.success && response.data.matches.length > 0) {
        console.log(" Match trovati dal polling:", response.data.matches);

        // Controlla se ci sono match  prima
        for (const match of response.data.matches) {
          const matchKey = `${match.movie.id}-${match.totalMatches}`;

          if (!knownMatches.has(matchKey)) {
            console.log("🆕 Nuovo match rilevato:", match.movie.title);

            // Aggiungi alla lista dei match conosciuti
            setKnownMatches((prev) => new Set([...prev, matchKey]));

            // Aggiungi ai film con match se non c'è già
            setMatchedMovies((prev) => {
              const isAlreadyMatched = prev.some(
                (m) => m.id === match.movie.id
              );
              if (!isAlreadyMatched) {
                return [...prev, match.movie];
              }
              return prev;
            });

            // MOSTRA la MatchCard per il nuovo match
            setCurrentMatch({
              hasMatch: true,
              movieTitle: match.movie.title,
              movieId: match.movie.id,
              matchingUserIds: match.matchingUserIds,
              totalMatches: match.totalMatches,
              message: match.message,
            });
            setCurrentMatchMovie(match.movie);
            setShowMatchCard(true);

            break; // Mostra un match alla volta
          }
        }
      }
    } catch (error) {
      console.error(" Errore nel polling match:", error);
    }
  };

  const loadUserMovies = async () => {
    try {
      console.log(
        "📚 Caricando film per utente:",
        currentUserId,
        "stanza:",
        roomCode
      );

      if (!roomCode) {
        console.error(" roomCode mancante");
        return;
      }

      if (!currentUserId) {
        console.error(" currentUserId mancante");
        return;
      }

      console.log(
        "🔑 Token presente:",
        !!axios.defaults.headers.common["Authorization"]
      );

      const response = await axios.get(
        `${API_URL}/room/${roomCode}/user/${currentUserId}/movies`
      );

      console.log(" Risposta caricamento film:", response.data);

      if (response.data.success) {
        setLikedMovies(response.data.movies || []);
        console.log("Film già scelti dall'utente:", response.data.movies);
      } else {
        console.error(" Errore nella risposta:", response.data.message);
      }
    } catch (error) {
      console.error(" Errore caricamento film utente:", error);

      if (error.response) {
        console.error(" Status:", error.response.status);
        console.error(" Data:", error.response.data);
        console.error(" Headers:", error.response.headers);
      } else if (error.request) {
        console.error(" Nessuna risposta dal server:", error.request);
      } else {
        console.error(" Errore setup:", error.message);
      }
    }
  };

  const handleLikeMovie = async (movie) => {
    try {
      if (likedMovies.some((m) => m.id === movie.id)) {
        alert("Hai già messo like a questo film!");
        return;
      }

      console.log(` Aggiungendo like per: ${movie.title}`);
      console.log("Dati da inviare:", {
        movie: movie,
        roomCode: roomCode,
      });

      if (!currentUserId) {
        alert("Errore: ID utente non trovato. Riprova a fare login.");
        return;
      }

      if (!roomCode) {
        alert("Errore: Codice stanza non trovato.");
        return;
      }

      const response = await axios.post(
        `${API_URL}/room/${roomCode}/user-movie`,
        {
          movie: movie,
        }
      );

      console.log("📨 Risposta dal server:", response.data);

      if (response.data.success) {
        const updatedLikes = [...likedMovies, movie];
        setLikedMovies(updatedLikes);

        if (response.data.match && response.data.match.hasMatch) {
          const matchInfo = response.data.match;

          // Aggiungi il film ai match
          setMatchedMovies((prev) => {
            const isAlreadyMatched = prev.some((m) => m.id === movie.id);
            if (!isAlreadyMatched) {
              return [...prev, movie];
            }
            return prev;
          });

          // Aggiungi ai match conosciuti per evitare duplicati dal polling
          const matchKey = `${movie.id}-${matchInfo.totalMatches}`;
          setKnownMatches((prev) => new Set([...prev, matchKey]));

          // MOSTRA MatchCard
          setCurrentMatch(matchInfo);
          setCurrentMatchMovie(movie);
          setShowMatchCard(true);

          console.log("🎉 MATCH TROVATO - Mostro MatchCard!", matchInfo);
        } else {
          console.log("👍 Film aggiunto, nessun match ancora");
          alert(` Film "${movie.title}" aggiunto ai tuoi preferiti!`);
        }
      } else {
        console.error(" Server ha risposto con success: false");
        alert(
          `Errore: ${response.data.message || "Impossibile aggiungere il film"}`
        );
      }
    } catch (error) {
      console.error(" Errore completo nel like film:", error);
      console.error(" Dettagli errore:", error.response?.data);
      console.error(" Status code:", error.response?.status);

      let errorMessage = "Errore nell'aggiungere il film ai preferiti";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = "Stanza non trovata";
      } else if (error.response?.status === 500) {
        errorMessage = "Errore del server";
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        errorMessage = "Sessione scaduta, effettua di nuovo il login";
      }

      alert(errorMessage);
    }
  };

  //  chiudere la MatchCard
  const handleCloseMatchCard = () => {
    setShowMatchCard(false);
    setCurrentMatch(null);
    setCurrentMatchMovie(null);
  };

  const handleDislikeMovie = (filmId) => {
    const film = document.getElementById(`${filmId}`);
    if (!film) return;

    console.log(`👎 Dislike per film ID: ${filmId}`);
    film.classList.add("animation");
    film.addEventListener(
      "animationend",
      () => {
        film.classList.add("d-none");
      },
      { once: true }
    );
  };

  const isMovieLiked = (movieId) => {
    return likedMovies.some((movie) => movie.id === movieId);
  };

  const isMovieMatched = (movieId) => {
    return matchedMovies.some((movie) => movie.id === movieId);
  };

  const genres = [
    { id: 28, name: "Action" },
    { id: 35, name: "Comedy" },
    { id: 18, name: "Drama" },
    { id: 27, name: "Horror" },
    { id: 14, name: "Fantasy" },
    { id: 53, name: "Thriller" },
  ];

  if (!user) {
    return (
      <div className="text-center mt-5">
        <h3>⚠️ Devi effettuare il login per accedere a questa stanza</h3>
      </div>
    );
  }

  return (
    <>
      <div className="row g-4">
        <a className="color-button" href="/">
          <FaCircleChevronLeft className="rounded-circle m-3" size={48} />
        </a>

        <div className=" bg-button  d-flex flex-column animation-2   align-items-center p-6  rounded-5  col-12 ">
          <p className="display-2 text-color ">👤 Benvenuto, {user.name}!</p>
          <h1 className=" fs-1 fw-light text-color mb-2 .p-stanza-1 ">
            Stanza: {roomCode}
          </h1>
          <p className=" text-color fw-semibold mb-4 p-stanza">
            Scegli il tuo genere preferito
          </p>

          {likedMovies.length > 0 && (
            <p className="text-white">
              ❤️ Hai scelto {likedMovies.length} film
            </p>
          )}
          {matchedMovies.length > 0 && (
            <p className="text-success fw-bold">
              🎉 {matchedMovies.length} MATCH trovati!
            </p>
          )}
        </div>

        <div className="d-flex flex-wrap justify-content-center align-items-center gap-2 mt-5 animation-2">
          {genres.map((genre) => (
            <button
              key={genre.id}
              className="rounded-4 p-2 "
              onClick={() => setGenresId(genre.id)}
              style={{
                backgroundColor: genresId === genre.id ? "#007bff" : "#6c757d",
                color: "white",
                border: "none",
              }}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {films &&
          films.results.map((film) => (
            <div
              id={`${film.id}`}
              key={film.id}
              className={`border-0 text-center d-flex flex-column justify-content-center align-items-center p-4 mt-4 bg-blur rounded-5 ${
                isMovieMatched(film.id) ? "border border-success border-3" : ""
              }`}
              style={{
                opacity: isMovieLiked(film.id) ? 0.7 : 1,
                backgroundColor: isMovieMatched(film.id)
                  ? "rgba(40, 167, 69, 0.1)"
                  : undefined,
              }}
            >
              <h2 className="display-7 text-color my-3">
                {film.title}
                {isMovieLiked(film.id) && (
                  <span className="text-success ms-2">❤️</span>
                )}
                {isMovieMatched(film.id) && (
                  <span className="text-success ms-2">🎉 MATCH!</span>
                )}
              </h2>

              <div className="d-flex flex-column justify-content-center align-items-center ">
                <img
                  className="img-thumbnail w-50 rounded-4"
                  src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
                  alt={film.title}
                />
                <div className="d-flex justify-content-between w-100 mt-2 ">
                  <p className="text-color  p-2 rounded-3">
                    Uscita: {film.release_date}
                  </p>
                  <p className="text-color  p-2 rounded-3">
                    Visualizzazioni: {film.popularity}
                  </p>
                </div>
                <div className="rounded-3 bg-blur">
                  <p className="mt-3 text-color">{film.overview}</p>
                </div>
              </div>

              <div className="d-flex flex-wrap justify-content-center align-items-center mt-3">
                <div className="d-flex flex-wrap gap-5 m-2">
                  <button
                    className="rounded-circle p-2"
                    onClick={() => handleDislikeMovie(film.id)}
                    disabled={isMovieLiked(film.id)}
                  >
                    <LuOctagonX size={35} />
                  </button>
                </div>

                <div className="d-flex flex-wrap gap-5 m-2">
                  <button
                    className="rounded-circle p-2"
                    onClick={() => handleLikeMovie(film)}
                    disabled={isMovieLiked(film.id)}
                    style={{
                      backgroundColor: isMovieLiked(film.id)
                        ? "#28a745"
                        : undefined,
                      opacity: isMovieLiked(film.id) ? 0.7 : 1,
                    }}
                  >
                    <FcLike size={35} />
                  </button>
                </div>
              </div>
            </div>
          ))}

        {matchedMovies.length > 0 && (
          <div className="mt-4 p-4 bg-success rounded text-white text-center">
            <h3>🎉 FILM CON MATCH! 🎬</h3>
            <p>Questi film sono piaciuti a più persone nella stanza:</p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              {matchedMovies.map((movie, index) => (
                <div key={index} className="bg-white text-dark p-2 rounded">
                  <strong>{movie.title}</strong>
                </div>
              ))}
            </div>
            <p className="mt-2">
              <strong>
                Ora potete scegliere uno di questi film da guardare insieme! 🍿
              </strong>
            </p>
          </div>
        )}
      </div>

      <MatchCard
        show={showMatchCard}
        onClose={handleCloseMatchCard}
        matchInfo={currentMatch}
        movie={currentMatchMovie}
      />
    </>
  );
};

export default StanzaScelta;
