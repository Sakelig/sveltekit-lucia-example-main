import {sqliteTable, text, blob, integer} from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	// other user attributes
	first_name: text('first_name'),
	last_name: text('last_name'),
	email: text('email').notNull(),
	email_verified: integer('email_verified', {
		mode: 'boolean'
	})
});

export const session = sqliteTable('user_session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	activeExpires: blob('active_expires', {
		mode: 'bigint'
	}).notNull(),
	idleExpires: blob('idle_expires', {
		mode: 'bigint'
	}).notNull()
});

export const key = sqliteTable('user_key', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	hashedPassword: text('hashed_password')
});

export const email_verification = sqliteTable('email_verification_token', {
	id: text('id').primaryKey(),
	expire: blob('expire', {
		mode: 'bigint'
	}),
	user_id: text('user_id').references(() => user.id)
})
