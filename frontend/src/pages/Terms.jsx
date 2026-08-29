import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/Terms.css';

// 사용자 약관 (샘플)
const TERMS_DATA = [
  {
    id: 1,
    title: '제 1 조 (목적)',
    content: `본 약관은 회사가 제공하는 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.`
  },
  {
    id: 2,
    title: '제 2 조 (용어의 정의)',
    content: `1. "서비스"란 회사가 제공하는 모든 인터넷 기반 서비스를 의미합니다.\n2. "회원"이란 본 약관에 동의하고 계정을 등록하여 서비스를 이용하는 고객을 말합니다.\n3. "계정"이란 회원의 식별과 서비스 이용을 위하여 회원이 정한 문자와 숫자의 조합을 의미합니다.`
  },
  {
    id: 3,
    title: '제 3 조 (약관의 효력 및 변경)',
    content: `1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.\n2. 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.`
  },
  {
    id: 4,
    title: '제 4 조 (개인정보 보호 의무)',
    content: `회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.`
  },
  {
    id: 5,
    title: '제 5 조 (서비스의 제공 및 중단)',
    content: `1. 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.\n2. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.`
  }
];

export default function Terms() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(1); // 첫번째 약관은 기본적으로 열어두기

  const toggleTerm = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <AppLayout showHeader={true} title="서비스 이용약관" showNav={false} showActions={false} showBack={true} onBack={() => navigate(-1)}
    >
      <div className="terms-container">
        {/* 안내 */}
        <div className="terms-header-info">
          <h2 className="terms-main-title">서비스 이용약관 안내</h2>
          <p className="terms-sub-text">
            서비스 이용을 위한 표준 약관입니다. 제목을 클릭하시면 상세 내용을 확인하실 수 있습니다.
          </p>
        </div>

        {/* 약관 리스트 */}
        <div className="terms-list">
          {TERMS_DATA.map((term) => {
            const isOpen = openId === term.id;
            return (
              <div
                key={term.id}
                className={`predict-card term-card ${isOpen ? 'open' : ''}`}
                onClick={() => toggleTerm(term.id)}
              >
                <div className="term-header">
                  <h3 className="term-title">{term.title}</h3>
                  <span className={`arrow-icon ${isOpen ? 'up' : 'down'}`}>
                    ▼
                  </span>
                </div>

                {isOpen && (
                  <div className="term-content-box">
                    <p className="term-content">{term.content}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}