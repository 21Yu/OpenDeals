import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainPage from "./pages/MainPage";
import AboutPage from "./pages/AboutPage";
// import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />}/>
        <Route path="/about" element={<AboutPage />}/>
        {/* <Route path="/profile" element={<ProfilePage />}/> */}
        {/* <Route path="/saveditems" element={<SavedListingsPage />}/> */}
      </Routes>
    </BrowserRouter>
  );
}