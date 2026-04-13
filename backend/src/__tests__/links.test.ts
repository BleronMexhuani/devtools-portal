import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup';
import { Link } from '../models/Link';
import { env } from '../config/env';

import linkRoutes from '../routes/linkRoutes';
import { errorHandler } from '../middleware/errorHandler';

const app = express();
app.use(express.json());
app.use('/api/links', linkRoutes);
app.use(errorHandler);

/** Generate a valid admin JWT for testing */
function adminToken(): string {
  return jwt.sign({ userId: 'test-user-id', email: 'admin@test.com' }, env.JWT_SECRET, {
    expiresIn: '1h',
  });
}

const sampleLink = {
  title: 'GitHub',
  url: 'https://github.com',
  description: 'Code hosting platform',
  icon: '🐙',
  category: 'Development',
  sortOrder: 0,
};

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('GET /api/links', () => {
  it('should return an empty array when no links exist', async () => {
    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return all links sorted by category and sortOrder', async () => {
    await Link.insertMany([
      { ...sampleLink, title: 'B', category: 'Z', sortOrder: 1 },
      { ...sampleLink, title: 'A', category: 'A', sortOrder: 0 },
      { ...sampleLink, title: 'C', category: 'Z', sortOrder: 0 },
    ]);

    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].title).toBe('A');
    expect(res.body[1].title).toBe('C');
    expect(res.body[2].title).toBe('B');
  });
});

describe('GET /api/links/:id', () => {
  it('should return a single link by ID', async () => {
    const link = await Link.create(sampleLink);
    const res = await request(app).get(`/api/links/${link.id}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('GitHub');
    expect(res.body.url).toBe('https://github.com');
  });

  it('should return 404 for non-existent link', async () => {
    const res = await request(app).get('/api/links/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Link not found');
  });

  it('should return 400 for invalid ObjectId', async () => {
    const res = await request(app).get('/api/links/invalid-id');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid ID format');
  });
});

describe('POST /api/links', () => {
  it('should create a new link when authenticated', async () => {
    const res = await request(app)
      .post('/api/links')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send(sampleLink);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('GitHub');
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('createdAt');
  });

  it('should return 401 without authentication', async () => {
    const res = await request(app).post('/api/links').send(sampleLink);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Authentication required');
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .post('/api/links')
      .set('Authorization', 'Bearer invalid-token')
      .send(sampleLink);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid or expired token');
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/links')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ description: 'No title or URL' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  it('should return 400 for invalid URL', async () => {
    const res = await request(app)
      .post('/api/links')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ title: 'Test', url: 'not-a-url' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  it('should accept optional fields', async () => {
    const res = await request(app)
      .post('/api/links')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ title: 'Minimal', url: 'https://example.com' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Minimal');
    expect(res.body.description).toBeUndefined();
  });
});

describe('PUT /api/links/:id', () => {
  it('should update an existing link', async () => {
    const link = await Link.create(sampleLink);
    const res = await request(app)
      .put(`/api/links/${link.id}`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ title: 'Updated GitHub' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated GitHub');
    expect(res.body.url).toBe('https://github.com'); // unchanged field
  });

  it('should return 404 for non-existent link', async () => {
    const res = await request(app)
      .put('/api/links/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid ObjectId', async () => {
    const res = await request(app)
      .put('/api/links/bad-id')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid ID format');
  });

  it('should return 401 without authentication', async () => {
    const link = await Link.create(sampleLink);
    const res = await request(app)
      .put(`/api/links/${link.id}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/links/:id', () => {
  it('should delete an existing link', async () => {
    const link = await Link.create(sampleLink);
    const res = await request(app)
      .delete(`/api/links/${link.id}`)
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(204);

    const found = await Link.findById(link.id);
    expect(found).toBeNull();
  });

  it('should return 404 for non-existent link', async () => {
    const res = await request(app)
      .delete('/api/links/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid ObjectId', async () => {
    const res = await request(app)
      .delete('/api/links/bad-id')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(400);
  });

  it('should return 401 without authentication', async () => {
    const link = await Link.create(sampleLink);
    const res = await request(app).delete(`/api/links/${link.id}`);
    expect(res.status).toBe(401);
  });
});
