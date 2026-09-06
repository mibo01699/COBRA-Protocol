const request = require('supertest');
const app = require('../server');

describe('COBRA API Tests', () => {
    test('GET /api/health should return status online', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('online');
        expect(response.body.service).toBe('COBRA-Protocol');
    });

    test('GET / should return HTML page', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.type).toBe('text/html');
        expect(response.text).toContain('COBRA Protocol');
    });
});
