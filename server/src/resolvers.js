import { neo4jgraphql } from "neo4j-graphql-js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pick } from "lodash";

export const resolvers = {
  Mutation: {
    RegisterUser: async (object, params, ctx, resolveInfo) => {
      const user = params;
      user.password = await bcrypt.hash(user.password, 12);
      return neo4jgraphql(object, user, ctx, resolveInfo, true);
    },
    Login: async (object, { email, password, token }, ctx, resolveInfo) => {
      const user = await neo4jgraphql(
        object,
        { email, password, token },
        ctx,
        resolveInfo
      );
      if (!user) {
        throw new Error("No user with that email");
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error("Incorrect password");
      }

      const signedToken = jwt.sign(
        {
          user: { id: user.id, username: user.username }
        },
        ctx.SECRET,
        {
          expiresIn: "1y"
        }
      );

      return {
        username: user.username,
        id: user.id,
        password: null, // required on the return type of Login, but we don't want to expose the hashed password
        token: signedToken
      };
    }
  },
  Query: {
    me: (root, params, { user }, resolveInfo) => {
      if (user) {
        // they are logged in
        return neo4jgraphql(object, { user: user.id }, ctx, resolveInfo, true);
      }
      // not logged in user
      return null;
    }
  }
};
