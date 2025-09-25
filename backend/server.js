const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.post('/api/predict', (req, res) => {
    // Destructure country and the rest of the form data from the request body
    const { country, ...formData } = req.body;

    // --- DEBUGGING: Log what the server receives ---
    console.log('--- New Request ---');
    console.log('Received country:', country);
    console.log('Received form data:', formData);

    if (!country || Object.keys(formData).length === 0) {
        console.error('Validation Error: Country or form data is missing.');
        return res.status(400).json({ error: 'Country field and form data are required.' });
    }

    const userInputString = JSON.stringify(formData);
    const scriptPath = path.join(__dirname, 'predict.py');
    
    // --- DEBUGGING: Log the exact command being run ---
    console.log(`Executing command: python ${scriptPath} ${country} '${userInputString}'`);
    
    // Pass 'country' as the first argument, followed by the form data
    const pythonProcess = spawn('python', [scriptPath, country, userInputString]);

    let predictionData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
        predictionData += data.toString();
    });
    pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (errorData) {
            console.error('Python script stderr:', errorData); // Log the actual Python error
            return res.status(500).json({ error: 'Prediction script failed.', details: errorData });
        }
        try {
            const prediction = parseFloat(predictionData.trim());
            if (isNaN(prediction)) {
                throw new Error('Parsed prediction is not a number.');
            }
            console.log('Sending prediction:', prediction);
            res.json({ prediction });
        } catch (e) {
            console.error('Error parsing prediction result:', e.message);
            res.status(500).json({ error: 'Error parsing prediction result.', details: predictionData });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

