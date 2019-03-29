import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import injectSheet from "react-jss";
import { colors } from "./constants/colors";

import Logout from "./Logout";

const styles = {
  header: {
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    background: "#f1f1f1",
    color: colors.black,
    display: "flex",
    alignItems: "center"
  },
  container: {
    width: 600,
    margin: [0, "auto"],
    color: colors.orange
  },
  logo: {
    display: "inline-block",
    padding: [20, 80]
  },
  heading: {
    color: colors.green
  },
  logoutButton: {
    position: "absolute",
    right: 80
  }
};

const GET_USERS = gql`
  {
    currentUser {
      username
    }
    users {
      id
      username
      email
    }
  }
`;

type Props = {
  classes: WithStyle<typeof styles>;
};

const Home: React.FC<Props> = ({ classes }) => {
  return (
    <>
      <header className={classes.header}>
        <h1 className={classes.logo}>Grand Stack Starter</h1>
        <Logout containerClass={classes.logoutButton} />
      </header>
      <Query query={GET_USERS}>
        {({ loading, error, data }) => {
          if (loading) return "Loading...";
          if (error) return `Error! ${error.message}`;

          return (
            <main className={classes.container}>
              <h2 className={classes.heading}>
                Hello {data.currentUser.username}, here's a list of all the
                current users:
              </h2>
              <ul>
                {data.users.map((user: any) => (
                  <li key={user.id}>{user.username}</li>
                ))}
              </ul>
            </main>
          );
        }}
      </Query>
    </>
  );
};

export default injectSheet(styles)(Home);
