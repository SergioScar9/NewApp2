import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import "./cardHome.css";
import BasicExample from "./cardHome";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useAuth } from "./AuthContext";

const API_URL = "http://localhost:3004";

function CreaStanza() {
  const [roomCode, setRoomCode] = useState("");
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();

  //  Verifica autenticazione
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log(" Utente non autenticato, reindirizzo al login");
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🏠 Creando stanza per utente:", user?.name);

      const response = await axios.post(`${API_URL}/create-room`, {});

      console.log(" Risposta backend:", response.data);

      if (response.data.success) {
        setCurrentRoom(response.data.roomCode);
        console.log(" Stanza creata:", response.data.roomCode);
      } else {
        setError("Errore nella creazione della stanza");
      }
    } catch (error) {
      console.error(" Errore creazione stanza:", error);
      let errorMessage = "Errore nella creazione della stanza";

      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = "Sessione scaduta, effettua di nuovo il login";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    try {
      setLoading(true);
      setError("");

      if (!roomCode.trim()) {
        setError("Inserisci un codice stanza valido");
        setLoading(false);
        return;
      }

      console.log("🚪 Entrando nella stanza:", roomCode.toUpperCase());

      const response = await axios.post(`${API_URL}/join-room`, {
        roomCode: roomCode.toUpperCase(),
      });

      console.log("✅ Risposta join-room:", response.data);

      if (response.data.success) {
        setCurrentRoom(roomCode.toUpperCase());
        console.log(" Entrato nella stanza:", roomCode.toUpperCase());
      } else {
        setError(response.data.message || "Errore nell'entrare nella stanza");
      }
    } catch (error) {
      console.error(" Errore join stanza:", error);
      let errorMessage = "Codice stanza non valido";

      if (error.response?.status === 404) {
        errorMessage = "Stanza non trovata";
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        errorMessage = "Sessione scaduta, effettua di nuovo il login";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Naviga alla stanza quando viene creata/joined
  useEffect(() => {
    if (currentRoom) {
      console.log("🚀 Navigando alla stanza:", currentRoom);
      navigate(`/stanzaScelta/${currentRoom}`);
    }
  }, [currentRoom, navigate]);

  // Mostra loading se non autenticato
  if (!isAuthenticated()) {
    return (
      <div className="text-center mt-5">
        <h3>⚠️ Verificando autenticazione...</h3>
      </div>
    );
  }

  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 text-center mt-5 mb-5 p-3 bg-blur rounded-4">
            <h2 className="text-color">👋 Benvenuto, {user?.name}!</h2>
            <p className=" fs-2 text-color">
              Crea una nuova stanza o unisciti a una esistente
            </p>
          </div>
        </div>

        <div className="row justify-content-center g-4">
          <div className="col-lg-7 col-xl-6 col-xxl-6">
            <div className="card p-5">
              <h4 className="text-center mb-4">🎬 Gestione Stanze</h4>

              {error && (
                <div className="alert alert-danger" role="alert">
                  ⚠️ {error}
                </div>
              )}

              <div className="mb-4">
                <h5>🏠 Crea una nuova stanza</h5>
                <button
                  className="btn btn-primary w-100"
                  onClick={handleCreateRoom}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Creando...
                    </>
                  ) : (
                    "🏠 Crea Stanza"
                  )}
                </button>
              </div>

              <hr />

              {/* Unisciti a Stanza */}
              <div>
                <h5>🚪 Unisciti a una stanza</h5>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Inserisci codice stanza (es: ABC123)"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    disabled={loading}
                    maxLength={6}
                  />
                </div>
                <button
                  className="btn btn-success w-100"
                  onClick={handleJoinRoom}
                  disabled={loading || !roomCode.trim()}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Entrando...
                    </>
                  ) : (
                    "🚪 Entra nella Stanza"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreaStanza;
