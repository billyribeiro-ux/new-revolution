// Re-export DB types for client-side use
// Workaround for Vite 8 Rolldown guard plugin issue with type-only imports from $lib/server
export type {
	Author,
	Category,
	Tag,
	Post,
	Lead,
	ContactSubmission,
	AdminNotification
} from '#lib/server/db/schema.js';
