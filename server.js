const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve the static index.html page
app.use(express.static(path.join(__dirname, 'public')));

app.get('/screenshot', async (req, res) => {
  const { url, format } = req.query;

  if (!url) {
    return res.status(400).send('URL is required');
  }

  const validFormats = ['png', 'jpg', 'pdf'];
  if (!validFormats.includes(format)) {
    return res.status(400).send('Invalid format');
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: 'networkidle2',
    });

    let screenshot;
    if (format === 'pdf') {
      screenshot = await page.pdf({ format: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="screenshot.pdf"');
    } else {
      const imageFormat = format === 'jpg' ? 'jpeg' : 'png';
      screenshot = await page.screenshot({ type: imageFormat });
      res.setHeader('Content-Type', `image/${format}`);
      res.setHeader('Content-Disposition', `attachment; filename="screenshot.${format}"`);
    }

    await browser.close();
    res.send(screenshot);
  } catch (error) {
    console.error('Error taking screenshot:', error);
    res.status(500).send('Error taking screenshot');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
