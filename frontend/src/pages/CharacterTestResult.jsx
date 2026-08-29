import { useEffect } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/CharacterTestResult.css';
import { characterData } from '../data/characterData';

export default function CharacterTestResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const rawType = location.state?.resultType;
  const resultType = (rawType && characterData[rawType]) ? rawType : 'T-P-A';
  const resultData = characterData[resultType];
  
  // 결과 저장
  useEffect(() => {
    const saveCharacterToServer = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token || !resultType) return;

      try {
        const response = await fetch('http://localhost:3000/stamps/character', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ code: resultType }),
        });

        const data = await response.json();

        if (!response.ok) {
          const alertMsg = Array.isArray(data.message) ? data.message[0] : data.message;
          console.error('캐릭터 저장 실패:', alertMsg);
        }
      } catch (error) {
        console.error('캐릭터 저장 서버 통신 오류:', error);
      }
    };

    saveCharacterToServer();
  }, [resultType]);

  return (
    <AppLayout showNav={false} showActions={false} showHeader={false}>
      <div className="result-container">
        <div className="title-group">
          <span className="result-subtitle">나의 대전 여행 타입은?</span>
          <h1 className="result-title">{resultData.name}</h1>
          <div className="character-card">
            <div className="image-placeholder">
              <img className="image" src={resultData.image} alt={resultData.name} />
            </div>
          </div>
          <p className="result-tagline">"{resultData.tagline}"</p>
        </div>
        <p className="result-desc">{resultData.desc}</p>
      </div>

      <div className="recommend-box">
        <h3>{resultData.name} 추천 관광 장소</h3>
        <ul>
          {resultData.spots.map((spot, i) => (
            <li key={i}>{spot}</li>
          ))}
        </ul>
      </div>

      <div className="action-group">
        <button className="btn" onClick={() => navigate('/test')}>
          테스트 다시하기
        </button>
      </div>

      <div className="action-group">
        <button className="btn" onClick={() => navigate('/home')}>
          홈으로 돌아가기
        </button>
      </div>
    </AppLayout>
  );
}