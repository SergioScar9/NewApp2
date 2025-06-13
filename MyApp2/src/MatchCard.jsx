import React from "react";
import { Modal, Button } from "react-bootstrap";
import "../src/MatchCard.css";

const MatchCard = ({ show, onClose, matchInfo, movie }) => {
  if (!matchInfo || !movie) return null;

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      backdrop="static"
      className="match-modal "
    >
      <Modal.Body className="p-0 position-relative bg-img3 rounded-2 ">
        <div className="text-center p-4 position-relative  ">
          <div className="mb-4">
            <h1 className="display-3 mb-2">🎉</h1>
            <h2 className="text-primary fw-bold mb-2">È UN MATCH!</h2>
          </div>

          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card shadow-lg border-0 rounded-4 overflow-hidden match-card">
                <div className="position-relative">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="card-img-top"
                    style={{ height: "300px", objectFit: "cover" }}
                  />
                  <div className="position-absolute top-0 end-0 m-3">
                    <span className="badge bg-success fs-6 px-3 py-2 rounded-pill">
                      ⭐ MATCH
                    </span>
                  </div>
                </div>

                <div className="card-body p-4">
                  <h3 className="card-title fw-bold text-center mb-3">
                    {movie.title}
                  </h3>

                  <div className="row text-center mb-3">
                    <div className="col-6">
                      <small className="text-muted d-block">Anno</small>
                      <span className="fw-semibold">
                        {movie.release_date
                          ? new Date(movie.release_date).getFullYear()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Popolarità</small>
                      <span className="fw-semibold">
                        {Math.round(movie.popularity)}
                      </span>
                    </div>
                  </div>

                  {movie.overview && (
                    <div className="mb-4">
                      <small className="text-muted d-block mb-2">Trama</small>
                      <p
                        className="text-dark small"
                        style={{ maxHeight: "80px", overflow: "hidden" }}
                      >
                        {movie.overview.length > 120
                          ? movie.overview.substring(0, 120) + "..."
                          : movie.overview}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={onClose}
              className="px-5 py-2 rounded-pill"
            >
              <span className="me-2">✨</span>
              Continua a scegliere film
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default MatchCard;
