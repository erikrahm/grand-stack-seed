import React, { useState } from "react";
import gql from "graphql-tag";
import { Redirect } from "react-router-dom";
import { Mutation } from "react-apollo";
import { Formik, Field, ErrorMessage } from "formik";
import injectSheet from "react-jss";

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
    Login(email: $email, password: $password, token: "") {
      id
      password
      token
      username
    }
  }
`;

const Login = ({ classes }: any) => {
  const [formError, updateFormError] = useState("");
  return (
    <Mutation mutation={SIGN_IN}>
      {(Login, { data }) => {
        if (data && data.Login) {
          console.log(data);
          localStorage.setItem("token", data.Login.token);
          return <Redirect to={{ pathname: "/" }} />;
        }

        return (
          <div className={classes.loginContainer}>
            <h1 className={classes.header}>Login</h1>
            <Formik
              initialValues={{
                email: "",
                username: "",
                password: "",
                confirmPassword: ""
              }}
              onSubmit={({ email, password }) => {
                console.log(email, password);
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
