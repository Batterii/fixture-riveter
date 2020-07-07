import {DefinitionProxy} from "./definition-proxy";

import {first, isFunction, isPlainObject, last} from "lodash";

export interface FixtureOptions {
	aliases?: string[];
	traits?: string[];
	parent?: string;
}

export type blockFunction = (f: DefinitionProxy) => any;

export function fixtureOptionsParser(
	option?: FixtureOptions | blockFunction,
): [Record<string, any>, blockFunction | undefined];

export function fixtureOptionsParser(
	objOption: FixtureOptions,
	fnOption: blockFunction,
): [Record<string, any>, blockFunction | undefined];

export function fixtureOptionsParser(
	...rest: any[]
): [Record<string, any>, blockFunction | undefined] {
	let options = first(rest);
	if (!isPlainObject(options)) {
		options = {};
	}

	let block = last(rest);
	if (!isFunction(block)) {
		block = undefined;
	}

	return [options, block];
}
