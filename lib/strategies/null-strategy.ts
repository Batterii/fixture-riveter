import {Strategy} from "./strategy";

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-function */
export class NullStrategy extends Strategy {
	association(): any { }
	result(): any { }
}
