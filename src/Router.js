import React from 'react';
import { Route, Routes } from 'react-router-dom';
// page
import Home from './page/Home';
import Detail from './page/Detail';
import Signup from './page/Signup';
import Login from './page/Login';
import SearchAddress from './page/SearchAddress';
import PwFind from './page/PwFind';
import IdFind from './page/IdFind';
import Mypage from './page/Mypage';
import Myprofile from './page/Myprofile';
import Petprofile from './page/Petprofile';
import PetprofileForm from './page/PetprofileForm';
import PwChange from './page/PwChange';
import Reservation from './page/Reservation';
import ReservationList from './page/ReservationList';
import ReservationDetail from './page/ReservationDetail';
import SitterProfile from './page/SitterProfile';
import SitterProfileForm1 from './page/SitterProfileForm1';
import SitterProfileForm2 from './page/SitterProfileForm2';
import SitterProfileForm3 from './page/SitterProfileForm3';
import SitterProfileForm4 from './page/SitterProfileForm4';
import Auth from './shared/Auth';
import ChatList from './page/ChatList';
import ChatRoom from './page/ChatRoom';

 
const Router = ({socket}) => {
  return (
    <Routes>
      <Route path='/' element={<Home />} exact />
      <Route path='/detail/:id' element={<Detail socket={socket}/>} exact />
      <Route path='/signup' element={<Signup />} />
      <Route path='/pwfind' element={<PwFind />} />
      <Route path='/idfind' element={<IdFind />} />
      <Route path='/mypage' element={<Mypage />} />
      <Route path='/mypage/myprofile' element={<Myprofile />} />
      <Route path='/mypage/petprofile' element={<Petprofile />} />
      <Route path='/mypage/petprofileform' element={<PetprofileForm />} />
      <Route
        path='/mypage/:petId/petprofileform'
        element={<PetprofileForm />}
      />
      <Route path='/mypage/sitterprofile' element={<SitterProfile />} />
      <Route
        path='/mypage/SitterProfileForm1'
        element={<SitterProfileForm1 />}
      />
      <Route
        path='/mypage/SitterProfileForm2'
        element={<SitterProfileForm2 />}
      />
      <Route
        path='/mypage/SitterProfileForm3'
        element={<SitterProfileForm3 />}
      />
      <Route
        path='/mypage/SitterProfileForm4'
        element={<SitterProfileForm4 />}
      />
      <Route path='/pwchange' element={<PwChange />} />
      <Route path='/login' element={<Login socket={socket}/>}></Route>
      <Route path='/search' element={<SearchAddress />}></Route>
      <Route path='/reservation' element={<Reservation />}></Route>
      ReservationDetail
      <Route path='/reservation/list' element={<ReservationList socket={socket}/>}></Route>
      <Route
        path='/reservation/detail/:type/:id'
        element={<ReservationDetail />}
      ></Route>
      <Route path="/oauth/kakao/callback" element={<Auth />}></Route>
      <Route path="/chats" element={<ChatList />}></Route>
      <Route path="/chats/:id" element={<ChatRoom />}></Route>
      <Route path='*' element={<Home replace to='/' />} />
    </Routes>
  );
};

export default Router;
