const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const EmployeeModel = require("./models/Employee");
const RoomSchema = require("./models/RoomSchema");
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://sergioscar94:sergios94@cluster0.i4svkus.mongodb.net/";
const PORT = process.env.PORT || 3004;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5177",
      "https://new-app2-dhk1.vercel.app",
    ],
    credentials: true,
  })
);

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "8f9e2c1a4b6d3e7f9g0h2i5j8k1l4m7n0p3q6r9s2t5u8v1w4x7y0z3a6b9c2d5e8f";

mongoose.connect(MONGODB_URI);

//  MIDDLEWARE per verificare JWT
const authenticateToken = (req, res, next) => {
  console.log("🔒 Middleware auth - Headers:", req.headers.authorization);

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log(
    "🔑 Token estratto:",
    token ? token.substring(0, 20) + "..." : "NESSUN TOKEN"
  );

  if (!token) {
    console.log(" Token mancante");
    return res.status(401).json({ success: false, message: "Token mancante" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log(" Token non valido:", err.message);
      return res
        .status(403)
        .json({ success: false, message: "Token non valido: " + err.message });
    }
    console.log("Token valido per utente:", user.name);
    req.user = user; // Salva i dati dell'utente nella request
    next();
  });
};

app.get("/test", (req, res) => {
  res.json("Funziona!");
});

//  LOGIN  con JWT
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trova l'utente
    const user = await EmployeeModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email o password non corretti",
      });
    }

    // Verifica password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email o password non corretti",
      });
    }

    // Genera JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login avvenuto con successo",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Errore login:", error);
    res.status(500).json({
      success: false,
      message: "Errore del server",
    });
  }
});

app.post("/register", async (req, res) => {
  console.log("🔥 INIZIO REGISTRAZIONE");
  console.log("📦 Body ricevuto:", req.body);

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log(" Campi mancanti!");
      return res.status(400).json({
        success: false,
        message: "Tutti i campi sono obbligatori",
      });
    }

    console.log(" Campi OK, controllo email esistente...");

    // Controlla se l'email esiste già
    const existingUser = await EmployeeModel.findOne({ email });
    if (existingUser) {
      console.log(" Email già esistente");
      return res.status(409).json({
        success: false,
        message: "Email già registrata",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea nuovo utente con password hashata
    const newEmployee = new EmployeeModel({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
    });

    const savedUser = await newEmployee.save();
    console.log(" Utente salvato:", savedUser._id);

    console.log("🔑 Genero JWT...");

    const token = jwt.sign(
      {
        userId: savedUser._id,
        email: savedUser.email,
        name: savedUser.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(" JWT generato:", token.substring(0, 20) + "...");

    const responseData = {
      success: true,
      message: "Registrazione avvenuta con successo",
      token: token,
      user: {
        id: savedUser._id.toString(),
        name: savedUser.name,
        email: savedUser.email,
      },
    };

    console.log(" Invio risposta:", responseData);

    res.status(201).json(responseData);
  } catch (error) {
    console.error(" ERRORE COMPLETO:", error);
    console.error(" Stack trace:", error.stack);

    res.status(500).json({
      success: false,
      message: "Errore del server: " + error.message,
    });
  }
});

// ROUTE  DI ESEMPIO
app.get("/profile", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Profilo utente",
    user: req.user,
  });
});

// CREA ROOM PROTETTA
app.post("/create-room", authenticateToken, async (req, res) => {
  console.log("📩 POST /create-room ricevuta da utente:", req.user.name);

  const { users } = req.body;
  console.log(req.user.userId);

  try {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom = new RoomSchema({
      code: roomCode,
      users: users || [req.user.userId],
      userMovies: [],
      selectedMovies: [],
      createdBy: req.user.userId,
    });

    await newRoom.save();
    console.log("Room salvata:", newRoom);

    res.json({
      success: true,
      roomCode: roomCode,
      message: "Stanza creata con successo",
    });
  } catch (error) {
    console.error("Errore creazione stanza:", error);
    res.status(500).json({
      success: false,
      message: "Errore del server",
    });
  }
});

// JOIN ROOM PROTETTA
app.post("/join-room", authenticateToken, async (req, res) => {
  const { roomCode } = req.body;
  const userId = req.user.userId;

  try {
    const room = await RoomSchema.findOne({ code: roomCode });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Stanza non trovata",
      });
    }

    if (!room.users.includes(userId)) {
      console.log("Nuovo utente nella stanza:", req.user.name);
      room.users.push(userId);
      await room.save();
    }

    res.json({
      success: true,
      room: room,
      message: "Entrato nella stanza con successo",
    });
  } catch (error) {
    console.error("Errore join-room:", error);
    res.status(500).json({
      success: false,
      message: "Errore server",
    });
  }
});

