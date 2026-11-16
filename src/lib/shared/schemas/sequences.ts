import { z } from 'zod';

/** A single email step within a sequence. */
export const sequenceStepSchema = z.object({
	stepIndex: z.number().int().nonnegative(),
	delayDays: z.number().int().min(0).max(365),
	subject: z.string().trim().min(1, 'Subject is required').max(300),
	bodyHtml: z.string().min(1, 'Email body is required').max(100_000),
	isActive: z.boolean().default(true)
});

/** Create a new sequence (with its steps). */
export const sequenceCreateSchema = z.object({
	name: z.string().trim().min(1, 'Name is required').max(200),
	triggerSource: z.string().trim().min(1).max(100).default('lead_magnet'),
	isActive: z.boolean().default(false),
	steps: z
		.array(sequenceStepSchema)
		.max(52)
		.refine(
			(steps) => steps.every((step, index) => step.stepIndex === index),
			'Steps must have unique, contiguous indexes starting at zero.'
		)
		.default([])
});

/** Update an existing sequence and replace its steps. */
export const sequenceUpdateSchema = sequenceCreateSchema.extend({
	id: z.number().int().positive()
});

/** Sequence id lookup. */
export const sequenceIdSchema = z.object({
	id: z.number().int().positive()
});

/** Admin enrollment list filters. */
export const enrollmentListFiltersSchema = z.object({
	sequenceId: z.number().int().positive().optional(),
	status: z.enum(['active', 'completed', 'paused', 'unsubscribed']).optional(),
	limit: z.number().int().positive().max(1000).default(250),
	offset: z.number().int().nonnegative().default(0)
});

export type SequenceStepInput = z.infer<typeof sequenceStepSchema>;
export type SequenceCreateInput = z.infer<typeof sequenceCreateSchema>;
export type SequenceUpdateInput = z.infer<typeof sequenceUpdateSchema>;
export type SequenceIdInput = z.infer<typeof sequenceIdSchema>;
export type EnrollmentListFiltersInput = z.infer<typeof enrollmentListFiltersSchema>;
