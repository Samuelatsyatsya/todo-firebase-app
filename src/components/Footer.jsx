import React from "react";

const Footer = () => (
  <footer style={{
    marginTop: "3rem",
    textAlign: "center",
    color: "#888",
    fontSize: "0.85rem"
  }}>
    &copy; {new Date().getFullYear()} SAM - K To-Do App.
  </footer>
);

export default Footer;
