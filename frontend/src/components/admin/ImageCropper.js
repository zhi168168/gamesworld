import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ImageCropper = ({ src, onCropComplete, aspect = 16 / 9 }) => {
  const [crop, setCrop] = useState();
  const imgRef = useRef(null);
  
  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  }, [aspect]);

  const handleCropComplete = useCallback((crop, percentCrop) => {
    if (imgRef.current && crop.width && crop.height) {
      getCroppedImg(imgRef.current, crop, 'croppedImage.jpg').then((blob) => {
        onCropComplete(blob);
      });
    }
  }, [onCropComplete]);

  const getCroppedImg = (image, crop, fileName) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        blob.name = fileName;
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  return (
    <div className="image-cropper">
      <h5 className="mb-3">调整图片大小和位置</h5>
      <p className="text-muted mb-3">拖动裁剪框边缘调整大小，拖动裁剪框内部可移动位置</p>
      <div className="crop-container">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={handleCropComplete}
          aspect={aspect}
          className="crop-area"
          minWidth={100}
          minHeight={100}
          ruleOfThirds={true}
        >
          <img
            ref={imgRef}
            src={src}
            onLoad={onImageLoad}
            style={{ maxHeight: '400px' }}
            alt="待裁剪"
          />
        </ReactCrop>
      </div>
    </div>
  );
};

export default ImageCropper; 