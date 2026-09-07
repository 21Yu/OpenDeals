import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainPage from "./pages/MainPage";
import AboutPage from "./pages/AboutPage";
import ProfilePage from "./pages/ProfilePage";
import { AddedItemsPage } from "./pages/AddedItemsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />}/>
        <Route path="/about" element={<AboutPage />}/>
        <Route path="/profile" element={<ProfilePage />}/>
        <Route path="/addeditems" element={<AddedItemsPage />}/>
      </Routes>
    </BrowserRouter>
  );
}