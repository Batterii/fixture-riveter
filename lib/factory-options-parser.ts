import {first, isFunction, isPlainObject, last} from "lodash";

export interface FactoryOptions {
	aliases?: string[];
	traits?: string[];
	parent?: string;
}

export function factoryOptionsParser(
	option?: FactoryOptions | Function,
): [Record<string, any>, Function | undefined];

export function factoryOptionsParser(
	objOption: FactoryOptions,
	fnOption: Function,
): [Record<string, any>, Function | undefined];

export function factoryOptionsParser(
	...rest: any[]
): [Record<string, any>, Function | undefined] {
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
