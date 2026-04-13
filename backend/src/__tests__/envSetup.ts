// Set test environment variables before any module imports
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests-minimum-32-chars';
process.env.ADMIN_EMAIL = 'admin@test.com';
process.env.ADMIN_PASSWORD = 'testpassword123';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.PORT = '4001';
process.env.CORS_ORIGIN = 'http://localhost:3000';
