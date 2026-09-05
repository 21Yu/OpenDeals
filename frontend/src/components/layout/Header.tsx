import { NavLink } from "react-router-dom";

export default function Header() {
  const getLinkClass = ({ isActive } : { isActive: boolean }) =>
    `px-3 md:px-12 flex items-center text-[12px] font-bold ${
      isActive 
        ? "text-rose-300" 
        : ""
    }`;

  return (
    <header>

      <nav className="h-[60px] flex border-b border-gray-300">
        
        <h1 className="px-4 md:px-8 items-center flex font-bold">OpenDeals</h1>

        <NavLink to="/" className={getLinkClass}>
          Home
        </NavLink>

        <NavLink to="/about" className={getLinkClass}>
          About
        </NavLink>

        <NavLink to="/profile" className={getLinkClass}>
          Profile
        </NavLink>

        <NavLink to="/saveditems" className={getLinkClass}>
          Saved Items
        </NavLink>

      </nav>
    </header>
  );
}