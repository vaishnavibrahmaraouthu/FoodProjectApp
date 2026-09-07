import React from "react";

const Footer = () => {
  return (
    <>
      <footer>
        <span className="footer-brand">🍽️ OderIt</span>
        <p>Discover the best food around you — fast, fresh & delicious.</p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.78rem" }}>
          © {new Date().getFullYear()} OderIt · All Rights Reserved
        </p>
      </footer>
    </>
  );
};

export default Footer;
