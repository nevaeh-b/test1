import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/CharacterTest.css';

const questions = [
  {
    id: 1,
    type: 'theme',
    question: 'Q1. 이번 대전 여행을 결심한 가장 큰 이유는?',
    options: [
      { text: '요즘 핫한 카페와 맛집에 방문하기 위해서!', value: 'T' },
      { text: '평화로운 자연 속에서 편하게 힐링하기 위해서!', value: 'N' },
      { text: '신기한 과학관 체험이나 전시, 대전만의 이색 공간을 경험하기 위해서!', value: 'E' }
    ]
  },
  {
    id: 2,
    type: 'theme',
    question: 'Q2. 여행지에 도착해서 가장 먼저 사진으로 담고 싶은 것은?',
    options: [
      { text: '감성 넘치는 카페와 예쁜 대표 메뉴', value: 'T' },
      { text: '탁 트인 호수 뷰, 초록초록한 숲길과 푸른 하늘', value: 'N' },
      { text: '독특한 건축물이나 이색적인 전시', value: 'E' }
    ]
  },
  {
    id: 3,
    type: 'theme',
    question: 'Q3. 대전 여행 중 하고 가장 만족스러운 순간은?',
    options: [
      { text: '웨이팅 끝에 들어간 핫플 카페나 맛집의 첫 입이 완벽했을 때', value: 'T' },
      { text: '시원한 바람을 맞으며 탁 트인 풍경이나 숲길을 한적하게 걸을 때', value: 'N' },
      { text: '호기심을 자극하는 신기한 전시나 체험에 몰입할 때', value: 'E' }
    ]
  },
  {
    id: 4,
    type: 'plan',
    question: 'Q4. 대전으로 출발하기 전날 밤, 나의 검색창 상태는?',
    options: [
      { text: '시간대별 동선, 맛집 휴무일, 주차장 정보까지 빼곡하게 찾아두었다.', value: 'P' },
      { text: '가고 싶은 대표 목적지 한두 개만 검색해보았다.', value: 'F' }
    ]
  },
  {
    id: 5,
    type: 'plan',
    question: 'Q5. 가려던 맛집이 갑자기 재료 소진으로 문을 닫았다면?',
    options: [
      { text: '당황하지 않고 미리 찾아둔 맛집 후보를 꺼낸다.', value: 'P' },
      { text: '어쩔 수 없지! 바로 근처 느낌이 좋은 식당으로 들어간다.', value: 'F' }
    ]
  },
  {
    id: 6,
    type: 'plan',
    question: 'Q6. 여행 중 이동 수단과 동선을 정할 때 나는?',
    options: [
      { text: '이동 시간과 버스/지하철 배차 간격까지 미리 체크해 둔다.', value: 'P' },
      { text: '일단 출발하고, 길찾기 앱이 시키는 대로 그때그때 움직인다.', value: 'F' }
    ]
  },
  {
    id: 7,
    type: 'pace',
    question: 'Q7. 하루 일정을 다 마친 저녁 7시, 체력이 조금 남아있는 것 같다면?',
    options: [
      { text: '아직 숙소 가긴 아까워! 야경 명소나 야시장으로 향한다.', value: 'A' },
      { text: '오늘도 알찼다~ 바로 숙소로 돌아가 맛있는 야식을 먹으며 휴식한다.', value: 'C' }
    ]
  },
  {
    id: 8,
    type: 'pace',
    question: 'Q8. 내가 생각하는 가장 이상적인 여행의 모습은?',
    options: [
      { text: '아침부터 밤까지 가보고 싶던 장소들을 알차게 꽉꽉 채워 다녀오는 여행', value: 'A' },
      { text: '한두 곳만 가더라도 여유롭게 돌아다니며 한가로움을 즐기는 여행', value: 'C' }
    ]
  },
  {
    id: 9,
    type: 'pace',
    question: 'Q9. 여행 중 예상보다 일정이 1시간 일찍 끝났을 때 나는?',
    options: [
      { text: '근처에 있는 가볼 만한 곳을 하나 더 검색해서 들른다.', value: 'A' },
      { text: '오예! 다음 목적지로 일찍 넘어가거나 카페에서 느긋하게 멍 때린다.', value: 'C' }
    ]
  }
];

