const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve('./database.sqlite');
const db = new sqlite3.Database(dbPath);

exports.handler = async function(event, context) {
  const method = event.httpMethod;
  const path = event.path;

  if (method === 'POST' && path === '/api/register') {
    const { username, password, email, bio } = JSON.parse(event.body);
    const hashedPassword = bcrypt.hashSync(password, 10);
    return new Promise((resolve) => {
      db.run('INSERT INTO users (username, password, email, bio, isAdmin) VALUES (?, ?, ?, ?, 0)',
        [username, hashedPassword, email, bio],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              resolve({ statusCode: 400, body: JSON.stringify({ error: 'Username or email already exists' }) });
              return;
            }
            resolve({ statusCode: 400, body: JSON.stringify({ error: err.message }) });
            return;
          }
          db.get('SELECT id, username, email, bio, isAdmin, registeredAt FROM users WHERE id = ?',
            [this.lastID],
            (err, user) => {
              if (err) {
                resolve({ statusCode: 400, body: JSON.stringify({ error: err.message }) });
                return;
              }
              resolve({ statusCode: 201, body: JSON.stringify(user) });
            });
        });
    });
  }

  if (method === 'POST' && path === '/api/login') {
    const { username, password } = JSON.parse(event.body);
    return new Promise((resolve) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
          resolve({ statusCode: 400, body: JSON.stringify({ error: err.message }) });
          return;
        }
        if (!user) {
          resolve({ statusCode: 401, body: JSON.stringify({ error: 'Invalid username or password' }) });
          return;
        }
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
          resolve({ statusCode: 401, body: JSON.stringify({ error: 'Invalid username or password' }) });
          return;
        }
        delete user.password;
        resolve({ statusCode: 200, body: JSON.stringify(user) });
      });
    });
  }

  if (method === 'POST' && path === '/api/logout') {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Logged out successfully' })
    };
  }

  if (method === 'GET' && path.startsWith('/api/profile/')) {
    const id = path.split('/').pop();
    return new Promise((resolve) => {
      db.get('SELECT id, username, email, bio, isAdmin, registeredAt FROM users WHERE id = ?', [id], (err, user) => {
        if (err) {
          resolve({ statusCode: 400, body: JSON.stringify({ error: err.message }) });
          return;
        }
        if (!user) {
          resolve({ statusCode: 404, body: JSON.stringify({ error: 'User not found' }) });
          return;
        }
        resolve({ statusCode: 200, body: JSON.stringify(user) });
      });
    });
  }

  if (method === 'PUT' && path.startsWith('/api/profile/')) {
    const id = path.split('/').pop();
    const { bio, email } = JSON.parse(event.body);
    return new Promise((resolve) => {
      db.run('UPDATE users SET bio = ?, email = ? WHERE id = ?', [bio, email, id], (err) => {
        if (err) {
          resolve({ statusCode: 400, body: JSON.stringify({ error: err.message }) });
          return;
        }
        resolve({ statusCode: 200, body: JSON.stringify({ message: 'Profile updated successfully' }) });
      });
    });
  }

  if (method === 'GET' && path === '/api/posts') {
    return new Promise((resolve) => {
      db.all(`SELECT posts.*, users.username FROM posts JOIN users ON posts.userId = users.id ORDER BY posts.createdAt DESC`, [], (err, posts) => {
        if (err) {
          resolve({ statusCode: 400, body: JSON.stringify({ error: err.message }) });
          return;
        }
        resolve({ statusCode: 200, body: JSON.stringify(posts) });
      });
    });
  }

  if (method === 'GET' && path.startsWith('/api/posts/user/')) {
    const userId = path.split('/').pop();
    return new Promise((resolve) => {
      db.all('SELECT posts.*, users.username FROM posts JOIN users ON posts.userId = users.id WHERE posts.userId = ? ORDER BY createdAt DESC', [userId], (err, posts) => {
        if (err) {
          resolve({ statusCode: 400, body: JSON.stringify({ error: err.message }) });
          return;
        }
        resolve({ statusCode: 200, body: JSON.stringify(posts) });
      });
    });
  }

  if (method === 'POST' && path === '/api/posts') {
    const { userId, content } = JSON.parse(event.body);
    if (!userId || !content) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }
    return new Promise((resolve) => {
      db.run('INSERT INTO posts (userId, content) VALUES (?, ?)', [userId, content], function(err) {
        if (err) {
          resolve({ statusCode: 400, body: JSON.stringify({ error: err.message }) });
          return;
        }
        db.get('SELECT posts.*, users.username FROM posts JOIN users ON posts.userId = users.id WHERE posts.id = ?', [this.lastID], (err, post) => {
          if (err) {
            resolve({ statusCode: 400, body: JSON.stringify({ error: err.message }) });
            return;
          }
          resolve({ statusCode: 200, body: JSON.stringify(post) });
        });
      });
    });
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Route not found' })
  };
};
