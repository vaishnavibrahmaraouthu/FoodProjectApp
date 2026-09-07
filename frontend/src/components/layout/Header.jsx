import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Route, Routes } from "react-router-dom";
import { logout } from "../../redux/actions/userActions";

import { toast } from "react-toastify";

import Search from "./Search";
import "../../App.css";


const Header = () => {
  const dispatch = useDispatch();

  // Updated slice
  const { user, loading } = useSelector((state) => state.user);
  const {cartItems} = useSelector((state => state.cart))
  const avatarUrl =
    user?.avatar?.url
      ? user.avatar.url
      : "/images/avatar4.jpg";


  const logoutHandler = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
  };

  return (
    <>
      <nav className="navbar row sticky-top">
        {/* Logo */}
        <div className="col-12 col-md-3">
          <Link to="/">
            <img src="/images/logo.webp" alt="logo" className="logo" />
          </Link>
        </div>

        {/* Search */}
        <div className="col-12 col-md-6 mt-2 mt-md-0">
          <Search />
        </div>

        {/* Right side */}
        <div className="col-12 col-md-3 mt-3 mt-md-0 d-flex align-items-center justify-content-center justify-content-md-end" style={{ gap: "1rem" }}>
          <Link to="/cart" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span id="cart">
              🛒 Cart
            </span>
            <span id="cart_count">
              {cartItems.length}
            </span>
          </Link>

          {user ? (
            <div className="dropdown d-inline">
              <Link
                to="/"
                className="btn dropdown-toggle"
                id="dropDownMenuButton"
                data-toggle="dropdown"
              >
                <figure className="avatar avatar-nav">
                  <img
                    src={avatarUrl}
                    alt={user?.name}
                    className="rounded-circle"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/avatar4.jpg";
                    }}
                  />
                </figure>
                <span>{user?.name}</span>
              </Link>

              <div className="dropdown-menu dropdown-menu-right">
                <Link
                  className="dropdown-item"
                  to="/eats/orders/me/myOrders"
                >
                  📦 Orders
                </Link>

                <Link className="dropdown-item" to="/users/me">
                  👤 Profile
                </Link>

                <Link
                  className="dropdown-item text-danger"
                  to="/"
                  onClick={logoutHandler}
                >
                  🚪 Logout
                </Link>
              </div>
            </div>
          ) : (
            !loading && (
              <Link to="/users/login" className="btn" id="login_btn">
                Login
              </Link>
            )
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;