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
    Login: async (object, { email, password }, ctx, resolveInfo) => {
      const user = await neo4jgraphql(
        object,
        { email, password },
        ctx,
        resolveInfo
      );
      if (!user) {
        throw new Error("No user with that email");
        return null;
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error("Incorrect password");
        return null;
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

      return `${signedToken}`;
    }
  },
  Query: {
    me: (root, params, { user }, resolveInfo) => {
      return neo4jgraphql(
        object,
        { user: "d909abe3-78b4-491f-a946-21edadb2eb91" },
        ctx,
        resolveInfo,
        true
      );
      // if (user) {
      //   // they are logged in
      //   return neo4jgraphql(object, { user: user.id }, ctx, resolveInfo, true);
      // }
      // // not logged in user
      // return null;
    }
  }
};
