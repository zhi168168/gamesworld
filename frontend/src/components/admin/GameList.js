import React, { useState } from 'react';
import axios from 'axios';
import EditGameForm from './EditGameForm';

const GameList = ({ games, onRefresh, selectedGames, setSelectedGames }) => {
  const [editingGame, setEditingGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleDelete = async (gameId) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      setLoading(true);
      try {
        await axios.delete(`/api/dalianmao/games/${gameId}`);
        onRefresh();
      } catch (error) {
        console.error('Error deleting game:', error);
        setError('Failed to delete game. Please try again.');
        setLoading(false);
      }
    }
  };

  const handleEdit = (game) => {
    setEditingGame(game);
  };

  const handleCancel = () => {
    setEditingGame(null);
  };

  const handleGameUpdated = () => {
    setEditingGame(null);
    onRefresh();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentPageIds = getCurrentItems().map(game => game._id);
      setSelectedGames(currentPageIds);
    } else {
      setSelectedGames([]);
    }
  };

  const handleSelectGame = (gameId) => {
    if (selectedGames.includes(gameId)) {
      setSelectedGames(selectedGames.filter(id => id !== gameId));
    } else {
      setSelectedGames([...selectedGames, gameId]);
    }
  };

  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return games.slice(indexOfFirstItem, indexOfLastItem);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(games.length / itemsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {editingGame ? (
        <EditGameForm 
          game={editingGame} 
          onGameUpdated={handleGameUpdated} 
          onCancel={handleCancel} 
        />
      ) : (
        <>
          {games.length === 0 ? (
            <div className="text-center my-5">
              <h3>No games found</h3>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-dark table-striped">
                  <thead>
                    <tr>
                      <th>
                        <input 
                          type="checkbox" 
                          onChange={handleSelectAll}
                          checked={selectedGames.length === getCurrentItems().length && getCurrentItems().length > 0}
                        />
                      </th>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Image</th>
                      <th>Description</th>
                      <th>Weight</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentItems().map((game) => (
                      <tr key={game._id}>
                        <td>
                          <input 
                            type="checkbox"
                            checked={selectedGames.includes(game._id)}
                            onChange={() => handleSelectGame(game._id)}
                          />
                        </td>
                        <td>{game.gameId}</td>
                        <td>{game.name}</td>
                        <td>
                          <img 
                            src={game.image.startsWith('http') ? game.image : `${process.env.REACT_APP_API_URL || ''}${game.image}`}
                            alt={game.name}
                            style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/uploads/default-game.webp';
                            }}
                          />
                        </td>
                        <td>{game.description.length > 50 ? `${game.description.substring(0, 50)}...` : game.description}</td>
                        <td>{game.weight}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleEdit(game)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(game._id)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <nav>
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    
                    {pageNumbers.map(number => (
                      <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => paginate(number)}
                        >
                          {number}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default GameList; 