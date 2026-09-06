/**
 * اختبارات COBRA Protocol API
 */

const request = require('supertest');
const app = require('../server');

describe('COBRA Protocol API', () => {
  test('GET /api/health should return 200 OK', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'UP');
    expect(response.body).toHaveProperty('service', 'COBRA-Protocol');
  });

  test('GET /api/apps should return app info', async () => {
    const response = await request(app).get('/api/apps');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 'cobra');
    expect(response.body).toHaveProperty('status', 'ONLINE');
  });

  test('GET /api/status should return operational status', async () => {
    const response = await request(app).get('/api/status');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OPERATIONAL');
  });

  test('GET / should return welcome message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', '🦅 COBRA Protocol API is running');
  });
});