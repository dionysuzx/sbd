import { headlineSet } from './progress.js';
import type { SetGroup } from './set-group.js';
import type { Session } from './session.js';

export type SessionSelection = { readonly session: Session; readonly highlighted: SetGroup };

export function selectSession(session: Session): SessionSelection {
	return { session, highlighted: headlineSet(session) };
}
