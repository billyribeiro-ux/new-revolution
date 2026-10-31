export type ResolvedVariant = {
	campaignId: number;
	type: string;
	variantKey: string | null;
	content: Record<string, unknown>;
};
