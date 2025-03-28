import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GameCard from '../components/GameCard';

const GameDetail = () => {
  const { gameName } = useParams();
  const [game, setGame] = useState(null);
  const [similarGames, setSimilarGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      setLoading(true);
      setError(null);
      setShowIframe(false);
      setIframeError(false);
      
      try {
        const response = await axios.get(`/api/games/${gameName}`);
        setGame(response.data);
        
        // 获取同类别的游戏作为相似游戏推荐
        if (response.data.categories && response.data.categories.length > 0) {
          const category = response.data.categories[0];
          const similarResponse = await axios.get(`/api/games/category/${category}`);
          
          // 过滤掉当前游戏，最多显示4个相似游戏
          const filtered = similarResponse.data
            .filter(g => g._id !== response.data._id)
            .slice(0, 4);
          
          setSimilarGames(filtered);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching game details:', error);
        setLoading(false);
        setError('游戏未找到');
      }
    };

    fetchGameDetails();
  }, [gameName]);

  const handlePlayClick = () => {
    setShowIframe(true);
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

  const openInNewTab = () => {
    if (game && game.iframeUrl) {
      window.open(game.iframeUrl, '_blank');
    }
  };

  // 设置页面标题
  useEffect(() => {
    if (game) {
      document.title = `${game.name} - GamesWorld.ink`;
    } else {
      document.title = 'GamesWorld.ink';
    }
    
    return () => {
      document.title = 'GamesWorld.ink';
    };
  }, [game]);

  // 使用更可靠的方式检测iframe加载错误
  useEffect(() => {
    if (showIframe && iframeRef.current) {
      let loadTimeout = null;
      let loadChecked = false;

      const handleIframeLoad = () => {
        loadChecked = true;
        clearTimeout(loadTimeout);
        
        try {
          // 尝试访问iframe内容来检测是否成功加载
          const iframeContent = iframeRef.current.contentWindow;
          if (!iframeContent || !iframeContent.document.body) {
            setIframeError(true);
          }
        } catch (e) {
          // 如果出现跨域错误，表示被X-Frame-Options阻止
          console.log('iframe访问受限:', e);
          setIframeError(true);
        }
      };

      // 为iframe设置load事件
      iframeRef.current.addEventListener('load', handleIframeLoad);
      
      // 设置超时检查，如果太长时间没有加载完成则视为错误
      loadTimeout = setTimeout(() => {
        if (!loadChecked) {
          setIframeError(true);
        }
      }, 8000);

      return () => {
        if (iframeRef.current) {
          iframeRef.current.removeEventListener('load', handleIframeLoad);
        }
        clearTimeout(loadTimeout);
      };
    }
  }, [showIframe]);

  return (
    <div>
      <Header />
      
      <div className="container">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="text-center my-5">
            <h2>{error}</h2>
            <Link to="/" className="btn btn-primary mt-3">返回首页</Link>
          </div>
        ) : game && (
          <div className="game-detail">
            <div className="breadcrumb">
              <Link to="/" className="breadcrumb-item">首页</Link>
              <span className="breadcrumb-divider">{'>'}</span>
              <Link to={`/category/${game.categories[0]}`} className="breadcrumb-item">
                {game.categories[0] || '游戏'}
              </Link>
              <span className="breadcrumb-divider">{'>'}</span>
              <span className="breadcrumb-item">{game.name}</span>
            </div>
            
            <h1>{game.name}</h1>
            
            <div className="iframe-container">
              {showIframe ? (
                <>
                  <iframe 
                    ref={iframeRef}
                    src={game.iframeUrl} 
                    title={game.name}
                    allowFullScreen
                    sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation"
                  ></iframe>
                  
                  {iframeError && (
                    <div className="iframe-error-overlay">
                      <div className="iframe-error-message">
                        <h3>游戏加载受限</h3>
                        <p>该游戏不允许在我们的网站中嵌入播放。</p>
                        <div className="iframe-error-actions">
                          <button className="btn btn-primary" onClick={openInNewTab}>
                            在新标签页中打开游戏
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="play-button" onClick={handlePlayClick}>
                  ▶
                </div>
              )}
            </div>
            
            <div className="iframe-notice mt-2">
              <p className="text-muted small">
                <strong>注意：</strong> 如果游戏无法加载，可能是由于游戏提供商的限制。
                在这种情况下，您可以尝试在新标签页中直接打开游戏。
              </p>
            </div>
            
            <div className="game-description">
              <h2>关于游戏</h2>
              <p>{game.description}</p>
            </div>
            
            {similarGames.length > 0 && (
              <div className="similar-games">
                <h2 className="similar-games-title">相似游戏</h2>
                
                <div className="game-cards">
                  {similarGames.map((similarGame) => (
                    <GameCard key={similarGame._id} game={similarGame} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default GameDetail; 