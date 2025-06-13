import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Singup from "./Singup";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import "/src/App.css";
import HomePage from "./HomePage";
import BasicExample from "./creaStanza";
import CreaStanza from "./creaStanza";
import StanzaScelta from "./StanzaScelta";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Singup />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/creaStanza"
            element={
              <ProtectedRoute>
                <CreaStanza />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stanzaScelta/:roomCode"
            element={
              <ProtectedRoute>
                <StanzaScelta />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
