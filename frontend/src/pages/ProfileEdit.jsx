import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import AddImage from '../components/AddImage';
import '../styles/common.css';
import '../styles/ProfileEdit.css';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [showSheet, setShowSheet] = useState(false); 
  const [profileImg, setProfileImg] = useState('/images/프로필.png'); 

  // 입력 필드 상태
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // 내 정보 조회
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:3000/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setNickname(data.nickname || '');
          setEmail(data.email || '');
          if (data.profile_image) {
            setProfileImg(data.profile_image);
          }
        }
      } catch (err) {
        console.error('프로필 로드 실패:', err);
      }
    };
    fetchProfile();
  }, []);

  // 이미지 선택 시 미리보기
  const handleImageSelect = (file) => {
    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setProfileImg(imageUrl);
  };

  // 프로필 수정 요청
  const handleSubmit = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      let res;

      // 프로필 이미지 첨부 시
      if (selectedFile) {
        const formData = new FormData();
        if (nickname) formData.append('nickname', nickname);
        formData.append('file', selectedFile); // 백엔드 Multer 필드명: file

        res = await fetch('http://localhost:3000/users/profile', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
      } 
      // 닉네임만 변경 시
      else {
        res = await fetch('http://localhost:3000/users/profile', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nickname }),
        });
      }

      const data = await res.json();

      if (res.ok) {
        alert('프로필이 성공적으로 수정되었습니다.');
        navigate('/mypage/setting');
      } else {
        const errMsg = Array.isArray(data.message) ? data.message.join('\n') : data.message;
        alert(errMsg || '프로필 수정 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('프로필 수정 통신 오류:', error);
      alert('서버와 통신할 수 없습니다.');
    }
  };

  return (
    <AppLayout showHeader={true} title="프로필 편집" showNav={false} showActions={false} showBack={true} onBack={() => navigate(-1)}>
      <div className="edit-content">
        
        {/* 프로필 이미지 영역 */}
        <div className="profile-img-section">
          <div className="img-wrapper">
            <img className="profile-pic" src={profileImg} alt="프로필" />
            <div className="edit-icon-badge" onClick={() => setShowSheet(true)}>
              <img src="/icons/편집.png" alt="편집" />
            </div>
          </div>
        </div>

        {/* 정보 입력 리스트 */}
        <div className="info-list">
          <div className="info-item">
            <label className="info-label">이름</label>
            <input 
              type="text" 
              className="info-value" 
              value={nickname} 
              readOnly
            />
          </div>

          <div className="info-item">
            <label className="info-label">이메일</label>
            <input 
              type="email" 
              className="info-value" 
              value={email} 
              disabled 
            />
          </div>
        </div>

      </div>

      <div className="bottom-btn-area">
        <button type="button" className="submit-btn" onClick={handleSubmit}>
          수정 완료
        </button>
      </div>

      {/* 공통 AddImage 바텀시트 */}
      <AddImage 
        isOpen={showSheet} 
        onClose={() => setShowSheet(false)} 
        onImageSelect={handleImageSelect}
        title="프로필 사진 변경"
      />
    </AppLayout>
  );
}