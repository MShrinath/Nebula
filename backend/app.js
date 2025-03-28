const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure database directory exists
const dbDir = path.join(__dirname, "database");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Database connection
const dbPath = path.join(dbDir, "database.sqlite");

// Delete existing database file if it exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the SQLite database.");
  
  // Create tables
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      bio TEXT,
      isAdmin BOOLEAN DEFAULT 0,
      registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error("Error creating users table:", err);
      } else {
        console.log("Users table created successfully");
      }
    });

    // Posts table
    db.run(`CREATE TABLE posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`, (err) => {
      if (err) {
        console.error("Error creating posts table:", err);
      } else {
        console.log("Posts table created successfully");
      }
    });

    // Create default admin user
    const defaultAdminPassword = bcrypt.hashSync('admin', 10);
    db.run(`INSERT INTO users (username, password, email, isAdmin) 
            VALUES ('admin', ?, 'admin@nebula.com', 1)`, 
      [defaultAdminPassword],
      (err) => {
        if (err) {
          console.error("Error creating admin user:", err);
        } else {
          console.log("Default admin user created successfully");
        }
      }
    );
  });
});

// Routes
app.post('/api/register', async (req, res) => {
  const { username, password, email, bio } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    console.log('Registration - Username:', username);
    console.log('Registration - Original password:', password);
    console.log('Registration - Hashed password:', hashedPassword);

    db.run('INSERT INTO users (username, password, email, bio, isAdmin) VALUES (?, ?, ?, ?, 0)',
      [username, hashedPassword, email, bio],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Username or email already exists' });
            return;
          }
          res.status(400).json({ error: err.message });
          return;
        }
        // Return the created user without password
        db.get('SELECT id, username, email, bio, isAdmin, registeredAt FROM users WHERE id = ?', 
          [this.lastID], 
          (err, user) => {
            if (err) {
              res.status(400).json({ error: err.message });
              return;
            }
            res.status(201).json(user);
          }
        );
      });
  } catch (error) {
    console.error('Password hashing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt - Username:', username);
  console.log('Login attempt - Provided password:', password);
  
  // Use parameterized query for initial user lookup
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      console.error('Database error:', err);
      res.status(400).json({ error: err.message });
      return;
    }
    if (!user) {
      console.log('User not found:', username);
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }
    
    console.log('User found in database');
    console.log('Stored hash:', user.password);
    
    // Validate password
    const validPassword = bcrypt.compareSync(password, user.password);
    console.log('Password comparison result:', validPassword);
    
    if (!validPassword) {
      console.log('Password validation failed');
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    console.log('Login successful for user:', username);
    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
});

// Add logout endpoint
app.post('/api/logout', (req, res) => {
  // Since we're using stateless authentication, we just return a success message
  // The frontend will handle clearing the stored user data
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/profile/:id', (req, res) => {
  // Vulnerable to IDOR
  db.get('SELECT id, username, email, bio, isAdmin, registeredAt FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  });
});

app.put('/api/profile/:id', (req, res) => {
  // Vulnerable to IDOR
  const { bio, email } = req.body;
  db.run('UPDATE users SET bio = ?, email = ? WHERE id = ?', [bio, email, req.params.id], (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'Profile updated successfully' });
  });
});

// Get all posts (public feed)
app.get('/api/posts', (req, res) => {
  // Vulnerable to XSS
  db.all(`
    SELECT posts.*, users.username 
    FROM posts 
    JOIN users ON posts.userId = users.id 
    ORDER BY posts.createdAt DESC
  `, [], (err, posts) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(posts);
  });
});

// Add endpoint to get user's posts
app.get('/api/posts/user/:userId', (req, res) => {
  // Vulnerable to IDOR
  db.all('SELECT posts.*, users.username FROM posts JOIN users ON posts.userId = users.id WHERE posts.userId = ? ORDER BY createdAt DESC', 
    [req.params.userId], 
    (err, posts) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json(posts);
    }
  );
});

// Create a new post (requires authentication)
app.post('/api/posts', (req, res) => {
  const { userId, content } = req.body;
  if (!userId || !content) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  // Vulnerable to IDOR
  db.run(
    'INSERT INTO posts (userId, content) VALUES (?, ?)',
    [userId, content],
    function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      // Get the newly created post with username
      db.get(
        `SELECT posts.*, users.username 
         FROM posts 
         JOIN users ON posts.userId = users.id 
         WHERE posts.id = ?`,
        [this.lastID],
        (err, post) => {
          if (err) {
            res.status(400).json({ error: err.message });
            return;
          }
          res.json(post);
        }
      );
    }
  );
});

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  const userId = req.query.userId; // Get userId from query parameter
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  db.get('SELECT isAdmin FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
  });
};

app.get('/api/admin/users', isAdmin, (req, res) => {
  // Only accessible to admin users
  db.all('SELECT id, username, email, isAdmin, registeredAt FROM users', [], (err, users) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(users);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 