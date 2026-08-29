import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import CourseBlock from '../components/courseBlock';
import '../styles/CourseSearchResult.css';

export default function CourseSearchResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchFilter = location.state || {};

  const [sortOption, setSortOption] = useState('정확도순');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchAndSaveGeminiRecommendation = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');

      const bodyData = {
        accommodationPlaceCode: Number(searchFilter.accommodationPlaceCode) || 1,
        transportation: searchFilter.transport || '대중교통',
        themes: searchFilter.themes || ['HISTORY_CULTURE'],
        barrierFreeTypes: searchFilter.barrierFreeTypes || []
      };

      try {
        // 백엔드 연결 (코스 자동 생성 - 제미나이 호출)
        const res = await fetch('http://localhost:3000/recommendation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify(bodyData)
        });

        if (res.ok) {
          const data = await res.json();
          const recommendedCourse = data.recommended?.course || [];

          if (recommendedCourse.length > 0) {
            // 코스 저장
            const saveRes = await fetch('http://localhost:3000/courses', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
              },
              body: JSON.stringify({
                name: `AI 맞춤 추천 코스 (${searchFilter.transport || '대중교통'})`,
                themes: searchFilter.themes || [],
                barrierFreeTypes: searchFilter.barrierFreeTypes || [],
                places: recommendedCourse.map((item) => ({
                  place_code: item.place_code,
                  order: item.order
                }))
              })
            });

            if (saveRes.ok) {
              const savedCourseData = await saveRes.json();
              // 자동 저장되어 생성된 코스 반환
              setSearchResults([{
                id: savedCourseData.id,
                title: savedCourseData.name,
                description: data.recommended?.summary || '조건에 따라 생성된 맞춤 여행 코스입니다.',
                tags: [...(searchFilter.rawThemes || ['추천']), searchFilter.transport || '대중교통'],
                imageSrc: '/images/성심당.png',
                isBookmarked: false,
                rawCourseData: savedCourseData
              }]);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Gemini 추천/자동 저장 중 오류가 발생하여 기존 DB 코스 목록을 조회합니다:', err);
      }

      // 실패 시 기존 코스 목록 조회
      try {
        const courseRes = await fetch('http://localhost:3000/courses');
        if (courseRes.ok) {
          const dbCourses = await courseRes.json();
          if (Array.isArray(dbCourses) && dbCourses.length > 0) {
            setSearchResults(dbCourses.map((c) => ({
              id: c.id,
              title: c.name || '대전 추천 코스',
              description: '대전의 주요 명소를 둘러보는 추천 코스입니다.',
              tags: c.is_barrier_free ? ['무장애', '추천'] : ['추천'],
              imageSrc: '/images/카이스트.png',
              isBookmarked: false
            })));
            setIsLoading(false);
            return;
          }
        }
      } catch (dbErr) {
        console.error('DB 코스 목록 조회 실패:', dbErr);
      }

      setIsLoading(false);
    };

    fetchAndSaveGeminiRecommendation();
  }, [location.state]);

  const handleBookmarkToggle = (id) => {
    setSearchResults((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
      )
    );
  };

  return (
    <AppLayout
      showHeader={true}
      title="검색 결과"
      showNav={false}
      showActions={false}
      showBack={true}
      onBack={() => navigate(-1)}
    >
      <div className="result-container">
        <div className="result-filter-bar">
          <div className="result-info">
            <p className="count-text">{searchResults.length}개의 코스를 찾았어요</p>
            <p className="sub-text">코스를 저장하고 스탬프 투어를 시작해보세요!</p>
          </div>
          <div className="sort-box">
            <span className="sort-label">정렬</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="sort-select"
            >
              <option value="정확도순">정확도순</option>
              <option value="인기순">인기순</option>
              <option value="최신순">최신순</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#666' }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold' }}>🤖 AI 코스 생성 및 DB 자동 저장 중입니다...</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>잠시만 기다려 주세요!</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#888' }}>
            <p>조건에 맞는 코스를 생성하지 못했습니다.</p>
          </div>
        ) : (
          <div className="course-result-list">
            {searchResults.map((course) => (
              <CourseBlock
                key={course.id}
                type="default"
                title={course.title}
                description={course.description}
                tags={course.tags}
                imageSrc={course.imageSrc}
                isBookmarked={course.isBookmarked}
                onClick={() => navigate(`/course/detail/${course.id}`, { state: { courseData: course } })}
                onBookmarkClick={(e) => {
                  e.stopPropagation();
                  handleBookmarkToggle(course.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}