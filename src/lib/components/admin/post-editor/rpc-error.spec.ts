import { describe, expect, it } from 'vitest';
import { rpcErrorMessage } from './rpc-error';

describe('rpcErrorMessage', () => {
	it('uses the server message from an HttpError-shaped remote error and drops the machine code', () => {
		const err = {
			status: 409,
			body: { message: 'DUPLICATE_SLUG: Author slug "p4-run-1-author" already exists.' }
		};
		expect(rpcErrorMessage(err, 'Failed to create author.')).toBe(
			'Author slug "p4-run-1-author" already exists.'
		);
	});

	it('uses the message of a plain Error', () => {
		expect(rpcErrorMessage(new Error('Network down'), 'fallback')).toBe('Network down');
	});

	it('falls back only when there is no usable message', () => {
		expect(rpcErrorMessage({ status: 500, body: {} }, 'Failed to create author.')).toBe(
			'Failed to create author.'
		);
		expect(rpcErrorMessage(undefined, 'Failed to create tag.')).toBe('Failed to create tag.');
		expect(rpcErrorMessage(new Error('   '), 'fallback')).toBe('fallback');
	});
});
