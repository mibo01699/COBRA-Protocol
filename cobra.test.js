// tests/cobra.test.js
const request = require('supertest');
const app = require('../server');

describe('COBRA Protocol API Tests', () => {
    test('GET /api/health should return status online', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('online');
    });

    test('GET / should return API info', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.body.message).toContain('COBRA-Protocol');
    });
});