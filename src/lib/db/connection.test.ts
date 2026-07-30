import { describe, it, expect } from 'vitest';
import { db } from './connection';
import path from 'path';
import fs from 'fs';

describe('Database Connection', () => {
  it('should export a valid Drizzle db instance', () => {
    expect(db).toBeDefined();
    expect(db).not.toBeNull();
  });

  it('should have the .data directory created for the SQLite database', () => {
    const dbDir = path.join(process.cwd(), '.data');
    expect(fs.existsSync(dbDir)).toBe(true);
  });

  it('should have the app.db SQLite file created', () => {
    const dbPath = path.join(process.cwd(), '.data', 'app.db');
    expect(fs.existsSync(dbPath)).toBe(true);
  });
});
