import passport from "passport";
import FacebookStrategy from "passport-facebook";
import { isNil, kebabCase } from "lodash";
import { app, driver, SECRET } from "../index";
import { createToken } from "./auth";

// Setting up our Facebook strategy for passport
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FB_ID, // found on your facebook app profile
      clientSecret: process.env.FB_SECRET, // found on your facebook app profile
      callbackURL:
        process.env.FB_CALLBACK_URI ||
        "http://localhost:8000/login-facebook/callback", // should be the base URI for your server followed `/login-facebook/callback`
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

      let result;

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
    res.redirect(
      `${process.env.CLIENT_URI ||
        "http://localhost:3000"}/?token=${signedToken}`
    );
  }
);

app.use(passport.initialize());
