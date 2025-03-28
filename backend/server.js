const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// 配置JSON解析中间件
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Invalid JSON received:', e.message);
      res.status(400).json({ message: 'Invalid JSON format' });
      throw new Error('Invalid JSON');
    }
  }
}));

// 配置表单数据解析中间件 - 确保可以正确解析表单提交
app.use(express.urlencoded({ 
  extended: true,
  limit: '50mb'
}));

// 处理跨域请求
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// Serve static files from the frontend build folder
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Import routes
const gameRoutes = require('./routes/gameRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use routes
app.use('/api/games', gameRoutes);
app.use('/api/dalianmao', adminRoutes);

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve game thumbnails
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// MongoDB connection
console.log('尝试连接MongoDB...');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gamevault', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => {
    console.log('MongoDB连接错误:', err.message);
    console.log('应用将继续运行，但部分功能可能不可用');
  });

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({
    message: '服务器出错',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Serve frontend for any route not defined above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 