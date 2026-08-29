import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import CourseBlock from '../components/courseBlock';
import '../styles/Course.css';

export default function Course() {
  const navigate = useNavigate();
  const [serverCourses, setServerCourses] = useState([]);

  // 기본 코스
  const defaultCourses = [
    {
      id: 'a-default',
      title: 'A 코스 (KAIST 둘레길)',
      description: '카이스트 캠퍼스 내부를 걸으며 시원한 볼거리를 즐길 수 있는 코스입니다.',
      tags: ['도보', '과학/체험', '자연'],
      imageSrc: '/images/카이스트.png',
    },
    {
      id: 'b-default',
      title: 'B 코스 (유성 온천 거리)',
      description: '따뜻한 족욕 체험과 맛집을 둘러볼 수 있는 추천 코스입니다.',
      tags: ['자연', '자동차', '대중교통'],
      imageSrc: '/images/성심당.png',
    }
  ];

  // 백엔드 연결 (코스 목록 조회)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('http://localhost:3000/courses');
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map((c) => ({
            id: c.id,
            title: c.name,
            description: c.description || `${c.name} 코스입니다.`,
            tags: c.course_tag?.map((ct) => ct.tag?.name).filter(Boolean) || ['추천코스'],
            imageSrc: '/images/카이스트.png',
          }));
          setServerCourses(formatted);
        }
      } catch (err) {
        console.error('코스 목록 로드 오류:', err);
      }
    };
    fetchCourses();
  }, []);

  return (
    <AppLayout>
      <section className="course-section search-section">
        <div className="section-header">
          <h2 className="section-title">맞춤 코스 검색하기</h2>
        </div>
        <div 
          className="search-bar-container" 
          onClick={() => navigate('/course/search')}
        >
          <img 
            src="/icons/검색.png" 
            alt="검색" 
            className="search-bar-icon" 
            onError={(e) => e.target.src='/icons/앞으로.png'} 
          />
          <span className="search-bar-placeholder">어떤 코스를 찾고 계신가요?</span>
        </div>
      </section>

      {/* 2. 추천 코스 */}
      <section className="course-section">
        <div className="section-header">
          <h2 className="section-title">⭐ 추천 코스</h2>
          <p className="section-desc">탐험가 유형의 사람들이 가장 많이 저장한 코스에요!</p>
        </div>

        <CourseBlock
          type="default"
          title="A 코스 (KAIST 둘레길)"
          description="카이스트 캠퍼스 내부를 걸으며 시원한 볼거리를 즐길 수 있는 코스입니다."
          tags={['도보', '과학/체험', '자연']}
          imageSrc="/images/카이스트.png"
          onClick={() => navigate('/course/detail/a-default')}
        />

        {serverCourses.length > 0 ? (
          serverCourses.map((c) => (
            <CourseBlock
              key={c.id}
              type="default"
              title={c.title}
              description={c.description}
              tags={c.tags}
              imageSrc={c.imageSrc}
              onClick={() => navigate(`/course/detail/${c.id}`)}
            />
          ))
        ) : (
          <CourseBlock
            type="default"
            title={defaultCourses[0].title}
            description={defaultCourses[0].description}
            tags={defaultCourses[0].tags}
            imageSrc={defaultCourses[0].imageSrc}
            onClick={() => navigate('/course/detail/a-default')}
          />
        )}
      </section>

      <section className="course-section">
        <div className="section-header clickable-header" onClick={() => navigate('/course/save')}>
           <h2 className="section-title">📖 저장한 코스</h2>
           <p className="section-desc">내가 저장한 코스를 확인하고 스탬프 투어를 시작해보세요!</p>
        </div>

        <div className="saved-course-list">
          {serverCourses.slice(0, 2).map((c) => (
            <CourseBlock
              key={`saved-server-${c.id}`}
              type="saved"
              title={c.title}
              description={c.description}
              tags={c.tags}
              onClick={() => navigate(`/course/detail/${c.id}`)}
            />
          ))}
        </div>
      </section>

    </AppLayout>
  );
}