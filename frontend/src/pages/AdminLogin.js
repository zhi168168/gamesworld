import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminLogin = () => {
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('尝试使用密钥登录:', secretKey);
    
    try {
      // 使用axios进行请求，更可靠的方式
      const response = await axios.post('/api/dalianmao/login', {
        secretKey: secretKey
      });
      
      console.log('登录响应:', response.data);
      
      // 存储认证信息
      localStorage.setItem('isAdmin', 'true');
      
      // 跳转到管理员仪表板
      navigate('/dalianmao/dashboard');
    } catch (error) {
      console.error('登录错误:', error);
      
      let errorMessage = '登录失败，请检查密钥和网络连接';
      
      if (error.response) {
        // 服务器返回了响应
        errorMessage = error.response.data?.message || '密钥无效，请重试';
      } else if (error.request) {
        // 请求发送了但没有收到响应
        errorMessage = '服务器无响应，请检查后端服务是否运行';
      }
      
      setError('登录失败：' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      
      <div className="container">
        <div className="admin-login">
          <h2>管理员登录</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="secretKey" className="form-label">密钥</label>
              <input
                type="password"
                id="secretKey"
                className="form-input"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                required
                placeholder="请输入管理员密钥"
              />
              <small className="text-muted">默认密钥: Xj9#kL2$mN5pQ7rT3sZ</small>
            </div>
            
            <button 
              type="submit" 
              className="admin-btn"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminLogin; 