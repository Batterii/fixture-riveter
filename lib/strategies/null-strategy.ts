import {Strategy} from "./strategy";

/* eslint-disable @typescript-eslint/no-empty-function */
export class NullStrategy extends Strategy {
	association(): any { }
	result(): any { }
}
