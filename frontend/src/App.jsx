import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 페이지 불러오기
import LoginFindPw from './pages/LoginFindPw';
import LoginFindId from './pages/LoginFindId';
import Login from './pages/Login';
import LoginResetPw from './pages/LoginResetPw';

import MyStamp from './pages/StampBoard';
import MyLocalCurrency from './pages/PointConversion';
import MySetting from './pages/Settings';
import SignupTourist from './pages/TouristVerification';
import SignupComplete from './pages/SignupComplete';
import SignupProfileImg from './pages/SignupProfile';
import Signup from './pages/Signup'; 
import IDVerify from './pages/SignupVerification';
import Alarm from './pages/Notification';

import MyPlaceVerify from './pages/PlaceVerification';
import MyAccommodationVerify from './pages/AccommodationVerification';
import MyPage from './pages/MyPage';
import FAQPage from './pages/FAQ';
import KakaoInquiryPage from './pages/KaKaoInquiry';
import Notice from './pages/SettingNotice';

import MyProfileEdit from './pages/ProfileEdit';
import Account from './pages/SettingAccount';
import Permission from './pages/SettingPermission';
import Screen from './pages/SettingScreen';
import Privacy from './pages/SettingPrivacy';
import TermsPage from './pages/Terms';

import CharacterTest from './pages/CharacterTest'
import TestResult from './pages/CharacterTestResult'
import TestStart from './pages/CharacterTestStart'

import Splash from './pages/Splash';

import CourseSearch from './pages/CourseSearch';
import CourseResult from './pages/CourseSearchResult';
import CourseDetail from './pages/CourseDetail';
import CourseSave from './pages/CourseSaved';
import Course from './pages/Course';

import CongestionRating from './pages/CongestionEvaluation';
import Congestion from './pages/Congestion';

import Home from './pages/Home';
import NightTour from './pages/NightTour';
import OnBoarding from './pages/Onboarding';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 접속 경로 */}
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/onboarding" element={<OnBoarding />} />
        
        {/* 로그인 관련 */}
        <Route path="/login" element={<Login />} />
        <Route path="/login/find-id" element={<LoginFindId />} />
        <Route path="/login/find-pw" element={<LoginFindPw />} />
        <Route path ="/login/reset-pw" element={<LoginResetPw/>}/>
        
        {/* 회원가입 관련 */}
        <Route path="/signup/tourist" element={<SignupTourist mode="signup"/>} />
        <Route path="/signup/profile-img" element={<SignupProfileImg />} />
        <Route path="/signup/complete" element={<SignupComplete />} />
        <Route path="/signup" element={<Signup />} /> 
        <Route path="/signup/idverify" element={<IDVerify/>}/>

        {/* 마이페이지 관련 */}
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/setting" element={<MySetting />} />
        <Route path="/mypage/stamp" element={<MyStamp />} />
        <Route path="/mypage/currency" element={<MyLocalCurrency />} />
        <Route path="/mypage/place-verify" element={<MyPlaceVerify />} />
        <Route path="/mypage/accommodation-verify" element={<MyAccommodationVerify />} />
        <Route path="/mypage/faq" element={<FAQPage />} />
        <Route path="/mypage/inquiry" element={<KakaoInquiryPage />} />
        <Route path="/mypage/notice" element={<Notice />} />

        {/* 마이페이지 설정 관련 */}
        <Route path="/mypage/edit" element={<MyProfileEdit />} />
        <Route path="/mypage/account" element={<Account />} />
        <Route path="/mypage/permission" element={<Permission />} />
        <Route path="/mypage/screen" element={<Screen />} />
        <Route path="/mypage/privacy" element={<Privacy />} />
        <Route path="/mypage/terms" element={<TermsPage />} />
        <Route path="/mypage/tourist" element={<SignupTourist mode="mypage"/>} />
        
        {/* 유형테스트 관련 */}
        <Route path="/test" element={<CharacterTest />} />
        <Route path="/test/result" element={<TestResult />} />
        <Route path="/test/start" element={<TestStart />} />

        {/* 코스 관련 */}
        <Route path="/course" element={<Course />} />
        <Route path="/course/search" element={<CourseSearch />} />
        <Route path="/course/result" element={<CourseResult />} />
        <Route path="/course/detail/:id" element={<CourseDetail />} />
        <Route path="/course/save" element={<CourseSave />} />

        {/* 혼잡도 관련 */}
        <Route path="/congestion" element={<Congestion />} />
        <Route path="/congestion/rating" element={<CongestionRating />} />

        {/* 알림 페이지 경로 */}
        <Route path="/alarm" element={<Alarm />} />

        {/*야간 관광 경로*/}
        <Route path="/nighttour" element={<NightTour/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;