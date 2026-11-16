import { describe, expect, it } from 'vite-plus/test';
import { parseSearchBackfillArgs } from './backfill-post-search';

describe('Search backfill command', () => {
	it('defaults to a dry run and bounds batch memory', () => {
		expect(parseSearchBackfillArgs([])).toEqual({ dryRun: true, batchSize: 100, limit: undefined });
		expect(parseSearchBackfillArgs(['--apply', '--batch-size=25', '--limit=1000'])).toEqual({
			dryRun: false,
			batchSize: 25,
			limit: 1000
		});
	});
	it.each([
		'--batch-size=0',
		'--batch-size=501',
		'--limit=0',
		'--limit=99999999999999999999',
		'--unknown'
	])('rejects unsafe or unknown argument %s', (arg) => {
		expect(() => parseSearchBackfillArgs([arg])).toThrow();
	});
});
