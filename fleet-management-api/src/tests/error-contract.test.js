import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { notFoundHandler } from '../middleware/notFound.js';
import { validate } from '../middleware/validate.js';

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

const createRequest = (headers = {}) => ({
  originalUrl: '/api/v1/test',
  method: 'GET',
  traceId: 'trace-123',
  header(name) {
    return headers[name];
  }
});

test('auth middleware returns the standard 401 problem response', () => {
  const req = createRequest();
  const res = createResponse();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.type, 'about:blank');
  assert.equal(res.body.title, 'Unauthorized');
  assert.equal(res.body.status, 401);
  assert.equal(res.body.traceId, 'trace-123');
});

test('auth middleware returns the standard 403 problem response for invalid keys', () => {
  const req = createRequest({ 'x-api-key': 'invalid' });
  const res = createResponse();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.type, 'about:blank');
  assert.equal(res.body.title, 'Forbidden');
  assert.equal(res.body.status, 403);
  assert.equal(res.body.traceId, 'trace-123');
});

test('validation middleware maps Zod failures to the standard 400 response', () => {
  const schema = z.object({
    body: z.object({ name: z.string().min(1) }),
    query: z.object({}),
    params: z.object({})
  });
  const req = { ...createRequest(), body: {}, query: {}, params: {} };
  const res = createResponse();
  let nextCalled = false;

  validate(schema)(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.title, 'Bad Request');
  assert.equal(res.body.status, 400);
  assert.equal(res.body.errors[0].field, 'body.name');
  assert.equal(res.body.traceId, 'trace-123');
});

test('not found middleware returns the standard 404 problem response', () => {
  const req = { ...createRequest(), method: 'POST' };
  const res = createResponse();

  notFoundHandler(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.type, 'about:blank');
  assert.equal(res.body.title, 'Not Found');
  assert.equal(res.body.status, 404);
  assert.equal(res.body.traceId, 'trace-123');
});

test('error handler hides internal details for unexpected failures', () => {
  const req = createRequest();
  const res = createResponse();

  errorHandler(new Error('database credentials leaked'), req, res, () => {});

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.title, 'Internal Server Error');
  assert.equal(res.body.status, 500);
  assert.equal(res.body.detail, 'An unexpected error occurred');
  assert.equal(res.body.traceId, 'trace-123');
});

test('error handler preserves safe details for expected client errors', () => {
  const req = createRequest();
  const res = createResponse();

  errorHandler({ status: 404, message: 'Vehicle not found' }, req, res, () => {});

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.title, 'Error');
  assert.equal(res.body.status, 404);
  assert.equal(res.body.detail, 'Vehicle not found');
  assert.equal(res.body.traceId, 'trace-123');
});
