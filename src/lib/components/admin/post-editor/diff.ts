export interface WordDiffChunk {
	type: 'equal' | 'insert' | 'delete';
	text: string;
}

function tokenizeWords(text: string): string[] {
	if (!text) return [];
	return text.match(/\S+\s*|\s+/g) ?? [];
}

/**
 * Myers / Hirschberg linear-space word-level diff (Section 11.9 & Section 13 #46).
 * Avoids O(m * n) matrix allocation so 3,000+ word articles diff without blocking the UI thread.
 */
export function computeWordDiff(oldText: string, newText: string): WordDiffChunk[] {
	if (oldText === newText) {
		return oldText ? [{ type: 'equal', text: oldText }] : [];
	}

	const a = tokenizeWords(oldText);
	const b = tokenizeWords(newText);

	if (a.length === 0) {
		return b.length > 0 ? [{ type: 'insert', text: b.join('') }] : [];
	}
	if (b.length === 0) {
		return [{ type: 'delete', text: a.join('') }];
	}

	// Strip common prefix and suffix in O(n)
	let start = 0;
	while (start < a.length && start < b.length && a[start] === b[start]) {
		start += 1;
	}

	let endA = a.length - 1;
	let endB = b.length - 1;
	while (endA >= start && endB >= start && a[endA] === b[endB]) {
		endA -= 1;
		endB -= 1;
	}

	const prefix = start > 0 ? a.slice(0, start) : [];
	const suffix = endA + 1 < a.length ? a.slice(endA + 1) : [];
	const midA = a.slice(start, endA + 1);
	const midB = b.slice(start, endB + 1);

	const rawChunks: WordDiffChunk[] = [];
	if (prefix.length > 0) {
		rawChunks.push({ type: 'equal', text: prefix.join('') });
	}

	if (midA.length > 0 || midB.length > 0) {
		const midChunks = myersDiffTokens(midA, midB);
		rawChunks.push(...midChunks);
	}

	if (suffix.length > 0) {
		rawChunks.push({ type: 'equal', text: suffix.join('') });
	}

	// Merge adjacent chunks of the same type
	const merged: WordDiffChunk[] = [];
	for (const chunk of rawChunks) {
		if (!chunk.text) continue;
		const prev = merged[merged.length - 1];
		if (prev && prev.type === chunk.type) {
			prev.text += chunk.text;
		} else {
			merged.push({ ...chunk });
		}
	}

	return merged;
}

function myersDiffTokens(a: string[], b: string[]): WordDiffChunk[] {
	const n = a.length;
	const m = b.length;
	const max = n + m;
	if (max === 0) return [];

	// Cap D at 2500 edits for worst-case completely unrelated large documents
	const maxD = Math.min(max, 2500);
	const offset = max;
	const v = new Int32Array(2 * max + 3);
	const trace: Int32Array[] = [];

	let found = false;
	for (let d = 0; d <= maxD; d++) {
		trace.push(v.slice());
		for (let k = -d; k <= d; k += 2) {
			const kIdx = k + offset;
			let x: number;
			if (k === -d || (k !== d && v[kIdx - 1] < v[kIdx + 1])) {
				x = v[kIdx + 1];
			} else {
				x = v[kIdx - 1] + 1;
			}
			let y = x - k;
			while (x < n && y < m && a[x] === b[y]) {
				x += 1;
				y += 1;
			}
			v[kIdx] = x;
			if (x >= n && y >= m) {
				found = true;
				break;
			}
		}
		if (found) break;
	}

	if (!found) {
		return [
			{ type: 'delete', text: a.join('') },
			{ type: 'insert', text: b.join('') }
		];
	}

	// Backtrack through trace
	const ops: WordDiffChunk[] = [];
	let x = n;
	let y = m;

	for (let d = trace.length - 1; d >= 0; d--) {
		const vPrev = trace[d];
		const k = x - y;
		const kIdx = k + offset;

		let prevK: number;
		if (k === -d || (k !== d && vPrev[kIdx - 1] < vPrev[kIdx + 1])) {
			prevK = k + 1;
		} else {
			prevK = k - 1;
		}

		const prevX = vPrev[prevK + offset];
		const prevY = prevX - prevK;

		while (x > prevX && y > prevY) {
			x -= 1;
			y -= 1;
			ops.push({ type: 'equal', text: a[x] });
		}

		if (d > 0) {
			if (x === prevX) {
				y -= 1;
				ops.push({ type: 'insert', text: b[y] });
			} else {
				x -= 1;
				ops.push({ type: 'delete', text: a[x] });
			}
		}
	}

	ops.reverse();
	return ops;
}
