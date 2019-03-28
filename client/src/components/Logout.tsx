import React from "react";

const submitLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/";
};

const Logout = () => (
  <button type="button" onClick={submitLogout}>
    Logout
  </button>
);

export default Logout;
