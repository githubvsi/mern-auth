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
(1) Create `.env` 
(2) Add it to `.gitignore`
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

    **Note: Do NOT forget to export router.**
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
(5) userRoutes