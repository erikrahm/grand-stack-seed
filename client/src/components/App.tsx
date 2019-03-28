import React, { Component } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { ApolloLink, concat } from "apollo-link";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider } from "react-apollo";
import injectSheet from "react-jss";

import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import { colors } from "../utils/colors";

const styles = {
  appContainer: {
    position: "relative",
    background: colors.black,
    minHeight: "100vh",
    display: "flex",
    verticalAlign: "middle",
    alignItems: "center"
  }
};

const httpLink = new HttpLink({
  uri: process.env.GRAPHQL_URI || "http://localhost:8000/graphql"
});

const authMiddleware = new ApolloLink((operation, forward: any) => {
  // add the authorization to the headers
  operation.setContext({
    headers: {
      authorization: localStorage.getItem("token") || null
    }
  });

  return forward(operation);
});

const client = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache()
});

const checkAuth = () => {
  const token = localStorage.getItem("token");
  if (token) {
    return true;
  }

  return false;
};

const AuthRoute = ({ ...rest }) => (
  <Route
    {...rest}
    render={() =>
      checkAuth() ? <Home /> : <Redirect to={{ pathname: "/login" }} />
    }
  />
);

const App = ({ classes }: any) => (
  <ApolloProvider client={client}>
    <div className={classes.appContainer}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <AuthRoute exact path="/" />
        </Switch>
      </BrowserRouter>
    </div>
  </ApolloProvider>
);

export default injectSheet(styles)(App);
