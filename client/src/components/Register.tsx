import React from "react";
import gql from "graphql-tag";
import { Redirect } from "react-router-dom";
import { Mutation } from "react-apollo";
import { Formik, Field, ErrorMessage } from "formik";

import { RegisterValidation } from "./form-validation/login";

const REGISTER = gql`
  mutation RegisterMutation(
    $email: String!
    $password: String!
    $username: String!
  ) {
    RegisterUser(email: $email, username: $username, password: $password) {
      id
    }
  }
`;

const Register = () => {
  return (
    <Mutation mutation={REGISTER}>
      {(RegisterUser, { data }) => {
        if (data && !!data.RegisterUser.id) {
          return <Redirect to={{ pathname: "/login" }} />;
        }

        return (
          <Formik
            initialValues={{
              email: "",
              username: "",
              password: "",
              confirmPassword: ""
            }}
            onSubmit={({ email, username, password }) => {
              RegisterUser({ variables: { email, username, password } });
            }}
            validationSchema={RegisterValidation}
          >
            {props => (
              <form onSubmit={props.handleSubmit}>
                <Field type="email" name="email" placeholder="Email" />
                <ErrorMessage name="email" />
                <Field type="text" name="username" placeholder="Username" />
                <ErrorMessage name="username" />
                <Field type="password" name="password" placeholder="Password" />
                <ErrorMessage name="password" />
                <Field
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                />
                <ErrorMessage name="confirmPassword" />
                <button type="submit">Submit</button>
              </form>
            )}
          </Formik>
        );
      }}
    </Mutation>
  );
};

export default Register;
