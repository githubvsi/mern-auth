# MERN AUTH

## 1. Create a project and install dependencies
(1) On an empty folder, run the command below to add `package.json` to the folder.

```sh
npm init -y
```
(2) Install
```sh
npm i express dotenv mongoose bcryptjs jsonwebtoken cookie-parser
```

## 2. Use ES module instead of CommonJS for the backend
To use ES module syntax on the backend (as frontend use ES module syntax), add "type" to `package.json`
```
"type": "module",
```

ES module:
```
import express from 'express';
export default ...
or
export {..., ...}
```

CommonJS: 
```
const express = require('express');
module.exports = ...
```

**Note:**
To use the ES module syntax, we need to include file extension in the import path.
e.g.
import {... } from '../controllers/userController.js';

## 3. A bare bone server
Backend and frontend code will be structured into two folders.

(1) A bare bone server at src/backend/server.js looks like this:
```
import express from 'express';
const port = 5000;
const app = express();
app.get('/', (req, res) => res.send('Server is ready'));
app.listen(port, () => console.log(`Server running on port ${port}`));
```

(2) To run the server
```sh
node backend/server.js
```
Open http://localhost:5000/ to see the message.

## 4. Customize scripts
(1) install nodemon
```sh
npm i -D nodemon
```

(2) Add scripts to package.json
```
 "start": "node backend/server.js",
"server": "nodemon backend/server.js"
```

Note: We use `server` to start backend and leave `dev` to starting both backend and frontend.

## 5. Environment variables
(1) Create `.env`.

(2) Add it to `.gitignore`.

(3) List environment variables in `.env`, e.g. PORT=5000

(4) In server.js
    ```
    import dotenv from 'dotenv'
    ```

(5) Replace the hardcoded variables in server.js with environment variable by using `process.env`
    e.g.
    ```
    const port = process.env.PORT || 5000;
    ```

## 6. Routes (under backend of course)
(1) Create a folder `routes`, and a file `userRoutes.js`.
    It is fine if we put all the logic in userRoutes.js, but it is a good practice to have logic in a **controlle**.

(2) Create a folder `controllers` and a file `userController.js`.
    userRoutes will link to the userController functions.

(3) Use userRoutes in server.js, and define the base URL ('/api/users').
    ```
    import userRoutes from './routes/userRoutes.js';
    app.use('/api/users', userRoutes);
    ```

(4) Bare-bone userRoutes (which links to userController)
    ```
    import express from 'express';
    import { authUser } from '../controllers/userController.js';
    const router = express.Router();
    router.post('/auth', authUser);
    export default router;
    ```

    Note: Do NOT forget to export router.

(5) Bare-bone userController that handles logic (Don't forget comments) -
    ```
    // @desc Auth user/set token
    // route POST /api/user/auth
    // @access Public
    const authUser = (req, res) => {
        res.status(200).json({ message: 'Auth User'});
    };
    export {
        authUser,
    };
    ```

## 7. express-async-handler
handles exceptions inside of aync express routes and passes them to error handlers.

(1) General info
https://www.npmjs.com/package/express-async-handler

Usage - use `asyncHandler()` to wrap the controller function
```
const asyncHandler = require('express-async-handler')

express.get('/', asyncHandler(async (req, res, next) => {
	const bar = await foo.findAll();
	res.send(bar)
}))
```

Without the middleware:
```
express.get('/',(req, res, next) => {
    foo.findAll()
    .then ( bar => {
       res.send(bar)
     } )
    .catch(next); // error passed on to the error handling route
})
```

(2) Use express-async-handler in `userController.js`
```
const authUser = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Auth User'});
});
```

(3) Create error handlers in   `src/middleware/errorMiddleware.js`
e.g. 
```
const notFound = (req, res, next) => {...};
const errorHandler = (err, req, res, next) => {...};
```

Don'f forget **export {...}**

(3) Add these middlewares to `server.js`
```
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
app.use(notFound);
app.use(errorHandler);
```

(4) To test it add the following lines to the authUser in `userController.js`
```
res.status(401);
throw new Error('Something went wrong');
```
Then use Postman to see the error.

If we comment out these two custom error middlewares and use Postman to test it, we got the default error handler on an HTML page.

## 8. More controller functions
In `userController.js` add functions for registration, logout, getting or updating a user profile.
Don't forget to conect them to userRoutes.

**Note:**
Controller functions getUserProfile and updateUserProfile share the same endpoint ('/profile') but have different methods. We can use the following way to connect them to userRoutes.
```
router.route('/profile').get(getUserProfile).put(updateUserProfile);
```

## 9. MongoDB database setup
### Create a project and build database on mongodb.com
(1) Choose the free template, AWS as the provider, and name the cluster (optional).

(2) Create user (and password which will be used later in new connection URI) and add IP address (which is automatically added and listed).

(3) Create Database by adding data to the newly-created project.
    e.g. Database name: mernauth, Collection name: users

(4a) (Optional) Connect to MongoDB Compass.
    Download MongoDB Compass. Copy the connection string. Open Compass and paste it New Connection URI. Don't forget to replace `<password>` with the newly created password. Then connect.

(4b) Connect to the app (Drivers).
    Copy the connection string and paste it into `.env`.

### Set up connection in the app
(1) Add the connection string to `.env`
```
MONGO_URI=mongodb+srv://wsiuci:<to be replaced by the password>@cluster0.luyzs0f.mongodb.net/<add the database name here, e.g. mernauth>?retryWrites=true&w=majority&appName=Cluster0
```

(2) Create connection function in `src/backend/config/db.js`
```
import mongoose from 'mongoose';
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (e) {
        console.error(`Error: ${e.message}`);
        process.exit(1);
    }
};
export default connectDB;
```

(3) Use the connection function in `server.js`
```
import connectDB from './config/db.js';
connectDB();
```

We can have `connectDB()` right before app initialization.

If connection is successful, we can see "MongoDB Connected: connection host name here" in the console.