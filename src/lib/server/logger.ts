export interface Logger {
	info: (objOrMsg: unknown, msg?: string) => void;
	warn: (objOrMsg: unknown, msg?: string) => void;
	error: (objOrMsg: unknown, msg?: string) => void;
	debug: (objOrMsg: unknown, msg?: string) => void;
	child: (ctx: Record<string, unknown>) => Logger;
}

function createLogger(
	baseCtx: Record<string, unknown> = { service: 'revolution-trading-pros' }
): Logger {
	const log = (level: 'info' | 'warn' | 'error' | 'debug', objOrMsg: unknown, msg?: string) => {
		if (process.env.VITEST && level !== 'error') return;
		const fn =
			level === 'error'
				? console.error
				: level === 'warn'
					? console.warn
					: level === 'debug'
						? console.debug
						: console.info;
		if (typeof objOrMsg === 'string') {
			fn(`[${level}]`, objOrMsg, baseCtx);
		} else if (msg) {
			fn(`[${level}] ${msg}`, { ...baseCtx, ...(objOrMsg as Record<string, unknown>) });
		} else {
			fn(`[${level}]`, { ...baseCtx, ...(objOrMsg as Record<string, unknown>) });
		}
	};

	return {
		info: (objOrMsg, msg) => log('info', objOrMsg, msg),
		warn: (objOrMsg, msg) => log('warn', objOrMsg, msg),
		error: (objOrMsg, msg) => log('error', objOrMsg, msg),
		debug: (objOrMsg, msg) => log('debug', objOrMsg, msg),
		child: (ctx) => createLogger({ ...baseCtx, ...ctx })
	};
}

export const logger: Logger = createLogger();

export function requestLogger(ctx: { reqId: string; route?: string; method?: string }): Logger {
	return logger.child(ctx);
}
