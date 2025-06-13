import { useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../src/App.css";
import { FaCircleChevronLeft } from "react-icons/fa6";

function Singup() {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("https://newapp2-production.up.railway.app", {
        name,
        email,
        password,
      })
      .then(() => {
        alert("Registrazione avvenuta con successo");
        navigate("/login");
      })
      .catch((error) => {
        if (error.response.status === 409) {
          alert("Email già registrata, prova con un'altra");
        } else if (error.response.status === 400) {
          alert(error.response.data);
          console.error(error);
        }
      });
  };

  return (
    <div className="container">
      <div className="row">
        <div className="mt-5 ">
          <a className="color-button " href="/">
            <FaCircleChevronLeft className="rounded-circle" size={48} />
          </a>
        </div>
        <div className="d-flex justify-content-center align-items-center mt-5 vh-100  ">
          <div className=" bg-blur p-3 rounded col-12 col-md-8 col-lg-8 col-xl-8 col-xxl-8 border border-1 ">
            <h2 className="text-color fs-1 text-center"> Registrati</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="fs-5 fw-semibold text-color">Nome</label>
                <input
                  type="text"
                  placeholder="Inserisci nome"
                  autoComplete="off"
                  name="email"
                  className="form-control rounded-3"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="fs-5 fw-semibold text-color">Email</label>
                <input
                  type="email"
                  placeholder="Inserisci email"
                  autoComplete="off"
                  name="email"
                  className="form-control rounded-3"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="fs-5 fw-semibold text-color">Password</label>
                <input
                  type="password"
                  placeholder="Inserisci password"
                  name="password"
                  className="form-control rounded-3"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-succes w-100 rounded-3 mb-3"
              >
                {" "}
                Registrati
              </button>
              <Link
                to="/login"
                className="btn btn-default borfer w-100 bg-light rounded-3 text-decoration-none mb-2 custom-btn"
              >
                Login
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Singup;
