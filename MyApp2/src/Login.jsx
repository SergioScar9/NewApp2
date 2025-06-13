import React, { useState } from "react";
import { FaCircleChevronLeft } from "react-icons/fa6";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Pulisci l'errore quando l'utente inizia a digitare
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;

      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        if (!formData.name || formData.name.trim() === "") {
          setError("Il nome è obbligatorio per la registrazione");
          setLoading(false);
          return;
        }
        console.log(" Tentativo registrazione con:", {
          name: formData.name,
          email: formData.email,
          password: formData.password ? "***" : "MANCANTE",
        });
        result = await register(
          formData.name.trim(),
          formData.email.trim(),
          formData.password
        );
      }

      if (result.success) {
        console.log(" Autenticazione riuscita, reindirizzamento...");
        navigate("/creaStanza");
      } else {
        setError(result.message || "Errore durante l'autenticazione");
      }
    } catch (error) {
      console.error(" Errore imprevisto:", error);
      setError("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({
      email: "",
      password: "",
      name: "",
    });
  };

  return (
    <div className="min-vh-100 d-flex align-items-center  py-5 ">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={8} md={8} lg={8} xl={6}>
            <Card className="shadow-lg border-0 bg-blur rounded-5">
              <Card.Body className="p-4 p-md-5  rounded-5">
                <a className="color-button " href="/">
                  <FaCircleChevronLeft
                    className="rounded-circle mb-4 "
                    size={38}
                  />
                </a>
                <div className="d-flex flex-column align-items-center justify-content-center mb-4">
                  <h2 className="fw-bold text-color ">
                    {isLogin
                      ? "🎬 Accedi al tuo account"
                      : "🎬 Crea un nuovo account"}
                  </h2>
                  <p className="text-muted small text-color">
                    {isLogin ? "Non hai un account?" : "Hai già un account?"}
                    <Button
                      variant="link"
                      className="p-1 ms-1 text-decoration-none fw-medium"
                      onClick={toggleMode}
                      style={{ fontSize: "inherit" }}
                    >
                      {isLogin ? "Registrati qui" : "Accedi qui"}
                    </Button>
                  </p>
                </div>

                <Form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium text-color">
                        Nome completo
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="Inserisci il tuo nome completo"
                        value={formData.name || ""}
                        onChange={handleChange}
                        required={!isLogin}
                        className="py-2"
                      />
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium text-color">
                      Indirizzo email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Inserisci la tua email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      className="py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium text-color">
                      Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Inserisci la tua password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                      className="py-2"
                    />
                  </Form.Group>

                  {error && (
                    <Alert variant="danger" className="py-2">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                    </Alert>
                  )}

                  <div className="d-grid">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading}
                      className="py-2 fw-medium"
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            className="me-2"
                          />
                          {isLogin
                            ? "Accesso in corso..."
                            : "Registrazione in corso..."}
                        </>
                      ) : (
                        <>
                          {isLogin ? (
                            <>
                              <i className="bi bi-box-arrow-in-right me-2"></i>
                              Accedi
                            </>
                          ) : (
                            <>
                              <i className="bi bi-person-plus me-2"></i>
                              Registrati
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </Form>

                <div className="text-center mt-3">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => navigate("/")}
                    className="text-decoration-none"
                  >
                    <i className="bi bi-house me-1"></i>
                    Torna alla Home
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
