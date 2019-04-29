import React from "react";
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
import { colors } from "./constants/colors";

const styles = {
  appContainer: {
    position: "relative",
    background: colors.black,
    minHeight: "100vh",
    display: "flex",
    verticalAlign: "middle",
    alignItems: "center",
    overflowX: "hidden",
    maxWidth: "100%"
  }
};

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_URI || "http://localhost:8000/graphql"
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
  } else {
    const queryParams = new URLSearchParams(window.location.search);
    const altToken = queryParams.get("token");
    if (altToken) {
      localStorage.setItem("token", altToken);
      return true;
    }
    return false;
  }
};

const AuthRoute = ({ ...props }) => (
  <Route
    {...props}
    render={() =>
      checkAuth() ? <Home /> : <Redirect to={{ pathname: "/login" }} />
    }
  />
);

type Props = {
  classes: WithStyle<typeof styles>;
};

const App: React.FC<Props> = ({ classes }) => (
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
