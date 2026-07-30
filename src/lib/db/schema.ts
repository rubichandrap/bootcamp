import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique(),
  name: text('name'),
  createdAt: text('created_at').notNull(),
});

export const modules = sqliteTable('modules', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  order: integer('order').notNull(),
});

export const chapters = sqliteTable('chapters', {
  id: text('id').primaryKey(),
  moduleId: text('module_id').notNull(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'reading' | 'challenge' | 'assessment'
  order: integer('order').notNull(),
});

export const userProgress = sqliteTable('user_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  chapterId: text('chapter_id').notNull(),
  completedAt: text('completed_at').notNull(),
});

export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  chapterId: text('chapter_id').notNull(),
  code: text('code').notNull(),
  passed: integer('passed', { mode: 'boolean' }).notNull(),
  testCount: integer('test_count').notNull(),
  failedCount: integer('failed_count').notNull(),
  compileError: text('compile_error'),
  createdAt: text('created_at').notNull(),
});
