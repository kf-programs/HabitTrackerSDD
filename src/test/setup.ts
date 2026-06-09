import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { db } from '../db/client';

beforeEach(async () => {
	await db.delete();
	db.open();
});

afterEach(async () => {
	cleanup();
	await db.delete();
});
