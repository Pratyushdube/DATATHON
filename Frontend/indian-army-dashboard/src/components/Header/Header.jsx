import React from 'react';
import './Header.css';
import logo from '../../images/logo.png';
import avatar from '../../images/avatar.png';

const Header = () => {
  return (
    <header className="header">
      <div className="header__left">
        <img src={logo} alt="Logo" className="header__logo" />
        <h1 className="header__title"> QGAN Dashboard</h1>
      </div>
      <div className="header__right">
        <div className="header__user">
          <img src={avatar} alt="Avatar" className="header__avatar" />
          <span className="header__username">John Doe</span>
        </div>
      </div>
    </header>
  );
};

export default Header;