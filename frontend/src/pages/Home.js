import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GameCard from '../components/GameCard';

const Home = () => {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('所有游戏');
  const [loading, setLoading] = useState(true);
  const [visibleGames, setVisibleGames] = useState(8);
  const location = useLocation();

  // 设置页面标题
  useEffect(() => {
    document.title = 'GamesWorld.ink - 最佳游戏集合';
  }, []);

  useEffect(() => {
    // 获取所有游戏分类
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/games/categories');
        setCategories(['所有游戏', ...response.data]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      
      try {
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get('search');
        
        let response;
        
        if (searchQuery) {
          // 搜索查询
          response = await axios.get(`/api/games/search?query=${searchQuery}`);
          setSelectedCategory('所有游戏');
        } else if (selectedCategory !== '所有游戏') {
          // 按分类筛选
          response = await axios.get(`/api/games/category/${selectedCategory}`);
        } else {
          // 获取所有游戏
          response = await axios.get('/api/games');
        }
        
        setGames(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching games:', error);
        setLoading(false);
      }
    };

    fetchGames();
  }, [selectedCategory, location.search]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setVisibleGames(8);
  };

  const handleViewMore = () => {
    setVisibleGames(prev => prev + 8);
  };

  return (
    <div>
      <Header />
      
      <div className="container">
        <h1>热门游戏</h1>
        
        <div className="categories">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center my-5">
            <h3>未找到游戏</h3>
          </div>
        ) : (
          <>
            <div className="game-cards">
              {games.slice(0, visibleGames).map((game) => (
                <GameCard key={game._id} game={game} />
              ))}
            </div>
            
            {visibleGames < games.length && (
              <button className="view-more" onClick={handleViewMore}>
                查看更多
              </button>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Home; 