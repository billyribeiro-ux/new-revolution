import { query, command } from '$app/server';
import { requireAdmin } from '#lib/server/auth-guards.js';
import { rethrowServiceRefusal } from '#lib/server/service-errors.js';
import {
	listSequences,
	getSequenceWithSteps,
	createSequence,
	updateSequence,
	deleteSequence
} from '#lib/server/services/email-sequences.js';
import {
	sequenceCreateSchema,
	sequenceUpdateSchema,
	sequenceIdSchema
} from '#lib/shared/schemas/sequences.js';

/**
 * List all drip sequences with step counts.
 * @boundary query - admin sequences list
 */
export const fetchSequences = query(async () => {
	requireAdmin();
	return listSequences();
});

/**
 * Load one sequence with its ordered steps (editor).
 * @boundary query - admin sequence detail
 */
export const fetchSequence = query(sequenceIdSchema, async ({ id }) => {
	requireAdmin();
	return getSequenceWithSteps(id);
});

/**
 * Create a sequence and its steps.
 * @boundary command - admin create sequence
 */
export const createSequenceCmd = command(sequenceCreateSchema, async (data) => {
	requireAdmin();
	const id = await createSequence(data);
	return { id };
});

/**
 * Update a sequence and replace its steps.
 * @boundary command - admin update sequence
 */
export const updateSequenceCmd = command(sequenceUpdateSchema, async (data) => {
	requireAdmin();
	await updateSequence(data).catch(rethrowServiceRefusal);
	return { id: data.id };
});

/**
 * Delete a sequence (cascades steps + enrollments).
 * @boundary command - admin delete sequence
 */
export const deleteSequenceCmd = command(sequenceIdSchema, async ({ id }) => {
	requireAdmin();
	await deleteSequence(id);
	return { ok: true };
});
