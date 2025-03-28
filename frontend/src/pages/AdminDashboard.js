import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Admin Dashboard Components
import GameList from '../components/admin/GameList';
import AddGameForm from '../components/admin/AddGameForm';
import ImportGames from '../components/admin/ImportGames';

const AdminDashboard = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [selectedGames, setSelectedGames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 检查是否已登录
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/dalianmao');
    } else {
      fetchGames();
    }
  }, [navigate]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/dalianmao/games');
      setGames(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('Failed to load games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      fetchGames();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/api/dalianmao/games/search?query=${searchQuery}`);
      setGames(response.data);
    } catch (error) {
      console.error('Error searching games:', error);
      setError('Failed to search games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/dalianmao');
  };

  const handleAddGame = () => {
    setShowAddForm(true);
    setShowImportForm(false);
  };

  const handleImportGames = () => {
    setShowImportForm(true);
    setShowAddForm(false);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get('/api/dalianmao/template', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'games-import-template.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading template:', error);
      setError('Failed to download template. Please try again.');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedGames.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedGames.length} selected games?`)) {
      setLoading(true);
      try {
        await axios.post('/api/dalianmao/games/batch-delete', { ids: selectedGames });
        setSelectedGames([]);
        fetchGames();
      } catch (error) {
        console.error('Error deleting games:', error);
        setError('Failed to delete games. Please try again.');
        setLoading(false);
      }
    }
  };

  const handleGameAdded = () => {
    setShowAddForm(false);
    fetchGames();
  };

  const handleGamesImported = () => {
    setShowImportForm(false);
    fetchGames();
  };

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          
          <div className="admin-actions">
            <button onClick={handleAddGame} className="btn btn-primary">Add Game</button>
            <button onClick={handleImportGames} className="btn btn-success">Import Games</button>
            <button onClick={handleDownloadTemplate} className="btn btn-info">Download Template</button>
            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
          </div>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="search-container mb-4">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, ID, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-primary" onClick={handleSearch}>Search</button>
          </div>
        </div>
        
        {selectedGames.length > 0 && (
          <div className="mb-3">
            <button 
              className="btn btn-danger" 
              onClick={handleDeleteSelected}
            >
              Delete Selected ({selectedGames.length})
            </button>
          </div>
        )}
        
        {showAddForm && (
          <AddGameForm onGameAdded={handleGameAdded} onCancel={() => setShowAddForm(false)} />
        )}
        
        {showImportForm && (
          <ImportGames onGamesImported={handleGamesImported} onCancel={() => setShowImportForm(false)} />
        )}
        
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <GameList 
            games={games} 
            onRefresh={fetchGames} 
            selectedGames={selectedGames}
            setSelectedGames={setSelectedGames}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 