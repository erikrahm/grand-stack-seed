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

type Props = {
  classes: WithStyle<typeof styles>;
  containerClass: string;
};

const Logout: React.FC<Props> = ({ classes, containerClass }) => (
  <div className={containerClass}>
    <button type="button" onClick={submitLogout} className={classes.button}>
      Logout
    </button>
  </div>
);

export default injectSheet(styles)(Logout);
