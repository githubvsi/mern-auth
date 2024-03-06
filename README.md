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

## 10. User model
`src/backend/models/userModel.js`
defines the schema and initialize `User`.

## 11. Register User endpoint
    Complete the logic of registerUser function in `userController` by reading `req.body`.
    It includes checking if email exists already, sending data to database, send confirmation to client or error if fails.
    **Note:** Add the following lines to `` in order to parse JSON (e.g. req.body) and send form data.
```
app.use(express.json());
app.use(express.urlencoded({ extended: true }));    
```

## 12. Hash password using bcrypt: 
**Do it in the model to keep controller light.**
```
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password  = await bcrypt.hash(this.password, salt);
})
```
**Note:**
a. userSchema.pre() means it excutes before the specified event, which is `save` here.

b. We do NOT use an arrow function because we need to use **this** in the function.

c. **this** refers to the user that is being created/updated (in `userController.js`).

## 13. Generate JWT and save cookies
[JWT introduction](https://jwt.io/introduction)
    
[How JWT works](https://siddharthac6.medium.com/json-web-token-jwt-the-right-way-of-implementing-with-node-js-65b8915d550e)

    In authentication, when the user successfully logs in using their credentials, a JWT will be returned.
    The JWT in response is stored locally on the client side.
    Whenever the user wants to access a protected route or resource, the user agent should send the JWT, typically in the Authorization header using the Bearer schema.
    When the user logs out JWT is destroyed from the local.

![How JWT works](/assets/readme-images/jwt.png)

(1) Add `JWT_SECRET` to `.env`.

(2) Generate JWT
    **Note:**
    As both registerUser and authUser will use JWT, we put the function in `src/backend/utils/generateToken.js`.
```
import jwt from 'jsonwebtoken';
const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',  // to prevent a CRSF attack
        maxAge: 30 * 24 * 60 * 60 * 1000,   // 30d
    });
};
```
a. User `userId` as the payload in JWT. Use `JWT_SECRET` to sign it.

b. `res.cookie(name, value, options)` is used to set cookie. The value may be a string or object converted to JSON.

c. Two ways to ensure that cookies are sent securely and aren't accessed by unintended parties or scripts:

    c-1: `httpOnly` ensures that a cookie is inaccessible to the Javascript `Document.cookie` API. It is ONLY sent to the server. This precaution helps mitigate **cross-site scripting (XSS) attacks**.

    c-2: `secure` ensures the cookie is sent to the server with an encrypted request over the **HTTPS protocol**.

d.  `sameSite: strict` ensures that the browser only sends the cookie with requests from the cookie's origin site.

(3) Use the JWT-generating function in `userController`.
```
generateToken(res, user._id);
```
So JWT is generated using user._id as payload and added to a response cookie, which means the user is logged in.

(4) Test it in Postman. In response click on `Cookies` to check out `jwt` as well as its attributes.

(5) We don't have `logout` function yet. Delete the JWT cookie will log the user out. To do that in Postman, click on `Cookies` on the top right corner of the request and delete it from the popped up window.

## 14. Auth user endpoint
(1) Define a custom function `matchPassword` in `userModel.js`
```
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
```
**Note:**
**this** refers to the user that is found in the database which has the specified email in `userController.js`.

(2) Complete the logic of `authUser` in `userController.js`.
```
const { email, password } = req.body;
const user = await User.findOne({ email });

if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
    });
} else {
    res.status(401);
    throw new Error('Invalid email or password');
}
```

a. Read email and password from the request body.

b. Find the user with the specified email from the database.

c. Compare hashed passwords using `matchPassword` defined in `userController.js`.

d. If hashed passwords match, generate JWT and add it to a cookie in the response. 

e. If they don't, send error code and message.

## 15. Logout & destroy cookie
    To log out a user, destroy the cookie by setting the value of JWT an empty string, and making it expire.
```
res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
```
`new Date(0)` returns the Zero time, which is Jan 01, 1970. `new Date(ms)` creates a new date object as milliseconds plus zero time. Here `new Date(0)` makes sure the cookie has expired.

To test it in Postman,  click on `Cookies` on the top right corner of the request and we will see the JWT cookie generated by `authUser` or `registerUser` is gone.

