import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/CourseDetail.css';

export default function CourseDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [feedback, setFeedback] = useState(null);

  const [courseData, setCourseData] = useState(null);
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:3000/courses/${id}`);
        if (!response.ok) throw new Error('코스 상세 조회 실패');
        
        const data = await response.json();
        setCourseData(data);

        // 장소 목록
        if (data.course_place && data.course_place.length > 0) {
          const mappedPlaces = data.course_place.map((cp, idx) => ({
            id: cp.place?.id || idx + 1,
            title: cp.place?.name || `방문 장소 ${idx + 1}`,
            imageSrc: cp.place?.firstimage || '/images/카이스트.png',
            desc: cp.place?.addr1 || '대전광역시 주요 추천 방문지입니다.'
          }));
          setPlaces(mappedPlaces);
        }
      } catch (error) {
        console.error('코스 정보를 불러오는 중 오류 발생:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetail();
  }, [id]);

  const alternatives = [
    { id: 1, name: '국립중앙과학관', imageSrc: '/images/국립중앙과학관.png' },
    { id: 2, name: '지질박물관', imageSrc: '/images/지질박물관.png' },
    { id: 3, name: '시민천문대', imageSrc: '/images/대전시민천문대.png' },
  ];

  if (isLoading) {
    return (
      <AppLayout showHeader={true} title="코스 상세" showNav={false} showBack={true} onBack={() => navigate(-1)}>
        <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>코스 정보를 로딩 중입니다...</div>
      </AppLayout>
    );
  }

  const currentPlace = places[currentStep - 1] || places[0] || {
    title: '정보 없음',
    desc: '등록된 상세 장소가 없습니다.',
    imageSrc: '/images/카이스트.png'
  };

  const tags = location.state?.courseData?.tags || ['대중교통', '추천코스', '대전여행'];

  return (
    <AppLayout
      showHeader={true}
      title="코스 상세"
      showNav={false}
      showActions={false}
      showBack={true}
      onBack={() => navigate(-1)}
    >
      <div className="detail-container">
        {/* 1. 상단 지도 영역 */}
        <div className="map-section">
          <div className="map-placeholder">
            <span>지도 연동 영역 (Course ID: {id})</span>
          </div>
        </div>

        {/* 2. 코스 정보 요약 */}
        <div className="course-summary">
          <div className="title-row">
            <h2 className="course-title">{courseData?.name || '추천 코스'}</h2>
            <button 
              type="button" 
              className="icon-btn" 
              aria-label="북마크"
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              <img 
                src={isBookmarked ? '/icons/북마크_채움.png' : '/icons/북마크.png'} 
                alt="북마크" 
              />
            </button>
          </div>

          <div className="tag-list">
            {tags.map((tag, idx) => (
              <span key={idx} className="tag-chip">#{tag}</span>
            ))}
          </div>

          <p className="course-desc">
            {location.state?.courseData?.description || 'AI가 제안하는 맞춤형 대전 추천 코스입니다.'}
          </p>
        </div>

        <hr className="divider" />

        {/* 3. 장소별 정보 & 스테퍼 네비게이션 */}
        <div className="place-section">
          {/* 좌측 사이드 스테퍼 네비게이션 */}
          <div className="place-nav">
            <button 
              type="button" 
              className="nav-btn"
              disabled={currentStep <= 1}
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            >
              ▲
            </button>
            <span className="step-indicator">{currentStep}/{places.length || 1}</span>
            <button 
              type="button" 
              className="nav-btn"
              disabled={currentStep >= places.length}
              onClick={() => setCurrentStep(prev => Math.min(places.length, prev + 1))}
            >
              ▼
            </button>
          </div>

          {/* 우측 선택된 장소 상세 콘텐츠 */}
          <div className="place-content">
            <h3 className="place-title">{currentStep}. {currentPlace.title}</h3>
            
            <div className="place-img-box">
              <img src={currentPlace.imageSrc} alt={currentPlace.title} />
            </div>

            <p className="place-desc">{currentPlace.desc}</p>

            {/* 대체 추천 장소 카드 */}
            <div className="alternative-card">
              <div className="alt-header">
                <p className="alt-text">이 장소가 마음에 안 드시나요?<br />대체할 추천 장소를 확인해보세요!</p>
                <div className="feedback-group">
                  <button 
                    type="button" 
                    className="icon-btn"
                    aria-label="좋아요"
                    onClick={() => setFeedback(prev => prev === 'like' ? null : 'like')}
                  >
                    <img 
                      src={feedback === 'like' ? '/icons/좋아요_채움.png' : '/icons/좋아요.png'} 
                      alt="좋아요" 
                    />
                  </button>
                  <button 
                    type="button" 
                    className="icon-btn"
                    aria-label="싫어요"
                    onClick={() => setFeedback(prev => prev === 'dislike' ? null : 'dislike')}
                  >
                    <img 
                      src={feedback === 'dislike' ? '/icons/싫어요_채움.png' : '/icons/싫어요.png'} 
                      alt="싫어요" 
                    />
                  </button>
                </div>
              </div>

              <div className="alt-grid">
                {alternatives.map((item) => (
                  <div key={item.id} className="alt-item">
                    <div className="alt-img-box">
                      <img src={item.imageSrc} alt={item.name} />
                    </div>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}