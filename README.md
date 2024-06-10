# MERN AUTH

# Backend

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

## 16. Auth protect middleware
(1) `src/backend/middleware/authMiddleware.js`: read the token from the request cookie, decode it using `JWT_SECRET` to get user ID, look for the user using the ID in the database and save the profile (minus password) in `req.user` so that the info is accessible by `userController`. If no user is found or no token is received, throw an error.

(2) Add `authMiddleware` to the protected routes. Note: authMiddleware should be placed **before** the controller.
```
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

```

(3) Read `req.user` in `getUserProfile`.

(4) Check in Postman: get user profile without login, get user profile after login, get user profile after logout.

## 17. Update user profile endpoint
`src/backend/controllers/userController.js`: look for the user using `req.user._id` (which is made available in `authMiddleware`) in database, update name/email/password as requested, save the updated user. If no user is found, throw an error.




# Frontend

[Frontend blog](https://www.traversymedia.com/blog/mern-crash-course-part-2)

## 18. Create Vite project
(1) Create a root folder `frontend` by running
```
npm create vite@latest frontend
cd frontend
npm install
```

(2) Add server and proxy configs to `vite.config.js`.

(3) Add to `scripts` in the **root** `package.json`.
```
"client": "npm run dev --prefix frontend",
```
**Note**: `--prefix frontend` indicates the script runs in `frontend`.

(4) **concurrently** - to run both frontend and backend concurrently
a. Install
```
npm i -D concurrently
```

b. Add to `scripts` in the **root** `package.json`.
```
"dev": "concurrently \"npm run server\" \"npm run client\""

```

c. `npm run dev` will run both frontend and backend.
![Console running frontend and backend](/assets/readme-images/console_run_frontend_backend.png)

(5) Clean up, including removing css, changing the title in `index.html`, resetting `App.jsx`, etc.

## 19. Bootstrap setup
**Note**: Be aware of the current folder in which packages are installed.
(1) In `frontend`
```
npm i react-bootstrap react-icons
npm i bootstrap
```
Yes, we need to install both react-bootstrap and bootstrap.

(2) Import bootstrap in `main.jsx`, the entry file
```
import 'bootstrap/dist/css/bootstrap.min.css'
```

## 20. Header and HomeScreen using bootstrap
Create a `Header` component `src/frontend/components/Header.jsx`.
Also `Hero` for `HomeScreen`.

## 21. Router setup
(1) **Note**: make sure the command is run in `frontend` folder.
```
npm i react-router-dom react-router-bootstrap
```
`react-router-bootstrap` is for `<LinkContainer>` and etc.

(2) Create routes and wrap everything in `RouterProvider` in `main.jsx`.
```
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index={ true } path='/' element={<HomeScreen />} />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={ router } />
  </React.StrictMode>,
)
```

(3) [Router outlet](https://reactrouter.com/en/main/components/outlet)
In `App.jsx`
```
function App() {
  return (
    <>
      <Header />
      <Container className='my-2'>
        <Outlet />
      </Container>
    </>
  )
}
```
`Outlet` is used in a parent route element to render child route elements. In the example above, `<Outlet />` will render `<HomeScreen />` when URL is `/`.

(4) `<LinkContainer to='somepathhere' />` is used to wrap a link.
**Note**: use `<LinkContainer to='...' />` to replace `<... href='...'>`, because `href` triggers **page reload**.

## 22. Redux toolkit setup
(1) Install redux toolkit in `frontend`
```
npm i @reduxjs/toolkit react-redux
```

(2) Create `store.js` under `frontend/src`.
```
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
    reducer: {},
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    devTools: true,
});

export default store;
```

(3) Use `<Provider>` imported from `react-redux` to wrap everything in `main.jsx`
```
ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={ router } />
    </React.StrictMode>
  </Provider>,
)
```

(4) Add Redux devtools extension to Chrome

## 23. Auth slice
A **reducer** function is where you will put your state logic. It takes two arguments, the current state and the action object, and it returns the next state.

In Redux Toolkit, we create reducers using something called a **slice**. A **slice** is a collection of reducer logic and actions for a single feature of our app.

We will create a slice for our authentication that will only deal with the local storage of the user info.

[RTK - Redux Toolkit Overview](https://redux-toolkit.js.org/introduction/why-rtk-is-redux-today)

(1) `authSlice` defines the slice name, initial state, and reducers.
```
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.userInfo = action.payload;
            localStorage.setItem('userInfo', JSON.stringify(action.payload));
        },
        logout: (state, action) => {
            state.userInfo = null;
            localStorage.removeItem('userInfo');
        },
    },
});
```
**Note**: RTK enables writing **immutable** updates, e.g. `state.userInfo = action.payload`.

(2) Add `auReducer` to `store.js`.
```
const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    devTools: true,
});
```

(3) Test
a. Devtools --> Redux tab --> State --> `auth` has `userInfo` (null)
b. Authenticate with the backend and `userInfo` has a value.


## 24. API slice
(1) Create api slice in `apiSlice.js`
```
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ baseUrl: '' });
export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['User'],
    endpoints: (builder) => ({}),
});
```
**Note**: 
a. `import ... from '@reduxjs/toolkit/query/react'` because under the hood it uses RTK query.
b. We are using the createApi function from Redux Toolkit to create our API slice instead of createSlice, because it includes the middleware that we need to make requests to our server. We are passing in a `baseQuery` object that will be used to make our requests. 
c. tagTypes has to do with caching so we does not have to fetch data everytime.
d. We will use the built-in `builder` to make requests. It can be considered a parent to all API slices;

(2) Add API slice to `store.js`
```
const store = configureStore({
    reducer: {
        auth: authReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true,
});
```
**Note**:
a. `[apiSlice.reducerPath]: apiSlice.reducer`: we add the API slice to `reducer`
b. `middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),`: we add middleware to `getDefaultMiddleware`.
c. Devtools --> Redux tab --> State --> `api` has `queries` (which fetches data from backend), `mutations` (which does something in the backend, e.g. adding a user), etc.

(3) Create `usersApiSlice.js` - the endpoint that is needed to work with the backend
```
import { apiSlice } from "./apiSlice";
const USERS_URL = '/api/users';
export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/auth`,
                method: 'POST',
                body: data,
            }),
        }),
    }),
});
export const { useLoginMutation } = usersApiSlice;
```
**Note**:
a. `injectEndpoints()` allows to create endpoints in this file and inject them into `endpoints: (builder) => ({})` in `apiSlice.js`.
b. The query created here hits `authUser` in `userController.js`.
c. The specific **convention** to export mutations in queries: `useLoginMutation`.
d. For `builder.query()` the export name should be `useLoginQuery`.

(4) Use the login endpoint
```
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [login, { isLoading }] = useLoginMutation();
    
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        if (userInfo) navigate('/');
    }, [navigate, userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await login({ email, password }).unwrap();
            dispatch(setCredentials({...res}));
            navigate('/');
        } catch (e) {
            toast.error(e?.data?.message || e.error);
        }
    };
};
```
**Note**:
a. `useSelector` and `useDispatch` from `react-redux` allow to select data from the store and dispatch actions, respectively.
b. `useLoginMutation` allows to use the function `login` and its built-in state `isLoading`. It also has another built-in state `error`.
c. `useEffect` is used to redirect a user to the home page if login is successful.
d. `useNavigate` is used for redirect.
e. If use `fetch` instead of `login` function
```
const res = await fetch('/api/users/auth', {
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
});
const data = await res.json();
```

# 25. React Toastify
(1)
```
npm i react-toastify
```
(2) Add `<ToastContainer />` to `frontend/src/App.js`
```
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const App = () => {
  return (
    <>
      <Header />
      <ToastContainer />
      <Container className='my-2'>
        <Outlet />
      </Container>
    </>
  );
};
```
(3) Trigger the toast in `LoginScreen.jsx` when function `login` returns an error.
```
import { toast } from 'react-toastify';
toast.error(e?.data?.message || e.error);
```

# 26. Header dropdown
```
const { userInfo } = useSelector((state) => state.auth);
return (
    <header>
    ...
    {userInfo ? (
        <>
            <NavDropdown title={userInfo.name} id='username'>
            <LinkContainer to='/profile'>
                <NavDropdown.Item>Profile</NavDropdown.Item>
            </LinkContainer>
            <NavDropdown.Item>Logout</NavDropdown.Item>
            </NavDropdown>
        </>
    ) : (
        // the Sign in / Sign up buttons
    )}
);
```
If `userInfo` is not null, show a dropdown with the username when it is folded. Otherwise show the sign in/sign up buttons.

# 27. Logout
(1) Go to `usersApiSlice.js` to add a `logout` function to endpoints.
```
logout: builder.mutation({
    query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
    }),
}),
```
Don't forget to use the naming convention and export `useLogoutMutation`.

(2) Add `logoutHandler` to `logout`in the header dropdown
```
const dispatch = useDispatch();
const navigate = useNavigate();

const [logoutApiCall] = useLogoutMutation();

const logoutHandler = async () => {
    try {
        await logoutApiCall().unwrap();
        dispatch(logout());
        navigate('/');
    } catch (e) {
        console.log(e);
    }
};
...
<NavDropdown.Item onClick={ logoutHandler }>Logout</NavDropdown.Item>
```
`logoutApiCall` calls API to invalidate jwt, while `logout` removes the local cookies.


# 28. Loader component
components/Loader.jsx
uses Spinner from react-bootstrap


# 29. Registration functionality
(1) Add endpoint to `usersApiSlice.js`.

(2) Add functionality to `RegisterScreen.jsx`, following the similar logic as `Login`.


