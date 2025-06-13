import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3004";

const AuthContext = createContext();

// Hook context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato dentro AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configura axios per includere automaticamente il token
  useEffect(() => {
    // Recupera il token dal localStorage all'avvio
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));

      // Configura l'header di default per axios
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
    }

    setLoading(false);
  }, []);

  // Interceptor per gestire automaticamente i token scaduti
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log("🔐 Token scaduto o non valido, logout automatico");
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      console.log("🔐 Tentativo di login per:", email);

      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;

        // Salva i dati
        setToken(newToken);
        setUser(userData);

        // Salva nel localStorage
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Configura axios per le prossime richieste
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        console.log(" Login riuscito per:", userData.name);
        return { success: true, user: userData };
      } else {
        console.log(" Login fallito:", response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error(" Errore durante il login:", error);
      const message = error.response?.data?.message || "Errore di connessione";
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log("📝 Tentativo di registrazione per:", email);

      const response = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
      });

      console.log(" Risposta completa dal server:", response);
      console.log(" Status della risposta:", response.status);
      console.log(" Dati della risposta:", response.data);

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;

        // Salva i dati
        setToken(newToken);
        setUser(userData);

        // Salva nel localStorage
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Configura axios per le prossime richieste
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        console.log("✅ Registrazione riuscita per:", userData.name);
        return { success: true, user: userData };
      } else {
        console.log("❌ Registrazione fallita:", response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("🚨 Errore durante la registrazione:", error);
      console.error("🚨 Response error:", error.response);
      console.error("🚨 Response data:", error.response?.data);
      console.error("🚨 Response status:", error.response?.status);

      let message = "Errore di connessione";

      if (error.response?.status === 409) {
        message =
          "Email già registrata. Prova a fare login o usa un'altra email.";
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      return { success: false, message };
    }
  };

  const logout = () => {
    console.log("👋 Logout utente:", user?.name);

    setToken(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete axios.defaults.headers.common["Authorization"];
  };

  const isAuthenticated = () => {
    return !!(token && user);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
