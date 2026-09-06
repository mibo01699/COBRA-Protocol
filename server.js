const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from pi-dapp-frontend directory
app.use(express.static(path.join(__dirname, 'pi-dapp-frontend')));

app.get('/api/health', (req, res) => {
    res.json({ status: 'online', service: 'COBRA-Protocol', version: '1.0.0' });
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}