const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');

const app = express();

// Serve the built files from the "dist" directory
app.use('/', serveStatic(path.join(__dirname, '/dist')));

// Serve the index.html file for all routes
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '/dist/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});