const mongoose = require('mongoose');

// 创建游戏ID计数器模型
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 10000 }
});

const Counter = mongoose.model('Counter', counterSchema);

// 游戏模型
const gameSchema = new mongoose.Schema({
  gameId: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        // 仅允许英文和数字，不允许中文和符号
        return /^[a-zA-Z0-9\s]+$/.test(v);
      },
      message: props => `${props.value} is not a valid game name. Only English letters and numbers are allowed.`
    }
  },
  image: {
    type: String,
    default: '/uploads/default-game.webp'
  },
  description: {
    type: String,
    required: true,
    maxlength: 100
  },
  iframeUrl: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 99999
  },
  categories: {
    type: [String],
    default: ['Action']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 在保存前自动生成游戏ID
gameSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'gameId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.gameId = counter.seq;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// 创建模型
const Game = mongoose.model('Game', gameSchema);

module.exports = Game; 