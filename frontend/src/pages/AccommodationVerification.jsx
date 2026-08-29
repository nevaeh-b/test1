import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import AuthResultModal from '../components/VerifyResult';
import '../styles/common.css';
import '../styles/AccommodationVerification.css';

export default function StayVerification() {
  const navigate = useNavigate();

  const [resultModal, setResultModal] = useState({ 
    isOpen: false, 
    isSuccess: true, 
    title: '', 
    message: '', 
    subMessage: '', 
    earnedPoint: 0 
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');

  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('카메라 권한 오류:', err);
      }
    };

    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [facingMode]);

  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const captureVideoToFile = () => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) resolve(null);
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg');
    });
  };

  const processStayVerification = async (fileToUpload = null) => {
    setIsAnalyzing(true);
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setIsAnalyzing(false);
      setResultModal({
        isOpen: true,
        isSuccess: false,
        title: '인증 실패',
        message: '로그인이 필요합니다.',
        subMessage: '다시 로그인 후 이용해 주세요.',
        earnedPoint: 0
      });
      return;
    }

    const file = fileToUpload || selectedFile;
    if (!file) {
      setIsAnalyzing(false);
      alert('숙박 예약을 증빙할 이미지를 촬영하거나 선택해주세요.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      // placeID 상황에 맞춰 append 필요
      formData.append('placeId', '1');

      const res = await fetch('http://localhost:3000/stays', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      setIsAnalyzing(false);

      if (!res.ok) {
        throw new Error(data.message || '숙박 예약 증빙 처리에 실패했습니다.');
      }

      if (data.status === 'PENDING') {
        setResultModal({
          isOpen: true,
          isSuccess: true,
          title: '관리자 확인 대기',
          message: data.message || '자동 승인 기준을 충족하지 못해 관리자 확인 후 처리됩니다.',
          subMessage: '검토에는 영업일 기준 최대 24시간이 소요됩니다.',
          earnedPoint: 0
        });
      } else {
        // 포인트 지급
        const pointFromBackend = data.reward?.amount || data.earnedPoint || data.amount || 2000;

        setResultModal({
          isOpen: true,
          isSuccess: true,
          title: '숙박 인증 성공!',
          message: '숙박 예약이 정상 확인되었습니다. ' + '+ ' + pointFromBackend,
          subMessage: '적립된 포인트는 마이페이지에서 확인하실 수 있습니다.',
          earnedPoint: pointFromBackend
        });
      }
    } catch (error) {
      setIsAnalyzing(false);
      setResultModal({
        isOpen: true,
        isSuccess: false,
        title: '인증 중 오류 발생',
        message: error.message || '인증 처리 중 문제가 발생했습니다.',
        earnedPoint: 0
      });
    }
  };

  const handleGallerySelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      processStayVerification(file);
    }
    e.target.value = null;
  };

  const handleCapture = async () => {
    const capturedFile = await captureVideoToFile();
    if (capturedFile) {
      setSelectedFile(capturedFile);
      processStayVerification(capturedFile);
    }
  };

  return (
    <AppLayout showActions={false} showNav={false} showBack={true} title="숙소 인증">
      <div className="verification-container">

        <div className="camera-viewport">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {isAnalyzing && (
            <div className="analyzing-view">
              <span>판독 중...</span>
            </div>
          )}

          <div className="camera-guide-text" style={{ zIndex: 1 }}>
            숙박 예약 내역 화면이나 영수증을 찍어주세요.
          </div>

          <div className="camera-controls" style={{ zIndex: 1 }}>
            <button type="button" className="camera-icon-btn" onClick={() => galleryInputRef.current.click()}>
              <img src="/images/성심당.png" alt="갤러리" />
            </button>
            <button type="button" className="shutter-btn" onClick={handleCapture}>
              <div className="shutter-inner" />
            </button>
            <button type="button" className="camera-icon-btn" onClick={handleToggleCamera}>
              <img src="/images/카이스트.png" alt="카메라 전환" />
            </button>
          </div>
        </div>

        <div className="action-bar">
          <button type="button" className="primary-btn verify-submit-btn" onClick={() => processStayVerification()}>
            <span>숙박 인증 완료하기</span>
          </button>
        </div>

        <input type="file" accept="image/*" ref={galleryInputRef} style={{ display: 'none' }} onChange={handleGallerySelect} />

        <AuthResultModal
          isOpen={resultModal.isOpen}
          isSuccess={resultModal.isSuccess}
          title={resultModal.title}
          message={resultModal.message}
          subMessage={resultModal.subMessage}
          earnedPoint={resultModal.earnedPoint}
          onConfirm={() => {
            setResultModal((prev) => ({ ...prev, isOpen: false }));
            if (resultModal.isSuccess) navigate('/mypage');
          }}
          onRetry={() => setResultModal((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>
    </AppLayout>
  );
}