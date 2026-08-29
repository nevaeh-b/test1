import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import CourseBlock from '../components/courseBlock';
import '../styles/CourseSaved.css';

export default function CourseSaved() {
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState('정확도순');
  const [selectedId, setSelectedId] = useState(null);
  const [pinnedId, setPinnedId] = useState(null);

  const [savedCourses, setSavedCourses] = useState([
    {
      id: 'course-a',
      title: 'A 코스',
      description: '대전 맛집과 대표 명소를 순회하는 완벽한 1일 추천 코스',
      imageSrc: '/images/성심당.png',
      isBookmarked: true,
      tags: ['도보', '과학/체험', '자연'],
    },
    {
      id: 'course-b',
      title: 'B 코스',
      description: '자연과 함께 즐기는 여유로운 산책 코스',
      imageSrc: '/images/카이스트.png',
      isBookmarked: true,
      tags: ['맛집', '역사/문화', '도보'],
    },
  ]);

  useEffect(() => {
    const fetchSavedCourses = async () => {
      try {
        const res = await fetch('http://localhost:3000/courses');
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map((c) => ({
            id: c.id,
            title: c.name,
            description: c.description || `${c.name} 코스입니다.`,
            imageSrc: '/images/카이스트.png',
            isBookmarked: true,
            tags: c.course_tag?.map((ct) => ct.tag?.name).filter(Boolean) || ['저장코스'],
          }));
          setSavedCourses((prev) => [...formatted, ...prev]);
        }
      } catch (err) {
        console.error('저장 코스 로드 오류:', err);
      }
    };
    fetchSavedCourses();
  }, []);

  const handleBookmarkToggle = async (id) => {
    setSavedCourses(prev => prev.map(course => {
      if (course.id === id) {
        return { ...course, isBookmarked: !course.isBookmarked };
      }
      return course;
    }));

    if (typeof id === 'number') {
      const token = localStorage.getItem('accessToken');
      try {
        await fetch(`http://localhost:3000/courses/${id}/scrap`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });
      } catch (err) {
        console.error('스크랩 연동 오류:', err);
      }
    }
  };

  const pinnedCourse = savedCourses.find(c => c.id === pinnedId);
  const unpinnedCourses = savedCourses.filter(c => c.id !== pinnedId);

  const pressTimer = useRef(null);

  const handlePressStart = (id) => {
    pressTimer.current = setTimeout(() => {
      setSelectedId(id);
    }, 500); 
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  const handleContextMenu = (e, id) => {
    e.preventDefault();
    setSelectedId(id);
  };

  return (
    <AppLayout showHeader={true} title="저장한 코스" showNav={false} showActions={false} showBack={true} onBack={() => navigate(-1)}>
      <div className="saved-container">
        <div className="saved-filter-bar">
          <div className="result-info">
            <p className="count-text">{unpinnedCourses.length}개의 코스가 있습니다</p>
            <p className="sub-text">코스를 길게 누르거나 우클릭하여 선택해보세요!</p>
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

        {pinnedCourse && (
          <div className="pinned-course-section">
            <div className="pinned-header">
              <h3>📌 진행 중인 코스</h3>
              <button className="edit-course-btn">편집 권한 활성화 ✏️</button>
            </div>
            <CourseBlock
              type="default"
              title={pinnedCourse.title}
              description={pinnedCourse.description}
              tags={pinnedCourse.tags}
              imageSrc={pinnedCourse.imageSrc}
              isBookmarked={pinnedCourse.isBookmarked}
              onClick={() => navigate(`/course/detail/${pinnedCourse.id}`)}
              onBookmarkClick={(e) => {
                e.stopPropagation();
                handleBookmarkToggle(pinnedCourse.id);
              }}
            />
          </div>
        )}

        <div className="saved-course-list">
          {unpinnedCourses.map((course) => (
            <div 
              key={course.id} 
              className={`selectable-course-wrapper ${selectedId === course.id ? 'selected' : ''}`}
              onMouseDown={() => handlePressStart(course.id)}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onContextMenu={(e) => handleContextMenu(e, course.id)}
              onTouchStart={() => handlePressStart(course.id)}
              onTouchEnd={handlePressEnd}
            >
              {selectedId === course.id && (
                <div className="radio-check">✔</div>
              )}
              
              <CourseBlock
                type="default"
                title={course.title}
                description={course.description}
                tags={course.tags}
                imageSrc={course.imageSrc}
                isBookmarked={course.isBookmarked}
                onClick={() => {
                  if (selectedId !== course.id) {
                    navigate(`/course/detail/${course.id}`);
                  }
                }}
                onBookmarkClick={(e) => {
                  e.stopPropagation();
                  handleBookmarkToggle(course.id);
                }}
              />
            </div>
          ))}
        </div>

        {selectedId && (
          <div className="bottom-decision-bar">
            <button 
              className="decision-btn" 
              onClick={() => {
                setPinnedId(selectedId);
                setSelectedId(null); 
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              이 코스로 진행하기
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}