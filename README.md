
# grand-stack-seed
GRAND (GraphQL, React, Apollo, Neo4j Database) Stack seed project with built in Local Auth and Facebook OAuth, and sample User GQL types/queries/mutations.

## Seed project set-up

 

 1. Create a `.env.local` file in your `./client` directory with the following env variables:

    `GRAPHQL_URI= *example: http://localhost:8000/graphql*`
    
    `FB_AUTH_URI= *example: http://localhost:8000/login-facebook*`
 
 
 2. Create `.env` file in your `./server` directory with the following env variables

    `CLIENT_URI= *example: http://localhost:3000 (default for a create react app)*`
    
    `NEO4J_URI= *example: bolt://localhost:8687*` (this can be a local instance of neo4j or a neo4j sandbox URI)
    
    `NEO4J_USER= *example: neo4j*`
    
    `NEO4J_PASSWORD= *example: password*`
    
    `GRAPHQL_LISTEN_PORT= *example: 8000*`
    
    `GRAPHQL_URI= *example: http://localhost:8000*` (Graphiql will be available at this URI + `/graphql`)
    
    `JWT_SECRET= *example: generated secret*`
    
    `FB_ID= * Get this from https://developers.facebook.com*`
    
    `FB_SECRET= *Get this from https://developers.facebook.com*`
    
    `FB_CALLBACK_URI= *example: http://localhost:8000/login-facebook/callback*`
 
 2. Create a `.env.local` file in your `./client` directory with the following env variables:

    `GRAPHQL_URI= *example: http://localhost:8000/graphql*`

2. Install dependencies for both server and client by running `npm (or yarn) run install-all` in the root of the project.
3. Start up both servers by running `npm start` in the root of the project`

## Project configuration

 ### Server configuration:
 

 1. There is a schema.graphql file that contains all of tha app's type definitions and is run through a schema generator that converts Cypher queries (indicated by the `@cypher` or `@relationship` directives) into valid computed properties.
 2. You can turn on automatic mutation generation on `line 44` of the `server/src/index.js` file and mutation on  `line 45` (this will generate queries for all of your defined types, and add/update/delete mutations for all of your types as well) though I personally reccomend writing your own resolvers or computed properties using the directives mentioned above as it will give you more fine grained control over your application.
 3. There is Local already built in to the application, you can see this in action in the `server/src/resolvers.js` file. Facebook OAuth is also built in and can be seen in the `server/src/index.js` file!
 4. You can create even more complex queries and mutations by leverage in the `neo4jgraphql` method that is exposed by `neo4j-graphql-js` package by mutating data passed in to a query/mutation before it hits your neo4j database, you can see this in `server/src/resolvers.js` on `lines 8-12` where passwords are being hashed and salted by `bcrypt`

### Client configuration:

 1. This is just a basic Create React App (with typescript) that can be configured to your heart's content. (If you're unfamiliar with how to do this there are many resources available online.
 2. The app is wrapped in an `ApolloProvider` making your GraphQL server queriable throughout the app. (This happens in `client/src/components/App.tsx`
 3. The app is also wrapped in a `BrowserRouter` from `react-router` and you can define your routes as you see fit.
	 - There is an authenticated route at `/` that can only be accessed once a user is logged in.
	 - There is a `/register` route that has some default styled form fields that handle user registration and a `/login` route to authenticate a user.
