import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/SettingAccount.css'; 
import '../styles/SettingNotice.css'; 

export default function SettingNotice() {
  const navigate = useNavigate();

  const notices = [
    { id: 1, title: "[안내] 서버 점검 및 업데이트 안내", date: "2026.08.05" },
    { id: 2, title: "[이벤트] 대전 야간 관광 챌린지 오픈!", date: "2026.07.20" },
    { id: 3, title: "[안내] 개인정보 처리방침 변경 안내", date: "2026.07.01" },
  ];

  return (
    <AppLayout showHeader={true} title="공지사항" showNav={false} showActions={false} showBack={true} onBack={() => navigate(-1)}>
        <div className="notice-list">
          {notices.map(notice => (
            <div key={notice.id} className="notice-item">
              <div className="notice-title">{notice.title}</div>
              <div className="notice-date">{notice.date}</div>
            </div>
          ))}
        </div>
    </AppLayout>
  );
}