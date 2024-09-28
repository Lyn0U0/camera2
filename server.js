const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();

// Set up static files
app.use(express.static('public'));

// For handling JSON in POST requests (e.g., base64 images)
app.use(express.json({ limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Process uploaded or base64 images
app.post('/process-image', upload.single('image'), async (req, res) => {
    let imagePath = '';

    if (req.file) {
        // Handle file upload case
        imagePath = req.file.path;
    } else if (req.body.image) {
        // Handle base64 image case
        const base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
        imagePath = path.join(__dirname, 'uploads', 'temp_image.png');
        fs.writeFileSync(imagePath, base64Data, 'base64');
    }

    const payload = {
        image: fs.createReadStream(imagePath),
        prompt: "a well manicured shrub in an english garden",
        control_strength: 0.6,
        output_format: "webp",
    };

    try {
        const response = await axios.postForm(
            `https://api.stability.ai/v2beta/stable-image/control/structure`,
            axios.toFormData(payload, new FormData()),
            {
                validateStatus: undefined,
                responseType: "arraybuffer",
                headers: {
                    Authorization: `Bearer sk-artpidiuPviNno3KetApYqjgcS3Chz8nzHij0SdjFBzwBB86`,
                    Accept: "image/*"
                },
            },
        );

        if (response.status === 200) {
            res.set('Content-Type', 'image/webp');
            res.send(response.data);
        } else {
            res.status(response.status).send(response.data.toString());
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing the image.');
    } finally {
        // Clean up
        if (imagePath) fs.unlinkSync(imagePath);
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
