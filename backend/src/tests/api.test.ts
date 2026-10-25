import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import request from 'supertest';
import app from '../index.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('GET / returns a health response', async () => {
  const response = await request(app).get('/');

  assert.equal(response.status, 200);
  assert.equal(response.text, 'Hello, TypeScript with Express!');
});

test('GET /api/shopping rejects a missing search query', async () => {
  const response = await request(app).get('/api/shopping');

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: 'Search query "q" is required' });
});

test('GET /api/shopping returns cleaned search results', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    shopping_results: [{
      position: 1,
      title: 'Test product',
      product_id: 'product-1',
      extracted_price: 19.99,
    }],
  }), { status: 200, headers: { 'content-type': 'application/json' } });

  const response = await request(app).get('/api/shopping').query({ q: 'test' });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.items, [{
    position: 1,
    title: 'Test product',
    product_id: 'product-1',
    extracted_price: 19.99,
  }]);
});

test('GET /api/cron/check-prices rejects requests without the cron secret', async () => {
  const response = await request(app).get('/api/cron/check-prices');

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { error: 'Unauthorized' });
});

test('POST /api/users/register rejects missing credentials', async () => {
  const response = await request(app)
    .post('/api/users/register')
    .send({ email: 'test@example.com' });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { message: 'Email and password are required' });
});

test('GET /api/users/me rejects unauthenticated requests', async () => {
  const response = await request(app).get('/api/users/me');

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { message: 'Authentication required' });
});

test('POST /api/users/add-item rejects unauthenticated requests', async () => {
  const response = await request(app).post('/api/users/add-item').send({
    title: 'Test product',
    extracted_price: 19.99,
  });

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { message: 'Authentication required' });
});

test('GET /api/users/allitems rejects unauthenticated requests', async () => {
  const response = await request(app).get('/api/users/allitems');

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { message: 'Authentication required' });
});

test('DELETE /api/users/deleteitem/:id rejects unauthenticated requests', async () => {
  const response = await request(app).delete('/api/users/deleteitem/1');

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { message: 'Authentication required' });
});

test('POST /api/users/logout clears the access token', async () => {
  const response = await request(app).post('/api/users/logout');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { message: 'Logged out successfully' });
  assert.match(response.headers['set-cookie']?.[0] ?? '', /access_token=;/);
});