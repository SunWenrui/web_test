const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 初始化数据库
const db = new sqlite3.Database('./medal_system.db', (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('数据库连接成功');
    initDatabase();
  }
});

function initDatabase() {
  // 创建行为表
  db.run(`CREATE TABLE IF NOT EXISTS behaviors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    note TEXT,
    dailyLimit INTEGER,
    enabled INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 创建勋章表
  db.run(`CREATE TABLE IF NOT EXISTS medals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT,
    name TEXT NOT NULL,
    note TEXT,
    behaviorId INTEGER NOT NULL,
    module TEXT,
    type TEXT DEFAULT 'regular',
    tiers TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (behaviorId) REFERENCES behaviors(id)
  )`);

  // 创建用户表
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    actions TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('数据库表初始化完成');
}

// 广播数据更新给所有连接的客户端
function broadcastUpdate(type, data) {
  io.emit('data-update', { type, data });
}

// ========== 行为 API ==========
app.get('/api/behaviors', (req, res) => {
  db.all('SELECT * FROM behaviors ORDER BY id', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const behaviors = rows.map(row => ({
      ...row,
      enabled: row.enabled === 1,
      dailyLimit: row.dailyLimit || null
    }));
    res.json(behaviors);
  });
});

app.post('/api/behaviors', (req, res) => {
  const { name, note, dailyLimit, enabled } = req.body;
  
  db.run(
    'INSERT INTO behaviors (name, note, dailyLimit, enabled) VALUES (?, ?, ?, ?)',
    [name, note || '', dailyLimit || null, enabled !== false ? 1 : 0],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          res.status(400).json({ error: '行为名称已存在' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }
      db.get('SELECT * FROM behaviors WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        const behavior = { ...row, enabled: row.enabled === 1, dailyLimit: row.dailyLimit || null };
        broadcastUpdate('behavior', behavior);
        res.json(behavior);
      });
    }
  );
});

app.put('/api/behaviors/:id', (req, res) => {
  const { name, note, dailyLimit, enabled } = req.body;
  const id = req.params.id;
  
  db.run(
    'UPDATE behaviors SET name = ?, note = ?, dailyLimit = ?, enabled = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [name, note || '', dailyLimit || null, enabled !== false ? 1 : 0, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      db.get('SELECT * FROM behaviors WHERE id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        const behavior = { ...row, enabled: row.enabled === 1, dailyLimit: row.dailyLimit || null };
        broadcastUpdate('behavior', behavior);
        res.json(behavior);
      });
    }
  );
});

app.delete('/api/behaviors/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM behaviors WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    broadcastUpdate('behavior-delete', { id: parseInt(id) });
    res.json({ success: true, id: parseInt(id) });
  });
});

// ========== 勋章 API ==========
app.get('/api/medals', (req, res) => {
  db.all('SELECT * FROM medals ORDER BY id', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const medals = rows.map(row => ({
      ...row,
      tiers: JSON.parse(row.tiers)
    }));
    res.json(medals);
  });
});

app.post('/api/medals', (req, res) => {
  const { icon, name, note, behaviorId, module, type, tiers } = req.body;
  
  db.run(
    'INSERT INTO medals (icon, name, note, behaviorId, module, type, tiers) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [icon || '', name, note || '', behaviorId, module || '其他', type || 'regular', JSON.stringify(tiers)],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      db.get('SELECT * FROM medals WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        const medal = { ...row, tiers: JSON.parse(row.tiers) };
        broadcastUpdate('medal', medal);
        res.json(medal);
      });
    }
  );
});

app.delete('/api/medals/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM medals WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    broadcastUpdate('medal-delete', { id: parseInt(id) });
    res.json({ success: true, id: parseInt(id) });
  });
});

// ========== 用户 API ==========
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users ORDER BY id', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const users = rows.map(row => ({
      ...row,
      actions: JSON.parse(row.actions)
    }));
    res.json(users);
  });
});

app.post('/api/users', (req, res) => {
  const { name, actions } = req.body;
  
  // 检查用户数量限制
  db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row.count >= 10) {
      res.status(400).json({ error: '最多支持10个用户' });
      return;
    }
    
    db.run(
      'INSERT INTO users (name, actions) VALUES (?, ?)',
      [name, JSON.stringify(actions)],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          const user = { ...row, actions: JSON.parse(row.actions) };
          broadcastUpdate('user', user);
          res.json(user);
        });
      }
    );
  });
});

app.put('/api/users/:id', (req, res) => {
  const { name, actions } = req.body;
  const id = req.params.id;
  
  db.run(
    'UPDATE users SET name = ?, actions = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [name, JSON.stringify(actions), id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        const user = { ...row, actions: JSON.parse(row.actions) };
        broadcastUpdate('user', user);
        res.json(user);
      });
    }
  );
});

app.delete('/api/users/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    broadcastUpdate('user-delete', { id: parseInt(id) });
    res.json({ success: true, id: parseInt(id) });
  });
});

// 清空所有数据
app.post('/api/clear-all', (req, res) => {
  const { type } = req.body;
  const tables = {
    'behaviors': 'behaviors',
    'medals': 'medals',
    'users': 'users'
  };
  
  if (!tables[type]) {
    res.status(400).json({ error: '无效的类型' });
    return;
  }
  
  db.run(`DELETE FROM ${tables[type]}`, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    broadcastUpdate(`${type}-clear-all`, {});
    res.json({ success: true });
  });
});

// WebSocket 连接处理
io.on('connection', (socket) => {
  console.log('客户端连接:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('客户端断开:', socket.id);
  });
});

// 提供前端页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'xzsz.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

