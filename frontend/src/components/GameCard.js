import React from 'react';
import { Link } from 'react-router-dom';

const GameCard = ({ game }) => {
  return (
    <div className="game-card">
      <Link to={`/${game.name}`}>
        <img 
          src={game.image.startsWith('http') ? game.image : `${process.env.REACT_APP_API_URL || ''}${game.image}`} 
          alt={game.name} 
          className="game-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/uploads/default-game.webp';
          }}
        />
        <div className="game-content">
          <h3 className="game-title">{game.name}</h3>
          <p className="game-category">
            {game.categories && game.categories.length > 0 
              ? game.categories.slice(0, 2).join(' • ') 
              : 'Game'}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default GameCard; 