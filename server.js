import express from 'express';
import serveStatic from 'serve-static';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Get the directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve the built files from the "dist" directory
app.use('/', serveStatic(path.join(__dirname, 'dist')));

// Serve the index.html file for all routes
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});