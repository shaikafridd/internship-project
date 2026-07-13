const test = require('node:test');
const assert = require('node:assert/strict');
const { getMongoConnectionCandidates } = require('../src/config/db');

function restoreEnv(originalEnv) {
    for (const [key, value] of Object.entries(originalEnv)) {
        if (value === undefined) {
            delete process.env[key];
        } else {
            process.env[key] = value;
        }
    }
}

test('uses the local MongoDB URI when no primary URI is configured', () => {
    const originalEnv = {
        MONGODB_URI: process.env.MONGODB_URI,
        MONGODB_URI_FALLBACK: process.env.MONGODB_URI_FALLBACK,
    };

    try {
        delete process.env.MONGODB_URI;
        delete process.env.MONGODB_URI_FALLBACK;

        assert.deepEqual(getMongoConnectionCandidates(), ['mongodb://127.0.0.1:27017/auth-backend']);
    } finally {
        restoreEnv(originalEnv);
    }
});

test('uses only the primary URI when Atlas is configured', () => {
    const originalEnv = {
        MONGODB_URI: process.env.MONGODB_URI,
        MONGODB_URI_FALLBACK: process.env.MONGODB_URI_FALLBACK,
    };

    try {
        process.env.MONGODB_URI = 'mongodb://atlas.example/test';
        delete process.env.MONGODB_URI_FALLBACK;

        assert.deepEqual(getMongoConnectionCandidates(), [
            'mongodb://atlas.example/test',
        ]);
    } finally {
        restoreEnv(originalEnv);
    }
});
