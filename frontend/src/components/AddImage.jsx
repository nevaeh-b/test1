import { useRef } from 'react';
import '../components/AddImage.css';

export default function AddImage({ isOpen, onClose, onImageSelect, title = "사진 첨부" }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  if (!isOpen) return null;

  // 앨범 선택 (파일 탐색기)
  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 카메라 촬영
  const handleCameraClick = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // 파일 선택 완료 시
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (onImageSelect) {
        onImageSelect(file);
      }
      onClose(); // 사진 선택이 완료된 후 모달 닫기
    }
    e.target.value = ''; // 동일 파일 재선택 가능하도록 초기화
  };

  return (
    <div className="add-image-overlay" onClick={onClose}>
      <div className="add-image-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-title">{title}</div>
        
        <button type="button" className="sheet-btn" onClick={handleGalleryClick}>
          앨범에서 선택
        </button>
        
        <button type="button" className="sheet-btn" onClick={handleCameraClick}>
          사진 촬영
        </button>
        
        <button type="button" className="sheet-btn cancel-btn" onClick={onClose}>
          취소
        </button>

        {/* 앨범 선택 */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />

        {/* 카메라 촬영 */}
        <input 
          type="file" 
          accept="image/*;capture=camera"
          capture="environment" 
          ref={cameraInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />
      </div>
    </div>
  );
}