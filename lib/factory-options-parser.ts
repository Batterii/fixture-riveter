import {DefinitionProxy} from "./definition-proxy";

import {first, isFunction, isPlainObject, last} from "lodash";

export interface FactoryOptions {
	aliases?: string[];
	traits?: string[];
	parent?: string;
}

export type blockFunction = (f: DefinitionProxy) => any;

export function factoryOptionsParser(
	option?: FactoryOptions | blockFunction,
): [Record<string, any>, blockFunction | undefined];

export function factoryOptionsParser(
	objOption: FactoryOptions,
	fnOption: blockFunction,
): [Record<string, any>, blockFunction | undefined];

export function factoryOptionsParser(
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
