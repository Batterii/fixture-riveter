import {Strategy} from "./strategy";

export class NullStrategy extends Strategy {
	result(): any {
		return undefined;
	}

	relation(): any {
		return undefined;
	}
}