export default function CharacterTest() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExitModal, setShowExitModal] = useState(false);

  const navigate = useNavigate();
  const currentQ = questions[currentIndex];

  const hasSelectedCurrent = !!selectedAnswers[currentQ.id];

  // 중간 나가기
  const handleClose = () => setShowExitModal(true);
  const handleConfirmExit = () => navigate('/home');
  const handleCancelExit = () => setShowExitModal(false);

  // 뒤로 가기
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // 앞으로 가기
  const handleNext = () => {
    if (currentIndex < questions.length - 1 && hasSelectedCurrent) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSelect = (val) => {
    const updatedAnswers = {
      ...selectedAnswers,
      [currentQ.id]: val
    };
    setSelectedAnswers(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 200);
    } else { // 결과 도출 함수 이용
      const resultType = calculateResult(updatedAnswers);
      navigate('/test/result', { state: { resultType } });
    }
  };

  // 결과 도출 함수
  const calculateResult = (allAnswers) => {
    const themeCounts = { T: 0, N: 0, E: 0 };
    const planCounts = { P: 0, F: 0 };
    const paceCounts = { A: 0, C: 0 };

    questions.forEach((q) => {
      const selectedValue = allAnswers[q.id];
      if (!selectedValue) return;

      if (q.type === 'theme') themeCounts[selectedValue] = (themeCounts[selectedValue] || 0) + 1;
      if (q.type === 'plan') planCounts[selectedValue] = (planCounts[selectedValue] || 0) + 1;
      if (q.type === 'pace') paceCounts[selectedValue] = (paceCounts[selectedValue] || 0) + 1;
    });

    const { T, N, E } = themeCounts;
    let themeCode = 'T';
    const q3Answer = allAnswers[3];

    if (N > T && N >= E) themeCode = 'N';
    else if (E > T && E > N) themeCode = 'E';
    else if (q3Answer === 'N') themeCode = 'N';
    // 테마 관련 질문에서 각각 동점이 나올 경우, 마지막 질문을 기준으로 유형 결정
    else if (q3Answer === 'E') themeCode = 'E';

    const planCode = planCounts.P >= 2 ? 'P' : 'F';
    const paceCode = paceCounts.A >= 2 ? 'A' : 'C';

    return `${themeCode}-${planCode}-${paceCode}`;
  };

  return (
    <AppLayout showNav={false} showActions={false} showHeader={false}>
      <div className="survey-container">
        {/* 상단 헤더 */}
        <div className="survey-header">
          <div className="header-left-group">
            {currentIndex > 0 ? (
              <button className="nav-btn icon-btn" onClick={handlePrev} aria-label="이전 질문">
                <img src="/icons/뒤로.png" alt="뒤로" className="nav-icon" />
              </button>
            ) : (
              <div className="nav-btn-placeholder" />
            )}

            <span className="step-badge">
              <strong className="current-step">{currentIndex + 1}</strong>
              <span className="total-step"> / {questions.length}</span>
            </span>

            {currentIndex < questions.length - 1 ? (
              <button
                className={`nav-btn icon-btn ${!hasSelectedCurrent ? 'disabled' : ''}`}
                onClick={handleNext}
                disabled={!hasSelectedCurrent}
                aria-label="다음 질문"
              >
                <img src="/icons/앞으로.png" alt="앞으로" className="nav-icon" />
              </button>
            ) : (
              <div className="nav-btn-placeholder" />
            )}
          </div>

          <button className="close-btn" onClick={handleClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* 질문 영역 */}
        <div className="question-box">
          <h2 className="question-title">{currentQ.question}</h2>
          <div className="options-group">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === option.value;
              return (
                <button
                  key={idx}
                  className={`option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="option-indicator">{isSelected ? '✓' : ''}</span>
                  <span className="option-text">{option.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* X 클릭 시 모달 */}
        {showExitModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <p className="modal-title">테스트를 나가시겠어요?</p>
              <p className="modal-sub">지금 나가시면 진행 상황이 저장되지 않습니다.</p>
              <div className="modal-buttons">
                <button className="modal-btn cancel" onClick={handleCancelExit}>
                  계속하기
                </button>
                <button className="modal-btn confirm" onClick={handleConfirmExit}>
                  나가기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}