import { NavLink } from "react-router-dom";

export default function Header() {
  const getLinkClass = ({ isActive } : { isActive: boolean }) =>
    `site-nav-link ${isActive ? "is-active" : ""}`;

  return (
    <header className="site-header">
      <nav className="site-nav">
        <NavLink to="/" className="brand-mark" aria-label="OpenDeals home">
          <span className="brand-symbol" aria-hidden="true">O</span>
          <span>Open<span className="brand-accent">Deals</span></span>
        </NavLink>

        <NavLink to="/" className={getLinkClass}>
          Home
        </NavLink>

        <NavLink to="/about" className={getLinkClass}>
          About
        </NavLink>

        <NavLink to="/profile" className={getLinkClass}>
          Profile
        </NavLink>

        <NavLink to="/addeditems" className={getLinkClass}>
          Saved
        </NavLink>

      </nav>
    </header>
  );
}