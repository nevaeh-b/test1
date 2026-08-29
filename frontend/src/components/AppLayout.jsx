import Header from './Header';
import BottomNav from './BottomNav';

export default function AppLayout({ children, showHeader = true, showNav = true,
  showActions = true, points, title, showBack, onBack, showHelp = false, helpTitle = "안내사항", helpContent = null, }) {
  return (
    <div className="app-viewport">
      {showHeader && <Header 
          points={points} 
          title={title}     
          showActions={showActions} 
          showBack={showBack} 
          onBack={onBack}
          showHelp={showHelp}
          helpTitle={helpTitle}
          helpContent={helpContent}     
        />}
      
      {/* 스크롤 영역 */}
      <main className="app-content">
        {children}
      </main>

      {showNav && <BottomNav />}
    </div>
  );
}