## MERN AUTH

# 1. Create a project and install dependencies
(1) On an empty folder, run the command below to add "package.json" to the folder.

```sh
npm init -y
```
(2) Install
```sh
npm i express dotenv mongoose bcryptjs jsonwebtoken cookie-parser
```

# 2. Use ES module instead of CommonJS for the backend
To use ES module syntax on the backend (as frontend use ES module syntax), add "type" to package.json
"type": "module",

ES module:
import express from 'express';
export default ...

CommonJS: 
const express = require('express');
module.exports = ...

# 3. A bare bone server
Backend and frontend code will be structured into two folders.

(1) A bare bone server at src/backend/server.js looks like this:

import express from 'express';
const port = 5000;
const app = express();
app.get('/', (req, res) => res.send('Server is ready'));
app.listen(port, () => console.log(`Server running on port ${port}`));

(2) To run the server
```sh
node backend/server.js
```
Open http://localhost:5000/ to see the message.

# 4. Customize scripts
(1) install nodemon
```sh
npm i -D nodemon
```

(2) Add scripts to package.json
 "start": "node backend/server.js",
"server": "nodemon backend/server.js"

Note: We use "server" to start backend and leave "dev" to starting both backend and frontend.