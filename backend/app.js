const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join("/tmp", "database.sqlite");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      bio TEXT,
      isAdmin INTEGER DEFAULT 0,
      registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.get(`SELECT id FROM users WHERE username = 'admin'`, (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync("admin", 10);
      db.run(
        `INSERT INTO users (username, password, email, isAdmin)
         VALUES ('admin', ?, 'admin@nebula.com', 1)`,
        [hash]
      );
    }
  });
});

app.post("/api/register", (req, res) => {
  const { username, password, email, bio } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (username, password, email, bio, isAdmin) VALUES (?, ?, ?, ?, 0)`,
    [username, hashedPassword, email, bio],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE"))
          return res.status(400).json({ error: "Username or email already exists" });
        return res.status(400).json({ error: err.message });
      }

      db.get(
        `SELECT id, username, email, bio, isAdmin, registeredAt FROM users WHERE id = ?`,
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
    `SELECT * FROM users WHERE username = ?`,
    [username],
    (err, user) => {
      if (!user) return res.status(401).json({ error: "Invalid username or password" });
      if (!bcrypt.compareSync(password, user.password))
        return res.status(401).json({ error: "Invalid username or password" });

      delete user.password;
      res.json(user);
    }
  );
});

app.post("/api/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

app.get("/api/profile/:id", (req, res) => {
  db.get(
    `SELECT id, username, email, bio, isAdmin, registeredAt
     FROM users WHERE id = ?`,
    [req.params.id],
    (err, user) => {
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    }
  );
});

app.put("/api/profile/:id", (req, res) => {
  const { bio, email } = req.body;

  db.run(
    `UPDATE users SET bio = ?, email = ? WHERE id = ?`,
    [bio, email, req.params.id],
    () => res.json({ message: "Profile updated successfully" })
  );
});

app.get("/api/posts", (req, res) => {
  db.all(
    `SELECT posts.*, users.username
     FROM posts
     JOIN users ON posts.userId = users.id
     ORDER BY posts.createdAt DESC`,
    [],
    (err, posts) => res.json(posts)
  );
});

app.get("/api/posts/user/:userId", (req, res) => {
  db.all(
    `SELECT posts.*, users.username
     FROM posts
     JOIN users ON posts.userId = users.id
     WHERE posts.userId = ?`,
    [req.params.userId],
    (err, posts) => res.json(posts)
  );
});

app.post("/api/posts", (req, res) => {
  const { userId, content } = req.body;

  db.run(
    `INSERT INTO posts (userId, content) VALUES (?, ?)`,
    [userId, content],
    function () {
      db.get(
        `SELECT posts.*, users.username
         FROM posts
         JOIN users ON posts.userId = users.id
         WHERE posts.id = ?`,
        [this.lastID],
        (err, post) => res.json(post)
      );
    }
  );
});

const isAdmin = (req, res, next) => {
  const userId = req.query.userId;

  db.get(
    `SELECT isAdmin FROM users WHERE id = ?`,
    [userId],
    (err, user) => {
      if (!user || !user.isAdmin)
        return res.status(403).json({ error: "Access denied" });
      next();
    }
  );
};

app.get("/api/admin/users", isAdmin, (req, res) => {
  db.all(
    `SELECT id, username, email, isAdmin, registeredAt FROM users`,
    [],
    (err, users) => res.json(users)
  );
});

module.exports = app;
