const request = require('supertest');
const app = require('../server');

test('GET /api/health returns status online', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('online');
});