import React, { useState } from 'react';
import axios from 'axios';

const ImportGames = ({ onGamesImported, onCancel }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setResults(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an Excel file to upload');
      return;
    }
    
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls') {
      setError('Only Excel files (.xlsx, .xls) are supported');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('excel', file);
      
      const response = await axios.post('/api/dalianmao/games/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setResults(response.data);
      
      // If there were no failures, close the form after a short delay
      if (response.data.failed === 0) {
        setTimeout(() => {
          onGamesImported();
        }, 2000);
      }
    } catch (error) {
      console.error('Error importing games:', error);
      setError(error.response?.data?.message || 'Failed to import games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-dark mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Import Games from Excel</h4>
        <button className="btn btn-sm btn-danger" onClick={onCancel}>
          Close
        </button>
      </div>
      
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        
        {results && (
          <div className={`alert ${results.failed > 0 ? 'alert-warning' : 'alert-success'}`}>
            <h5>Import Results:</h5>
            <p>Successfully imported: {results.success} games</p>
            <p>Failed imports: {results.failed} games</p>
            
            {results.errors && results.errors.length > 0 && (
              <div>
                <h6>Errors:</h6>
                <ul>
                  {results.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="excel" className="form-label">Excel File</label>
            <input
              type="file"
              className="form-control"
              id="excel"
              onChange={handleFileChange}
              accept=".xlsx,.xls"
            />
            <small className="text-muted">
              Make sure your Excel file matches the template format. 
              The file should include the following columns: name, imageUrl, description, iframeUrl, weight, categories.
            </small>
          </div>
          
          <div className="mb-4">
            <h5>Instructions:</h5>
            <ol>
              <li>Download the template using the "Download Template" button in the dashboard.</li>
              <li>Fill in the template with your game data.</li>
              <li>Upload the completed file above.</li>
              <li>Required fields: name, description, iframeUrl</li>
              <li>Game names must contain only English letters and numbers (no Chinese characters or symbols).</li>
              <li>For multiple categories, separate them with commas (e.g., "Action,Adventure").</li>
              <li>If weight is not specified, it will default to 0 (not visible on the home page).</li>
            </ol>
          </div>
          
          <div className="d-flex justify-content-end gap-2">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || !file}
            >
              {loading ? 'Importing...' : 'Import Games'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportGames; 