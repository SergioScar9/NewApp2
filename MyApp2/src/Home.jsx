import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import "./assets/home.css";
import Login from "./Login";

function Home() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [room, setRoom] = useState({
    nomeStanza: "",
    codiceStanza: "",
  });
  const [joinRoom, setJoinRoom] = useState({
    nomeStanza: "",
    codiceStanza: "",
  });
  const navigate = useNavigate("/stanzaScelta");
  const navigateToLogin = useNavigate("/login");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3002/register", name, email, password)
      .then((result) => console.log(result));
    navigate("/login").catch((err) => console.log(err));
  };

  return (
    <div className="mt-5">
      <Card className="text-center card-hero rounded-4">
        <Card.Header>SKIP o WATCH fai la tua scelta</Card.Header>
        <Card.Body>
          <Card.Title>
            Crea la tua stanza,invita i tuoi amici e scegli il film da guardare
          </Card.Title>
          <Card.Text>
            Con il nostro servizio puoi creare stanze virtuali dove puoi
            scegliere film e serie TV con i tuoi amici, anche se siete lontani.
            Basta creare una stanza e far Match su cosa guardare.
          </Card.Text>
          <div className="d-flex flex-column flex-md-row gap-2 justify-content-center">
            <Button
              onClick={() => {
                navigateToLogin("/login");
              }}
            >
              Registrati/Login
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
export default Home;
