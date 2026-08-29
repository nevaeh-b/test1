import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/FAQ.css';

// 질문 데이터 (샘플)
const FAQ_DATA = [
  {
    id: 1,
    question: '서비스 이용 시간은 어떻게 되나요?',
    answer: '저희 서비스는 연중무휴 24시간 언제든지 이용하실 수 있습니다. 단, 정기 점검 시간(매월 첫째 주 월요일 새벽 2시~4시)에는 이용이 제한될 수 있습니다.'
  },
  {
    id: 2,
    question: '비밀번호를 분실했는데 어떻게 찾나요?',
    answer: '로그인 화면 하단의 [비밀번호 찾기] 버튼을 눌러 등록된 이메일 또는 휴대폰 번호로 인증을 진행하시면 새로운 비밀번호를 설정할 수 있습니다.'
  }
];

export default function FAQ() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState(null);

  // 검색 필터링
  const filteredFaqs = FAQ_DATA.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCard = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <AppLayout showHeader={true} title="자주 묻는 질문" showNav={false} showActions={false} showBack={true} onBack={() => navigate(-1)}
    >
      <div className="faq-container">
        {/* 질문 검색 */}
        <section className="question-search">
          <div className="search-input-box">
            <div className="search-state-layer">
              <div className="search-text-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="질문 검색하기"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button type="button" aria-label="검색" className="search-icon-btn">
                <img src="/icons/검색.png" alt="검색" />
              </button>
            </div>
          </div>
        </section>

        {/* 질문 카드 리스트 */}
        <section className="faq-list">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className={`predict-card faq-card ${isOpen ? 'open' : ''}`}
                  onClick={() => toggleCard(faq.id)}
                >
                  <div className="faq-header">
                    <div className="faq-question-box">
                      <span className="badge-q">Q</span>
                      <h3 className="faq-question">{faq.question}</h3>
                    </div>
                    <span className={`arrow-icon ${isOpen ? 'up' : 'down'}`}>
                     <img src="/icons/아래로.png" alt="열기/닫기" className="arrow-img" />
                    </span>
                    </div>
                  
                  {isOpen && (
                    <div className="faq-answer-box">
                      <span className="badge-a">A</span>
                      <p className="faq-answer">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="no-result">검색 결과가 없습니다.</div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}