import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { validateObjectId } from '../middleware/validateObjectId';
import { createLinkSchema } from '../validators/link';

describe('authenticate middleware', () => {
  const app = express();
  app.use(express.json());
  app.get('/test', authenticate, (_req, res) => res.json({ ok: true }));

  it('should pass with valid token', async () => {
    const token = jwt.sign({ userId: 'u1', email: 'a@b.com' }, env.JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app)
      .get('/test')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('should reject missing Authorization header', async () => {
    const res = await request(app).get('/test');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('should reject malformed Authorization header', async () => {
    const res = await request(app)
      .get('/test')
      .set('Authorization', 'NotBearer token');
    expect(res.status).toBe(401);
  });

  it('should reject expired token', async () => {
    const token = jwt.sign({ userId: 'u1', email: 'a@b.com' }, env.JWT_SECRET, { expiresIn: '-1s' });
    const res = await request(app)
      .get('/test')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });

  it('should reject token signed with wrong secret', async () => {
    const token = jwt.sign({ userId: 'u1', email: 'a@b.com' }, 'wrong-secret', { expiresIn: '1h' });
    const res = await request(app)
      .get('/test')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });
});

describe('validate middleware', () => {
  const app = express();
  app.use(express.json());
  app.post('/test', validate(createLinkSchema), (_req, res) => res.json({ ok: true }));

  it('should pass valid data through', async () => {
    const res = await request(app)
      .post('/test')
      .send({ title: 'Test', url: 'https://example.com' });
    expect(res.status).toBe(200);
  });

  it('should reject invalid data with details', async () => {
    const res = await request(app)
      .post('/test')
      .send({ title: '', url: 'bad' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details).toBeInstanceOf(Array);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  it('should strip unknown fields', async () => {
    const res = await request(app)
      .post('/test')
      .send({ title: 'Test', url: 'https://example.com', malicious: 'data' });
    expect(res.status).toBe(200);
  });
});

describe('validateObjectId middleware', () => {
  const app = express();
  app.get('/test/:id', validateObjectId, (_req, res) => res.json({ ok: true }));

  it('should pass valid ObjectId', async () => {
    const res = await request(app).get('/test/507f1f77bcf86cd799439011');
    expect(res.status).toBe(200);
  });

  it('should reject invalid ObjectId', async () => {
    const res = await request(app).get('/test/not-valid');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid ID format');
  });

  it('should reject too-short strings', async () => {
    const res = await request(app).get('/test/123');
    expect(res.status).toBe(400);
  });
});
