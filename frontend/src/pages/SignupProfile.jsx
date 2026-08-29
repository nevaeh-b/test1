import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import AddImage from '../components/AddImage'; 
import '../styles/common.css';
import '../styles/SignupProfile.css';

export default function SignupProfile() {
  const navigate = useNavigate();
  const [showSheet, setShowSheet] = useState(false); 
  const [previewImg, setPreviewImg] = useState(null); 
  
  // 서버로 보낼 파일 객체 저장
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (file) => {
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setPreviewImg(imageUrl);
    setSelectedFile(file); // 실제 File 객체 보관
  };

  const handleNext = async () => {
    // 프로필 선택 x > 바로 다음 단계로
    if (!selectedFile) {
      navigate('/signup/tourist');
      return;
    }

    setLoading(true);

    try {
      // 로컬 스토리지 내 토큰
      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/signup');
        return;
      }

      const formData = new FormData();
      formData.append('profileImage', selectedFile);

      const response = await fetch('http://localhost:3000/users/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`, // 토큰 전송
        },
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        // 성공 시 다음 페이지 이동
        navigate('/signup/tourist');
      } else {
        const errorMsg = Array.isArray(result.message) ? result.message[0] : result.message;
        alert(`프로필 이미지 등록 실패: ${errorMsg || '서버 오류'}`);
      }
    } catch (error) {
      console.error('업로드 실패 에러:', error);
      alert('서버와의 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout 
      showHeader={true} 
      title="프로필 이미지" 
      showBack={true} 
      showActions={false} 
      showNav={false}
      onBack={() => navigate('/signup')}
    >
      {/* 건너뛰기: 이미지 없이 이동 */}
      <div style={{ position: 'absolute', top: '19px', right: '20px', zIndex: 11 }}>
        <span 
          style={{ fontSize: '15px', fontWeight: '700', color: '#004ea1', cursor: 'pointer' }} 
          onClick={() => navigate('/signup/tourist')}
        >
          건너뛰기
        </span>
      </div>

      <div className="signup-profile-container">
        <div className="profile-content">
          <h2 className="page-title">프로필 이미지 등록</h2>
          <div className="profile-img-wrapper">
            <div className="profile-img-placeholder">
              {previewImg && <img src={previewImg} alt="프로필 미리보기" className="preview-img" />}
            </div>
            <div className="add-photo-btn" onClick={() => setShowSheet(true)}>
              <img src="/icons/사진추가.png" alt="사진추가" />
            </div>
          </div>
        </div>

        <div className="bottom-btn-area">
          <button 
            className={`submit-btn ${selectedFile ? 'active' : ''}`} 
            onClick={handleNext}
            disabled={!selectedFile || loading}
          >
            {loading ? '업로드 중...' : '다음'}
          </button>
        </div>

        <AddImage 
          isOpen={showSheet} 
          onClose={() => setShowSheet(false)} 
          onImageSelect={handleImageSelect}
          title="프로필 사진 설정"
        />
      </div>
    </AppLayout>
  );
}