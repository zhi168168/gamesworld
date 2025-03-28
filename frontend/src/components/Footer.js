import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer-text">© {currentYear} GamesWorld.ink 版权所有</p>
        <div className="footer-links">
          <Link to="/" className="footer-link">首页</Link>
          <Link to="/privacy" className="footer-link">隐私政策</Link>
          <Link to="/terms" className="footer-link">服务条款</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 