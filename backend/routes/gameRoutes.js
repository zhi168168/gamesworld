const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// Get all games with weight > 0 (visible games), sorted by weight
router.get('/', async (req, res) => {
  try {
    const games = await Game.find({ weight: { $gt: 0 } })
      .sort({ weight: -1 })
      .select('name image description categories gameId');
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search games by name or description
router.get('/search', async (req, res) => {
  const { query } = req.query;
  
  try {
    const games = await Game.find({
      weight: { $gt: 0 },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ weight: -1 })
    .select('name image description categories gameId');
    
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get game suggestions for autocomplete
router.get('/suggest', async (req, res) => {
  const { query } = req.query;
  
  try {
    const suggestions = await Game.find({
      weight: { $gt: 0 },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ weight: -1 })
    .limit(5)
    .select('name');
    
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get games by category
router.get('/category/:category', async (req, res) => {
  const { category } = req.params;
  
  try {
    const games = await Game.find({
      weight: { $gt: 0 },
      categories: category
    })
    .sort({ weight: -1 })
    .select('name image description categories gameId');
    
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Game.distinct('categories');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get game by name (for game detail page)
router.get('/:name', async (req, res) => {
  try {
    const game = await Game.findOne({ name: req.params.name });
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 