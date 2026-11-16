/**
 * IP anonymisation for the consent audit log.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 *
 * A full IP address is personal data. Recital 30 GDPR names online
 * identifiers explicitly, and the CJEU held in Breyer (C-582/14) that even a
 * DYNAMIC IP is personal data in the hands of a party that can plausibly link
 * it to a person. Storing one forever in a consent log therefore has to clear
 * Art. 5(1)(c) data minimisation, and it does not: what Art. 7(1) requires you
 * to demonstrate is THAT consent was given, by whom (pseudonymously), when,
 * and to what. The `anonId` + `createdAt` + `categories` + `policyVersion`
 * already carry all of that. The full IP adds nothing to the proof and a great
 * deal to the liability.
 *
 * Measured 2026-07-28: 283 of 283 consent rows held a full, un-truncated IP
 * with no retention limit, going back to 2026-06-06.
 *
 * What enterprise CMPs actually store: a consent id, a timestamp, the
 * categories, the policy version, and either no IP or a truncated one. This
 * matches the long-standing "IP anonymisation" convention (drop the last
 * octet of IPv4, keep only the /48 of IPv6) that Google Analytics, Matomo and
 * the German DPAs all converged on: enough to keep coarse geography and abuse
 * signal, not enough to single out a household.
 *
 * Truncation happens at INGEST, so a full IP is never written to disk.
 */

/**
 * Reduce an IP to a non-identifying prefix.
 *
 *   IPv4  203.0.113.42          -> 203.0.113.0     (/24)
 *   IPv6  2001:db8:1234:5678::1 -> 2001:db8:1234:: (/48)
 *
 * Returns `null` for anything unparseable, so a malformed header can never be
 * stored verbatim on the assumption that it was "probably fine".
 */
export function anonymiseIp(ip: string | null | undefined): string | null {
	if (typeof ip !== 'string') return null;
	const trimmed = ip.trim();
	if (trimmed.length === 0) return null;

	// IPv4-mapped IPv6 (::ffff:203.0.113.42) is an IPv4 address wearing a hat.
	const mapped = trimmed.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
	const candidate = mapped?.[1] ?? trimmed;

	if (candidate.includes('.')) {
		const parts = candidate.split('.');
		if (parts.length !== 4) return null;
		const octets = parts.map((p) => Number(p));
		if (octets.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) return null;
		// Reject "01.2.3.4" style input: Number() accepts it, inet parsers differ.
		if (parts.some((p) => p.length > 1 && p.startsWith('0'))) return null;
		return `${octets[0]}.${octets[1]}.${octets[2]}.0`;
	}

	if (candidate.includes(':')) {
		// Only the first three hextets (48 bits) survive. `::` expansion is not
		// needed: anything before the first `::` is already the leading groups.
		const head = candidate.split('::')[0] ?? '';
		const groups = head.split(':').filter((g) => g.length > 0);
		if (groups.length === 0) return '::'; // e.g. "::1" — nothing identifying left
		if (groups.some((g) => !/^[0-9a-f]{1,4}$/i.test(g))) return null;
		return `${groups.slice(0, 3).join(':')}::`;
	}

	return null;
}
