import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { ApolloServer, gql } from "apollo-server-express";
import { v1 as neo4j } from "neo4j-driver";
import { makeAugmentedSchema, neo4jgraphql } from "neo4j-graphql-js";
import jwt from "jsonwebtoken";

import { typeDefs } from "./graphql-schema";
import { resolvers } from "./resolvers";

dotenv.config();
const SECRET = process.env.JWT_SECRET;

const app = express();

const injectUser = async req => {
  const token = req.headers.authorization;
  try {
    const { user } = await jwt.verify(token, SECRET);
    req.user = user;
  } catch (error) {
    console.log(error);
  }
  req.next();
};

app.use(cors());
app.use(injectUser);

const driver = neo4j.driver(
  process.env.NEO4J_URI || "bolt://localhost:7687",
  neo4j.auth.basic(
    process.env.NEO4J_USER || "neo4j",
    process.env.NEO4J_PASSWORD || "neo4j"
  )
);

const schema = makeAugmentedSchema({
  typeDefs,
  resolvers,
  config: {
    query: false,
    mutation: false
  }
});

const server = new ApolloServer({
  context: ({ req }) => ({ driver, SECRET, user: req.user }),
  schema
});

server.applyMiddleware({ app, path: "/graphql" });

app.listen({ port: process.env.GRAPHQL_LISTEN_PORT }, () => {
  console.log(`Apollo Server live at ${process.env.GRAPHQL_URI}`);
});
