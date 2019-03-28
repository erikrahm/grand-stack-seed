import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";

import Logout from "./Logout";

const GET_USERS = gql`
  {
    users {
      id
      username
      email
      username
      password
    }
  }
`;

const Home = () => {
  return (
    <>
      <header>
        <h1>Dictionary</h1>
        <Logout />
      </header>
      <Query query={GET_USERS}>
        {({ loading, error, data }) => {
          if (loading) return "Loading...";
          if (error) return `Error! ${error.message}`;

          return (
            <main>
              <h1>Hi</h1>
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

export default Home;
