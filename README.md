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