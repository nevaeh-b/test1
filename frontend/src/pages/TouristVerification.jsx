import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import AddImage from '../components/AddImage';
import VerifyResult from '../components/VerifyResult'; 
import '../styles/common.css';
import '../styles/TouristVerification.css';

export default function TouristVerification({ mode = 'signup' }) {
  const navigate = useNavigate();
  const isFromMypage = mode === 'mypage'; 
  const [showSheet, setShowSheet] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  
  const [documentType, setDocumentType] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [resultModal, setResultModal] = useState({ 
    isOpen: false, isSuccess: true, title: '', message: '', point: 0 
  });

  const handleCardClick = (typeText, docType) => {
    setSelectedType(typeText);
    setDocumentType(docType);
    setShowSheet(true);
  };

  // 백엔드 연결
  const handleImageSelect = async (file) => {
    setShowSheet(false);
    setIsAnalyzing(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsAnalyzing(false);
        setResultModal({
          isOpen: true,
          isSuccess: false,
          title: '인증 실패',
          message: '로그인 정보가 유효하지 않습니다. 다시 로그인해 주세요.',
          point: 0
        });
        return;
      }

      // /users/traveler/upload 호출
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const uploadRes = await fetch('http://localhost:3000/users/traveler/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        const serverErrorMsg = Array.isArray(uploadData.message) ? uploadData.message[0] : uploadData.message;
        throw new Error(uploadData.message || '증빙서류 업로드에 실패했습니다.');
      }

      // 업로드 후 리워드 승인 처리 (POST /users/traveler/approve/:requestId)
      const requestId = uploadData.id || uploadData.requestId; 
      let earnedPoint = isFromMypage ? 1000 : 0;

      if (requestId) {
        const approveRes = await fetch(`http://localhost:3000/users/traveler/approve/${requestId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const approveData = await approveRes.json();
        if (approveRes.ok && approveData.point) {
          earnedPoint = approveData.point;
        }
      }

      setIsAnalyzing(false);
      setResultModal({
        isOpen: true,
        isSuccess: true,
        title: '여행객 인증 성공!',
        message: `${selectedType} 검증이 정상적으로 완료되었습니다. 리워드가 지급되었습니다!`,
        point: earnedPoint
      });

    } catch (error) {
      setIsAnalyzing(false);
      setResultModal({
        isOpen: true,
        isSuccess: false,
        title: '인증 실패',
        message: error.message || '인증이 실패했습니다. 주의사항을 참고하여 다시 시도해주세요.',
        point: 0
      });
    }
  };

  const handleConfirm = () => {
    setResultModal({ ...resultModal, isOpen: false });
    if (resultModal.isSuccess) {
      if (isFromMypage) { navigate('/mypage'); } else { navigate('/signup/complete'); }
    }
  };

  return (
    <AppLayout 
      showHeader={true} 
      title={"여행객 인증하기"} 
      showBack={true} 
      showActions={false} 
      showNav={false}
      onBack={() => navigate(-1)}
    >
      {!isFromMypage && (
        <div style={{ position: 'absolute', top: '19px', right: '20px', zIndex: 11 }}>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#004ea1', cursor: 'pointer' }} onClick={() => navigate('/signup/complete')}>
            건너뛰기
          </span>
        </div>
      )}

      <div className="tourist-veri-container">
        {isAnalyzing && (
            <div className="loading-box">
              <div className="spinner"></div>
              <p>정보를 확인하고 있습니다...</p>
              <p>최대 2분의 시간이 소요됩니다. 화면을 나가지 않고 대기해주세요.</p>
            </div>
        )}
        <div className="veri-content">
          <div className="veri-card-list">
            <div className="veri-card" onClick={() => handleCardClick('코레일(KTX/SRT) 티켓', 'TRANSPORT_TICKET')}>
              <div className="card-icon-wrapper"><img className="card-icon" src="/icons/지하철_흰색.png" alt="기차" /></div>
              <span className="card-text">코레일(KTX/SRT) 티켓 인증</span>
            </div>
            <div className="veri-card" onClick={() => handleCardClick('시외/고속 버스 티켓', 'TRANSPORT_TICKET')}>
              <div className="card-icon-wrapper"><img className="card-icon" src="/icons/대중교통_흰색.png" alt="버스" /></div>
              <span className="card-text">시외/고속 버스 티켓 인증</span>
            </div>
            <div className="veri-card" onClick={() => handleCardClick('고속도로 톨게이트 영수증', 'TOLL_RECEIPT')}>
              <div className="card-icon-wrapper"><img className="card-icon" src="/icons/자동차_흰색.png" alt="자동차" /></div>
              <span className="card-text">고속도로 톨게이트 영수증 인증</span>
            </div>
          </div>

          <div className="notice-box">
            <p className="notice-title">꼭 확인해주세요!</p>
            <ul className="notice-list">
              <li>최근 3일 이내의 내역만 인증 가능합니다.</li>
              <li>출발지가 '대전 외 지역', 도착지가 '대전'이어야 인증 가능합니다.</li>
              <li>캡처본 시 출발지, 도착지, 승차 일시가 명확히 보여야 합니다.</li>
              <li>제출된 이미지는 OCR 자동 인식을 통해 즉시 검증됩니다.</li>
            </ul>
          </div>
        </div>

        {!isFromMypage && (
          <div className="bottom-btn-area">
            <button className="submit-btn" onClick={() => navigate('/test/start')}>완료하기</button>
          </div>
        )}

        <AddImage 
          isOpen={showSheet} 
          onClose={() => setShowSheet(false)} 
          onImageSelect={handleImageSelect}
          title={selectedType}
        />

        <VerifyResult 
          isOpen={resultModal.isOpen} 
          isSuccess={resultModal.isSuccess}
          title={resultModal.title}
          message={resultModal.message}
          point={resultModal.point}
          onConfirm={handleConfirm}
        />
      </div>
    </AppLayout>
  );
}