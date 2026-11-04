import * as v from 'valibot';
import { form, prerender } from '$app/server';
import { EBOOK_PROFILES } from '#lib/data/homepage.ts';

export const getDeskStatus = prerender(async () => {
	return {
		edition: 'THE EXECUTION DOSSIER / 001',
		statusLabel: 'RISK FIRST',
		updatedYear: 2026
	};
});

export const submitEbookLead = form(
	v.object({
		firstName: v.pipe(
			v.string(),
			v.trim(),
			v.minLength(1, 'Please enter your first name.'),
			v.maxLength(80, 'First name must be 80 characters or fewer.')
		),
		email: v.pipe(v.string(), v.trim(), v.email('Please enter a valid email address.')),
		profile: v.picklist(EBOOK_PROFILES, 'Please select your trading profile.')
	}),
	async ({ firstName, profile }) => {
		return {
			success: true,
			message: `Preview only: validated for ${firstName} (${profile}), but no email was sent or data collected. Connect email delivery and publish the eBook before launch.`
		};
	}
);