//  aggiungere film e controllare match
app.post("/room/:code/user-movie", authenticateToken, async (req, res) => {
  console.log("🔥 ENDPOINT MATCH CORRETTO!");

  const { code } = req.params;
  const { movie } = req.body;
  const userId = req.user.userId;

  try {
    const room = await RoomSchema.findOne({ code: code });

    if (!room) {
      console.log(" Stanza non trovata");
      return res.status(404).json({
        success: false,
        message: "Stanza non trovata",
      });
    }

    if (!room.users.includes(userId)) {
      console.log(" Utente non nella stanza");
      return res.status(403).json({
        success: false,
        message: "Non sei autorizzato ad accedere a questa stanza",
      });
    }

    if (!room.userMovies) {
      room.userMovies = [];
    }

    // Trova o crea l'entry per questo utente
    let userMovieEntry = room.userMovies.find(
      (entry) => entry.userId === userId
    );
    if (!userMovieEntry) {
      userMovieEntry = { userId, movies: [] };
      room.userMovies.push(userMovieEntry);
      console.log("🆕 Creata nuova entry per utente:", req.user.name);
    }

    //  CONTROLLO: Solo l'utente CORRENTE ha già questo film?
    const alreadyLikedByCurrentUser = userMovieEntry.movies.some(
      (m) => m.id === movie.id
    );

    if (alreadyLikedByCurrentUser) {
      console.log("L'utente corrente ha già questo film nei preferiti");
      return res.json({
        success: false,
        message: "Hai già aggiunto questo film ai tuoi preferiti",
      });
    }

    //  CONTROLLA chi ha già questo film (PRIMA di aggiungere)
    console.log(" Controllo match con altri utenti...");
    console.log(
      " Tutti gli userMovies:",
      room.userMovies.map((entry) => ({
        userId: entry.userId,
        moviesCount: entry.movies.length,
        movieIds: entry.movies.map((m) => m.id),
      }))
    );

    const otherUsersWithThisMovie = room.userMovies.filter((entry) => {
      const isDifferentUser = entry.userId !== userId;
      const hasThisMovie = entry.movies.some((m) => m.id === movie.id);

      console.log(
        `👤 User ${entry.userId}: isDifferent=${isDifferentUser}, hasMovie=${hasThisMovie}`
      );

      return isDifferentUser && hasThisMovie;
    });

    console.log(
      " Altri utenti che hanno già questo film:",
      otherUsersWithThisMovie.length
    );
    console.log(
      " Lista utenti con match:",
      otherUsersWithThisMovie.map((entry) => entry.userId)
    );

    //  AGGIUNGI il film ai preferiti dell'utente corrente
    userMovieEntry.movies.push(movie);
    console.log(" Film aggiunto ai preferiti di:", req.user.name);

    //  SALVA le modifiche nel database
    await room.save();
    console.log(" Stanza salvata con successo");

    // CONTROLLA SE C'È MATCH
    if (otherUsersWithThisMovie.length > 0) {
      const totalMatches = otherUsersWithThisMovie.length + 1; // Include l'utente corrente

      const matchInfo = {
        hasMatch: true,
        movieTitle: movie.title,
        movieId: movie.id,
        matchingUserIds: [
          ...otherUsersWithThisMovie.map((entry) => entry.userId),
          userId,
        ],
        totalMatches: totalMatches,
        message: `🎉 MATCH! ${totalMatches} persone hanno scelto "${movie.title}"!`,
      };

      console.log("🎉 MATCH TROVATO!", matchInfo);

      //  Risposta di MATCH
      return res.json({
        success: true,
        message: matchInfo.message,
        match: matchInfo,
        movieAdded: {
          id: movie.id,
          title: movie.title,
        },
      });
    } else {
      console.log(" Nessun match ancora, aspettando altri utenti...");

      return res.json({
        success: true,
        message: `✅ Film "${movie.title}" aggiunto ai tuoi preferiti!`,
        match: null,
        movieAdded: {
          id: movie.id,
          title: movie.title,
        },
      });
    }
  } catch (error) {
    console.error(" Errore critico:", error);
    res.status(500).json({
      success: false,
      message: "Errore del server: " + error.message,
    });
  }
});

//  ENDPOINT per caricare tutti i film della stanza
app.get("/room/:code/all-movies", authenticateToken, async (req, res) => {
  const { code } = req.params;

  try {
    const room = await RoomSchema.findOne({ code });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Stanza non trovata",
      });
    }

    // Verifica che l'utente sia nella stanza
    if (!room.users.includes(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: "Non sei autorizzato ad accedere a questa stanza",
      });
    }

    res.json({
      success: true,
      userMovies: room.userMovies,
      totalUsers: room.users.length,
    });
  } catch (error) {
    console.error("Errore recupero film stanza:", error);
    res.status(500).json({
      success: false,
      message: "Errore del server",
    });
  }
});

