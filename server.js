const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// 设置静态文件目录
app.use(express.static('public'));

// 配置 multer，用于处理文件上传
const upload = multer({ dest: 'uploads/' });

// 处理图片处理请求
app.post('/process-image', upload.single('image'), async (req, res) => {
    const imagePath = req.file.path;

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
                    Authorization: `Bearer sk-artpidiuPviNno3KetApYqjgcS3Chz8nzHij0SdjFBzwBB86`, // 请替换为您的 API Key
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
        res.status(500).send('处理图片时出错');
    } finally {
        // 删除临时上传的文件
        fs.unlinkSync(imagePath);
    }
});

app.listen(3000, () => {
    console.log('服务器已启动，监听端口 3000');
});
