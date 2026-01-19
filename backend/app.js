const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.resolve("./database.sqlite");
const db = new sqlite3.Database(dbPath);

app.post("/api/register", (req, res) => {
  const { username, password, email, bio } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    "INSERT INTO users (username, password, email, bio, isAdmin) VALUES (?, ?, ?, ?, 0)",
    [username, hashedPassword, email, bio],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed"))
          return res.status(400).json({ error: "Username or email already exists" });
        return res.status(400).json({ error: err.message });
      }

      db.get(
        "SELECT id, username, email, bio, isAdmin, registeredAt FROM users WHERE id = ?",
        [this.lastID],
        (err, user) => {
          if (err) return res.status(400).json({ error: err.message });
          res.status(201).json(user);
        }
      );
    }
  );
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, user) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!user) return res.status(401).json({ error: "Invalid username or password" });

      const valid = bcrypt.compareSync(password, user.password);
      if (!valid) return res.status(401).json({ error: "Invalid username or password" });

      delete user.password;
      res.json(user);
    }
  );
});

app.post("/api/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

app.get("/api/profile/:id", (req, res) => {
  const id = req.params.id;

  db.get(
    "SELECT id, username, email, bio, isAdmin, registeredAt FROM users WHERE id = ?",
    [id],
    (err, user) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    }
  );
});

app.put("/api/profile/:id", (req, res) => {
  const id = req.params.id;
  const { bio, email } = req.body;

  db.run(
    "UPDATE users SET bio = ?, email = ? WHERE id = ?",
    [bio, email, id],
    (err) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: "Profile updated successfully" });
    }
  );
});

app.get("/api/posts", (req, res) => {
  db.all(
    `SELECT posts.*, users.username
     FROM posts
     JOIN users ON posts.userId = users.id
     ORDER BY posts.createdAt DESC`,
    [],
    (err, posts) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(posts);
    }
  );
});

app.get("/api/posts/user/:id", (req, res) => {
  const userId = req.params.id;

  db.all(
    `SELECT posts.*, users.username
     FROM posts
     JOIN users ON posts.userId = users.id
     WHERE posts.userId = ?
     ORDER BY posts.createdAt DESC`,
    [userId],
    (err, posts) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(posts);
    }
  );
});

app.post("/api/posts", (req, res) => {
  const { userId, content } = req.body;
  if (!userId || !content)
    return res.status(400).json({ error: "Missing required fields" });

  db.run(
    "INSERT INTO posts (userId, content) VALUES (?, ?)",
    [userId, content],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });

      db.get(
        `SELECT posts.*, users.username
         FROM posts
         JOIN users ON posts.userId = users.id
         WHERE posts.id = ?`,
        [this.lastID],
        (err, post) => {
          if (err) return res.status(400).json({ error: err.message });
          res.json(post);
        }
      );
    }
  );
});

module.exports = app;
