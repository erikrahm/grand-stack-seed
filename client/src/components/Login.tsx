import React, { useState } from "react";
import gql from "graphql-tag";
import { Redirect } from "react-router-dom";
import { Mutation } from "react-apollo";
import { Formik, Field, ErrorMessage } from "formik";
import injectSheet from "react-jss";
import { isNil } from "lodash";

import { LoginValidation } from "./form-validation/login";
import { FORM_INPUTS } from "./constants/styleConstants";
import { colors } from "./constants/colors";

const styles = {
  loginContainer: {
    width: 400,
    margin: [0, "auto"]
  },
  header: {
    fontSize: 48,
    flex: [1, 0, 0],
    color: colors.orange,
    fontWeight: 200,
    marginTop: 0,
    textAlign: "center",
    letterSpacing: 5
  },
  loginForm: {
    display: "flex",
    flex: [1, 0, 0],
    alignItems: "center",
    flexDirection: "column"
  },
  ...FORM_INPUTS
};

const SIGN_IN = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    Login(email: $email, password: $password)
  }
`;

type Props = {
  classes: WithStyle<typeof styles>;
};

const Login: React.FC<Props> = ({ classes }) => {
  const [formError, updateFormError] = useState("");

  return (
    <Mutation mutation={SIGN_IN}>
      {(Login, { data }) => {
        if (data && !isNil(data.Login)) {
          localStorage.setItem("token", data.Login);
          return <Redirect to={{ pathname: "/" }} />;
        }

        return (
          <div className={classes.loginContainer}>
            <h1 className={classes.header}>Login</h1>
            <a href="http://localhost:8000/login-facebook">FACEBOOK</a>
            <Formik
              initialValues={{
                email: "",
                password: ""
              }}
              onSubmit={({ email, password }) => {
                Login({
                  variables: { email, password }
                }).catch(err => {
                  if (err.message)
                    updateFormError("Incorrect Username or Password");
                });
              }}
              validationSchema={LoginValidation}
            >
              {props => (
                <form
                  onSubmit={props.handleSubmit}
                  className={classes.loginForm}
                >
                  {formError && <div>{formError}</div>}
                  <label className={classes.label}>
                    <span>Email</span>
                    <Field
                      type="email"
                      name="email"
                      placeholder="Email"
                      className={classes.formField}
                    />
                    <ErrorMessage name="email" />
                  </label>
                  <label className={classes.label}>
                    <span>Password</span>
                    <Field
                      type="password"
                      name="password"
                      placeholder="Password"
                      className={classes.formField}
                    />
                    <ErrorMessage name="password" />
                  </label>
                  <button type="submit" className={classes.button}>
                    Sign In
                  </button>
                </form>
              )}
            </Formik>
          </div>
        );
      }}
    </Mutation>
  );
};

export default injectSheet(styles)(Login);