// ✅ ENDPOINT per caricare i film di un utente specifico
app.get(
  "/room/:code/user/:userId/movies",
  authenticateToken,
  async (req, res) => {
    const { code, userId } = req.params;

    console.log(" Caricamento film per utente:", userId, "nella stanza:", code);

    try {
      const room = await RoomSchema.findOne({ code });
      if (!room) {
        console.log(" Stanza non trovata:", code);
        return res.status(404).json({
          success: false,
          message: "Stanza non trovata",
        });
      }

      // Verifica che l'utente sia nella stanza
      if (!room.users.includes(req.user.userId)) {
        console.log(" Utente non autorizzato nella stanza");
        return res.status(403).json({
          success: false,
          message: "Non sei autorizzato ad accedere a questa stanza",
        });
      }

      // Trova i film dell'utente richiesto
      const userMovies = room.userMovies.find(
        (entry) => entry.userId === userId
      );

      console.log(
        " Film trovati per utente:",
        userMovies ? userMovies.movies.length : 0
      );

      res.json({
        success: true,
        movies: userMovies ? userMovies.movies : [],
        userId: userId,
      });
    } catch (error) {
      console.error(" Errore recupero film utente:", error);
      res.status(500).json({
        success: false,
        message: "Errore del server: " + error.message,
      });
    }
  }
);

// Endpoint di compatibilità
app.post("/room/:code/movies", authenticateToken, async (req, res) => {
  const { code } = req.params;
  const { movies } = req.body;

  try {
    const room = await RoomSchema.findOne({ code });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Stanza non trovata",
      });
    }

    room.selectedMovies = movies;
    await room.save();

    res.json({
      success: true,
      message: "Film salvati",
      room,
    });
  } catch (error) {
    console.error("Errore salvataggio film:", error);
    res.status(500).json({
      success: false,
      message: "Errore del server",
    });
  }
});

app.get("/room/:code/movies", authenticateToken, async (req, res) => {
  const { code } = req.params;

  try {
    const room = await RoomSchema.findOne({ code });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Stanza non trovata",
      });
    }

    res.json({
      success: true,
      movies: room.selectedMovies,
    });
  } catch (error) {
    console.error("Errore recupero film:", error);
    res.status(500).json({
      success: false,
      message: "Errore del server",
    });
  }
});

app.get("/room/:code/check-matches", authenticateToken, async (req, res) => {
  const { code } = req.params;
  const userId = req.user.userId;

  console.log("🔍 Controllo match per utente:", req.user.name, "stanza:", code);

  try {
    const room = await RoomSchema.findOne({ code });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Stanza non trovata",
      });
    }

    if (!room.users.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "Non sei autorizzato ad accedere a questa stanza",
      });
    }

    // Trova i film dell'utente corrente
    const currentUserMovies = room.userMovies.find(
      (entry) => entry.userId === userId
    );

    if (!currentUserMovies || !currentUserMovies.movies.length) {
      return res.json({
        success: true,
        matches: [],
        message: "Nessun film nei tuoi preferiti ancora",
      });
    }

    // Controlla tutti i film dell'utente per vedere se hanno match
    const matches = [];

    for (const userMovie of currentUserMovies.movies) {
      // Conta quanti altri utenti hanno questo film
      const otherUsersWithThisMovie = room.userMovies.filter(
        (entry) =>
          entry.userId !== userId && // Escludi l'utente corrente
          entry.movies.some((m) => m.id === userMovie.id) // Chi ha questo film
      );

      if (otherUsersWithThisMovie.length > 0) {
        const totalMatches = otherUsersWithThisMovie.length + 1;

        matches.push({
          movie: userMovie,
          totalMatches: totalMatches,
          matchingUserIds: [
            ...otherUsersWithThisMovie.map((entry) => entry.userId),
            userId,
          ],
          message: `🎉 MATCH! ${totalMatches} persone hanno scelto "${userMovie.title}"!`,
        });
      }
    }

    console.log(" Match trovati per utente:", matches.length);

    res.json({
      success: true,
      matches: matches,
      totalMatches: matches.length,
    });
  } catch (error) {
    console.error(" Errore controllo match:", error);
    res.status(500).json({
      success: false,
      message: "Errore del server: " + error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SERVER AVVIATO SU PORTA ${PORT}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  console.log(`📅 Ambiente: ${process.env.NODE_ENV || "development"}`);
});
