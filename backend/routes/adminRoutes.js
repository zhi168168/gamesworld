const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const Game = require('../models/Game');

// Secret key for admin access
const ADMIN_SECRET_KEY = 'Xj9#kL2$mN5pQ7rT3sZ';

// Middleware to verify admin secret key
const verifyAdminKey = (req, res, next) => {
  const { secretKey } = req.body;
  
  console.log('验证密钥:', secretKey);
  console.log('预期密钥:', ADMIN_SECRET_KEY);
  console.log('请求体:', req.body);
  
  if (!secretKey || secretKey !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ message: '未授权。密钥无效。' });
  }
  
  next();
};

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg, .png and .webp formats are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Configure multer for Excel uploads
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/excel/'));
  },
  filename: (req, file, cb) => {
    cb(null, 'games-import-' + Date.now() + path.extname(file.originalname));
  }
});

const excelFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed!'));
  }
};

const uploadExcel = multer({
  storage: excelStorage,
  fileFilter: excelFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Create Excel template for game import
router.get('/template', (req, res) => {
  // Create a new workbook
  const workbook = xlsx.utils.book_new();
  
  // Define headers
  const headers = ['name', 'imageUrl', 'description', 'iframeUrl', 'weight', 'categories'];
  
  // Sample data
  const sampleData = [
    ['Space Adventure', 'https://example.com/space.jpg', 'An exciting space adventure game', 'https://example.com/games/space', '500', 'Action,Space'],
    ['Puzzle Master', '', 'Challenge your mind with puzzles', 'https://example.com/games/puzzle', '400', 'Puzzle,Brain']
  ];
  
  // Create worksheet
  const worksheet = xlsx.utils.aoa_to_sheet([headers, ...sampleData]);
  
  // Add worksheet to workbook
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Games Import Template');
  
  // Create buffer
  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  // Set headers
  res.setHeader('Content-Disposition', 'attachment; filename="games-import-template.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  
  // Send file
  res.send(buffer);
});

// Login to admin dashboard
router.post('/login', (req, res) => {
  try {
    console.log('收到登录请求，请求体:', req.body);
    
    // 确保提取secretKey，不管它来自何处
    const secretKey = req.body.secretKey || '';
    
    console.log('提取到密钥:', secretKey);
    console.log('预期密钥:', ADMIN_SECRET_KEY);
    console.log('比较结果:', secretKey === ADMIN_SECRET_KEY);
    
    if (!secretKey || secretKey !== ADMIN_SECRET_KEY) {
      console.log('密钥验证失败');
      return res.status(401).json({ message: '未授权。密钥无效。' });
    }
    
    console.log('密钥验证成功');
    return res.status(200).json({ message: '管理员验证成功', success: true });
  } catch (error) {
    console.error('登录处理错误:', error);
    return res.status(500).json({ message: '服务器错误，请稍后再试', error: error.message });
  }
});

// Get all games for admin (including hidden games)
router.get('/games', async (req, res) => {
  try {
    const games = await Game.find().sort({ weight: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search games by name, gameId, or description
router.get('/games/search', async (req, res) => {
  const { query } = req.query;
  
  try {
    const numericQuery = !isNaN(query) ? Number(query) : null;
    
    const games = await Game.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        numericQuery ? { gameId: numericQuery } : { _id: null }
      ]
    }).sort({ weight: -1 });
    
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new game
router.post('/games', upload.single('image'), async (req, res) => {
  try {
    const { name, description, iframeUrl, weight, categories } = req.body;
    
    // Convert categories string to array if provided
    const categoriesArray = categories ? categories.split(',').map(cat => cat.trim()) : ['Action'];
    
    const newGame = new Game({
      name,
      description,
      iframeUrl,
      weight: weight || 0,
      categories: categoriesArray
    });
    
    // If image was uploaded, add the path
    if (req.file) {
      newGame.image = `/uploads/${req.file.filename}`;
    }
    
    const savedGame = await newGame.save();
    res.status(201).json(savedGame);
  } catch (error) {
    // If an error occurred and file was uploaded, delete it
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(400).json({ message: error.message });
  }
});

// Import games from Excel
router.post('/games/import', uploadExcel.single('excel'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file' });
    }
    
    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return res.status(400).json({ message: 'Excel file has no data' });
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    // Process each row
    for (const row of data) {
      try {
        if (!row.name || !row.description || !row.iframeUrl) {
          results.failed++;
          results.errors.push(`Row with name '${row.name || 'unknown'}': Missing required fields`);
          continue;
        }
        
        // Convert categories string to array if provided
        const categoriesArray = row.categories ? 
          row.categories.split(',').map(cat => cat.trim()) : ['Action'];
        
        const newGame = new Game({
          name: row.name,
          description: row.description,
          iframeUrl: row.iframeUrl,
          weight: row.weight || 0,
          categories: categoriesArray,
          image: row.imageUrl || '/uploads/default-game.webp'
        });
        
        await newGame.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row with name '${row.name || 'unknown'}': ${error.message}`);
      }
    }
    
    // Delete the uploaded file
    fs.unlinkSync(req.file.path);
    
    res.status(200).json(results);
  } catch (error) {
    // Delete the uploaded file if it exists
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: error.message });
  }
});

// Update a game
router.put('/games/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, iframeUrl, weight, categories } = req.body;
    
    // Convert categories string to array if provided
    const categoriesArray = categories ? categories.split(',').map(cat => cat.trim()) : undefined;
    
    const updateData = {
      name,
      description,
      iframeUrl,
      weight,
      categories: categoriesArray
    };
    
    // If image was uploaded, add the path
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
      
      // Find the game to get the old image path
      const game = await Game.findById(req.params.id);
      
      // Delete the old image if it exists and is not the default
      if (game && game.image && !game.image.includes('default-game') && fs.existsSync(path.join(__dirname, '../public', game.image))) {
        fs.unlinkSync(path.join(__dirname, '../public', game.image));
      }
    }
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    const updatedGame = await Game.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedGame) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.json(updatedGame);
  } catch (error) {
    // If an error occurred and file was uploaded, delete it
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(400).json({ message: error.message });
  }
});

// Delete a game
router.delete('/games/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // Delete the game's image if it exists and is not the default
    if (game.image && !game.image.includes('default-game') && fs.existsSync(path.join(__dirname, '../public', game.image))) {
      fs.unlinkSync(path.join(__dirname, '../public', game.image));
    }
    
    await Game.deleteOne({_id: game._id});
    
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Batch delete games
router.post('/games/batch-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No game IDs provided' });
    }
    
    // Find games to get image paths
    const games = await Game.find({ _id: { $in: ids } });
    
    // Delete images that are not the default
    for (const game of games) {
      if (game.image && !game.image.includes('default-game') && fs.existsSync(path.join(__dirname, '../public', game.image))) {
        fs.unlinkSync(path.join(__dirname, '../public', game.image));
      }
    }
    
    // Delete the games
    const result = await Game.deleteMany({ _id: { $in: ids } });
    
    res.json({ message: `${result.deletedCount} games deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 