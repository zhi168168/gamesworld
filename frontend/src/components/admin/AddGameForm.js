import React, { useState } from 'react';
import axios from 'axios';
import ImageCropper from './ImageCropper';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const AddGameForm = ({ onGameAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iframeUrl: '',
    weight: 0,
    categories: 'Action'
  });
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setShowCropper(true); // 显示裁剪组件
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (blob) => {
    setCroppedImage(blob);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(blob);
  };

  const handleCropperClose = () => {
    setShowCropper(false);
  };

  const handleCropperSave = () => {
    setShowCropper(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formPayload = new FormData();
      
      // 添加基本信息
      for (const key in formData) {
        formPayload.append(key, formData[key]);
      }
      
      // 添加图片
      if (croppedImage) {
        formPayload.append('image', croppedImage, 'cropped-image.jpg');
      } else if (image) {
        formPayload.append('image', image);
      }
      
      await axios.post('/api/dalianmao/games', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onGameAdded();
    } catch (error) {
      console.error('Error adding game:', error);
      setError(error.response?.data?.message || 'Failed to add game. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="card bg-dark mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">添加新游戏</h4>
        <button className="btn btn-sm btn-danger" onClick={onCancel}>
          关闭
        </button>
      </div>
      
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">游戏名称 *</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="输入游戏名称（仅允许英文字母和数字）"
                />
                <small className="text-muted">仅允许英文字母和数字，不允许中文字符或特殊符号。</small>
              </div>
              
              <div className="mb-3">
                <label htmlFor="description" className="form-label">游戏描述 *</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  maxLength="100"
                  placeholder="输入游戏描述（最多100个字符）"
                ></textarea>
                <small className="text-muted">{formData.description.length}/100 字符</small>
              </div>
              
              <div className="mb-3">
                <label htmlFor="iframeUrl" className="form-label">iframe URL *</label>
                <input
                  type="url"
                  className="form-control"
                  id="iframeUrl"
                  name="iframeUrl"
                  value={formData.iframeUrl}
                  onChange={handleChange}
                  required
                  placeholder="输入游戏iframe URL"
                />
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="weight" className="form-label">权重 *</label>
                <input
                  type="number"
                  className="form-control"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  min="0"
                  max="99999"
                  placeholder="输入游戏权重（0-99999）"
                />
                <small className="text-muted">0表示游戏在首页不可见。权重越高，位置越靠前。</small>
              </div>
              
              <div className="mb-3">
                <label htmlFor="categories" className="form-label">分类</label>
                <input
                  type="text"
                  className="form-control"
                  id="categories"
                  name="categories"
                  value={formData.categories}
                  onChange={handleChange}
                  placeholder="输入以逗号分隔的分类（例如：Action,Strategy）"
                />
                <small className="text-muted">多个分类请用逗号分隔。</small>
              </div>
              
              <div className="mb-3">
                <label htmlFor="image" className="form-label">游戏图片</label>
                <input
                  type="file"
                  className="form-control"
                  id="image"
                  name="image"
                  onChange={handleImageChange}
                  accept=".jpg,.jpeg,.png,.webp"
                />
                <small className="text-muted">支持的格式：JPG, PNG, WebP（最大5MB）</small>
              </div>
              
              {imagePreview && !showCropper && (
                <div className="mb-3">
                  <label className="form-label">图片预览</label>
                  <div className="image-preview" style={{ maxWidth: '100%', height: 'auto' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '5px' }} 
                    />
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-secondary mt-2"
                    onClick={() => setShowCropper(true)}
                  >
                    重新裁剪
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onCancel}
            >
              取消
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '添加中...' : '添加游戏'}
            </button>
          </div>
        </form>
      </div>

      {/* 图片裁剪模态框 */}
      <Modal 
        show={showCropper} 
        onHide={handleCropperClose}
        centered
        size="lg"
        backdrop="static"
        className="crop-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>裁剪游戏图片 (16:9比例)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {imagePreview && (
            <ImageCropper 
              src={imagePreview} 
              onCropComplete={handleCropComplete}
              aspect={16/9}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCropperClose}>
            取消
          </Button>
          <Button variant="primary" onClick={handleCropperSave}>
            应用裁剪
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddGameForm; 