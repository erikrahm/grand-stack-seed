import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { ApolloServer, gql } from "apollo-server-express";
import { v1 as neo4j } from "neo4j-driver";
import { makeAugmentedSchema, neo4jgraphql } from "neo4j-graphql-js";
import jwt from "jsonwebtoken";
import { isNil, kebabCase } from "lodash";

import { typeDefs } from "./graphql-schema";
import { resolvers } from "./resolvers";

// Graph our environment variables from our .env file and create a variable for our JWT secret
dotenv.config();
export const SECRET = process.env.JWT_SECRET || "shittySecret8675309";

// Create express app
export const app = express();

// Create a configured neo4j driver instance (this doesn't start a session)
export const driver = neo4j.driver(
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

if (process.env.FB_ID && process.env.FB_SECRET) {
  require("./auth/facebook");
}

// Add Middleware to our Express server
app.use(cors());
app.use(injectUser);

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
app.listen({ port: process.env.GRAPHQL_LISTEN_PORT || 8000 }, () => {
  console.log(
    `🚀 Server live at ${process.env.GRAPHQL_URI || "http://localhost:8000"} 🚀`
  );
});
