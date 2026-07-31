import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const userProgress = sqliteTable('user_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  trackId: text('track_id').notNull().default('go'),
  chapterId: text('chapter_id').notNull(),
  completedAt: text('completed_at').notNull(),
});

export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  trackId: text('track_id').notNull().default('go'),
  chapterId: text('chapter_id').notNull(),
  code: text('code').notNull(),
  passed: integer('passed', { mode: 'boolean' }).notNull(),
  testCount: integer('test_count').notNull(),
  failedCount: integer('failed_count').notNull(),
  compileError: text('compile_error'),
  createdAt: text('created_at').notNull(),
});
