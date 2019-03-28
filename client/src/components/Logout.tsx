import React from "react";
import { BUTTON } from "./constants/styleConstants";
import injectSheet from "react-jss";
import classes from "*.module.sass";

const styles = {
  ...BUTTON
};

const submitLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/";
};

const Logout = ({ classes, containerClass }: any) => (
  <div className={containerClass}>
    <button type="button" onClick={submitLogout} className={classes.button}>
      Logout
    </button>
  </div>
);

export default injectSheet(styles)(Logout);
