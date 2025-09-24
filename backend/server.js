// File: backend/server.js

const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
    origin: 'http://localhost:3000' 
}));
app.use(express.json());


// --- API Routes ---
app.post('/api/predict', (req, res) => {
    const userInput = req.body;
    const userInputString = JSON.stringify(userInput);
    const scriptPath = path.join(__dirname, 'predict.py');

    // Spawn the Python process
    const pythonProcess = spawn('python', [scriptPath, userInputString]);

    let predictionData = '';
    let errorData = '';

    // Collect data from the Python script's standard output
    pythonProcess.stdout.on('data', (data) => {
        predictionData += data.toString();
    });

    // Collect error data
    pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
    });

    // Handle the process exit event
    pythonProcess.on('close', (code) => {
        // First, check if any error data was captured
        if (errorData) {
            console.error(`Python script error: ${errorData}`);
            // The FutureWarning will show up here, but we can check if it's the *only* thing
            // For now, we'll assume any stderr output could be a problem
            return res.status(500).json({ error: 'Failed to get prediction from model.', details: errorData });
        }
        
        // If the process exited with a non-zero code, it's an error
        if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
            return res.status(500).json({ error: `Python script exited with code ${code}` });
        }
        
        // If everything is fine, parse and send the prediction
        try {
            const prediction = parseFloat(predictionData.trim());
            if (isNaN(prediction)) {
                throw new Error("Invalid prediction format received from Python script.");
            }
            res.json({ prediction });
        } catch (e) {
            console.error(`Error parsing prediction: ${e.message}`);
            res.status(500).json({ error: 'Error parsing prediction result.', details: predictionData });
        }
    });
});


// --- Server Activation ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});