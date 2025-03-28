import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div>
      <Header />
      
      <div className="container">
        <div className="text-center my-5">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>Oops! The page you are looking for does not exist.</p>
          <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFound; 