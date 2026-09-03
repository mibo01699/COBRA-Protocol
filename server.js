const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'online', service: 'COBRA-Protocol', version: '1.0.0' });
});

app.get('/', (req, res) => {
    res.json({ message: '🦅 COBRA-Protocol API is running' });
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}