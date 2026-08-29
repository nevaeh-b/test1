import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/NightTour.css';

export default function NightTour() {
  const navigate = useNavigate();

  const nightEvents = [
    { id: 1, title: '열기구 야간 라이팅 쇼', location: '국립중앙과학관', time: '19:00 ~ 21:30', tag: 'D-DAY' },
    { id: 2, title: '달빛 버스킹', location: '엑스포 다리 밑', time: '20:00 ~ 22:00', tag: 'HOT' },
    { id: 3, title: '심야 먹깨비 야시장', location: '대전 중앙시장', time: '18:00 ~ 23:00', tag: 'NEW' }
  ];

  return (
    <AppLayout showActions={false} showNav={false} showBack={true} title="야간 관광 추천" onBack={()=>navigate('/home')}>

      <div className="night-tour-container">
        <div className="night-content">
          
          <section className="section-group">
            <div className="section-header-row">
              <div>
                <div className="section-title">오늘의 심야 이벤트</div>
                <p className="section-subtitle">지금 대전에서 열리고 있는 밤 축제들!</p>
              </div>
            </div>
            
            <div className="event-vertical-list">
              {nightEvents.map((event) => (
                <div key={event.id} className="event-rectangle-card">
                  <div className="event-card-left">
                    <span className="event-tag">{event.tag}</span>
                    <h3 className="event-title">{event.title}</h3>
                  </div>
                  <div className="event-card-right">
                    <p className="event-info">{event.location}</p>
                    <p className="event-time">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

