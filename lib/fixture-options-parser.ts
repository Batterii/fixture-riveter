import {DefinitionProxy} from "./definition-proxy";
import {Evaluator} from "./evaluator";

import {first, isFunction, isPlainObject, last} from "lodash";

export interface FixtureOptions {
	aliases?: string[];
	traits?: string[];
	parent?: string;
}

type ConvertToFn<T, FN = () => any> = {
	[P in keyof T]: (fn?: FN) => Promise<T[P]>;
};

type EvaluatorFn<T> = (evaluator: ConvertToFn<T> & Evaluator) => any;

export type blockFunction<T> = (f: ConvertToFn<T, EvaluatorFn<T>> & DefinitionProxy<T>) => void;

export function fixtureOptionsParser<T>(
	option?: FixtureOptions | blockFunction<T>,
): [Record<string, any>, blockFunction<T> | undefined];

export function fixtureOptionsParser<T>(
	objOption: FixtureOptions,
	fnOption: blockFunction<T>,
): [Record<string, any>, blockFunction<T> | undefined];

export function fixtureOptionsParser<T>(
	...rest: any[]
): [Record<string, any>, blockFunction<T> | undefined] {
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
