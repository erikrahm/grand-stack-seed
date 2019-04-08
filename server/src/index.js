import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { ApolloServer, gql } from "apollo-server-express";
import { v1 as neo4j } from "neo4j-driver";
import { makeAugmentedSchema, neo4jgraphql } from "neo4j-graphql-js";
import jwt from "jsonwebtoken";
import passport from "passport";
import FacebookStrategy from "passport-facebook";
import { isNil, kebabCase } from "lodash";

import { typeDefs } from "./graphql-schema";
import { resolvers } from "./resolvers";
import { createToken } from "./auth/auth";

// Graph our environment variables from our .env file and create a variable for our JWT secret
dotenv.config();
const SECRET = process.env.JWT_SECRET;

// Create express app
const app = express();

// Create a configured neo4j driver instance (this doesn't start a session)
const driver = neo4j.driver(
  process.env.NEO4J_URI || "bolt://localhost:7687",
  neo4j.auth.basic(
    process.env.NEO4J_USER || "neo4j",
    process.env.NEO4J_PASSWORD || "neo4j"
  )
);

// Custom middleware to add a user object to the server requests
const injectUser = async req => {
  const token = req.headers.authorization;
  try {
    const { user } = await jwt.verify(token, SECRET);
    req.user = user;
  } catch (error) {
    console.error(error);
  }
  req.next();
};

// Setting up our Facebook strategy for passport
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FB_ID, // found on your facebook app profile
      clientSecret: process.env.FB_SECRET, // found on your facebook app profile
      callbackURL: process.env.FB_CALLBACK_URI, // should be the base URI for your server followed `/login-facebook/callback`
      profileFields: ["id", "displayName", "email"]
    },
    async (accessToken, refreshToken, profile, callback) => {
      // Extracting values from facebook response
      const { id, email, name } = profile._json;

      // Generating a random 4 digit integer to insure username specificity
      const randomInt = Math.floor(Math.random() * (9999 - 1000) + 1000);

      // If a username has not been provided by facebook, generate one based on the user's name provided by facebook
      const username = !isNil(profile.username)
        ? `${profile.username}-${randomInt}`
        : `${kebabCase(name)}-${randomInt}`;

      // Creating an instance of our Neo4j Driver to execute cypher commands against the database
      const session = driver.session();

      try {
        result = await session.readTransaction(tx => {
          return tx.run(
            "MATCH (u:User)-[:AUTHENTICATED_WITH]->(fb:FB_ACCOUNT) WHERE fb.authID = $authID WITH { username: u.username, id: u.id, email: u.email} as UserInfo RETURN UserInfo",
            { authID: id }
          );
        });
        if (result && result.records[0]) {
          // Pass newly created user to the `/login-facebook/callback` route as part of the request object (it will be on req.user)
          // null is passed as the first argument as null is the errors argument and we have yet to encounter an error
          callback(null, result.records[0]._fields[0]);
        } else {
          result = await session.writeTransaction(tx => {
            return tx.run(
              "CALL apoc.create.uuids(1) YIELD uuid CREATE (u:User {id: uuid, email: $email, username: $username})-[:AUTHENTICATED_WITH]->(fb:FB_ACCOUNT {authID: $authID, email: $email}) RETURN u",
              { email: email, authID: id, username: username }
            );
          });
          // Pass newly created user to the `/login-facebook/callback` route as part of the request object (it will be on req.user)
          // null is passed as the first argument as null is the errors argument and we have yet to encounter an error
          callback(null, result.records[0]._fields[0].properties);
        }
      } finally {
        session.close();
      }
    }
  )
);

// This is the route that will trigger the facebook authentication for both sign-up and sign-in
// The scope array is a list of additional permissions you'd like to be granted by the facebook user
app.get(
  "/login-facebook",
  passport.authenticate("facebook", {
    scope: ["email", "user_location", "user_gender"]
  })
);

// This is the route that facebook will redirect to when Authentication is complete on their end
// You can access the User returned from the database on the request object (req.user)
app.get(
  "/login-facebook/callback",
  passport.authenticate("facebook", { session: false }),
  async (req, res) => {
    // Create a new JWT for the Facebook Authenticated user
    const signedToken = await createToken(
      {
        user: req.user
      },
      SECRET
    );

    // Pass JWT to the client side in a URL Query Param
    res.redirect(`${process.env.CLIENT_URI}/?token=${signedToken}`);
  }
);

// Add Middleware to our Express server
app.use(cors());
app.use(injectUser);
app.use(passport.initialize());

// Create a schema out of our typedefs and resolvers
// Alter query and mutation flags for auto generation by neo4j-graphql-js
const schema = makeAugmentedSchema({
  typeDefs,
  resolvers,
  config: {
    query: false,
    mutation: false
  }
});

// Create a new apollo server and pass in the Neo4j Driver, JWT Secret, and User object into the server as Context
const server = new ApolloServer({
  context: ({ req }) => ({ driver, SECRET, user: req.user || null }),
  schema
});

// Applying middleware to the newly created Apollo Server and specify a queriable path (also where Graphiql will display in browser)
server.applyMiddleware({ app, path: "/graphql" });

// Open up a port and start the server on it
app.listen({ port: process.env.GRAPHQL_LISTEN_PORT }, () => {
  console.log(`🚀 Server live at ${process.env.GRAPHQL_URI} 🚀`);
});
