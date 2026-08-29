import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/common.css';
import '../styles/Onboarding.css';

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = [
    {
      id: 1,
      badge: 'AI 코스 플래너',
      title: '성향 맞춤 AI 코스 추천과\n자유로운 일정 편집',
      description: '나의 여행 스타일을 분석해 최적의 코스를 제안하고,\n원하는 장소로 손쉽게 순서와 구성을 바꿀 수 있어요.',
      image: '/images/안내사진.png',
    },
    {
      id: 2,
      badge: '스마트 혼잡도',
      title: '실시간 혼잡도 확인으로\n여유롭고 쾌적한 여행',
      description: '구별/장소별 혼잡 지수와 예측 데이터를 미리 확인해\n인파를 피해 여유롭게 관람할 수 있습니다.',
      image: '/images/안내사진.png',
    },
    {
      id: 3,
      badge: '꿈돌이 스탬프 보드',
      title: '방문 인증하고 완성하는\n나만의 꿈돌이 캐릭터',
      description: '대전의 명소들을 방문하고 스탬프를 찍어\n내 여행 유형에 맞는 특별한 꿈돌이를 완성해보세요.',
      image: '/images/안내사진.png',
    },
    {
      id: 4,
      badge: '스테이플러스 혜택',
      title: '적립한 포인트를\n실제 대전 지역화폐로 전환',
      description: '숙박과 관광지 인증으로 모은 리워드 포인트를\n대전 지역화폐로 전환해 바로 사용하세요.',
      image: '/images/안내사진.png',
    },
    {
      id: 5,
      badge: '대전 야간관광',
      title: '화려한 밤의 매력,\n심야 축제와 야간 명소',
      description: '달빛 버스킹, 엑스포 음악분수, 야시장 등\n대전만의 낭만적인 밤 축제 일정을 한눈에 확인하세요.',
      image: '/images/안내사진.png',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    navigate('/home');
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      if (currentSlide < slides.length - 1) setCurrentSlide((prev) => prev + 1);
    }
    if (touchEndX.current - touchStartX.current > 50) {
      if (currentSlide > 0) setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <div className="onboarding-viewport">
      {/* 1. 상단 로고 및 건너뛰기 헤더 */}
      <header className="onboarding-header">
      </header>

      {/* 2. 메인 슬라이드 트랙 */}
      <main 
        className="onboarding-slider"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="slide-track" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="slide-item">
              <div className="slide-image-card">
                <img 
                  src={slide.image} 
                  alt={slide.badge} 
                  className="slide-img"
                  onError={(e) => {
                    e.target.style.opacity = '0.3';
                  }}
                />
              </div>

              <div className="slide-text-group">
                <span className="slide-badge">{slide.badge}</span>
                <h2 className="slide-title">{slide.title}</h2>
                <p className="slide-desc">{slide.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 3. 인디케이터 및 액션 버튼 */}
      <footer className="onboarding-footer">
        <div className="indicator-dots">
          {slides.map((_, idx) => (
            <span 
              key={idx} 
              className={`dot ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>

        <button 
          type="button" 
          className="submit-btn active"
          onClick={handleNext}
        >
          {currentSlide === slides.length - 1 ? '시작하기' : '다음'}
        </button>
      </footer>
    </div>
  );
}