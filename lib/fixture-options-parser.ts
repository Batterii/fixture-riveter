import {DefinitionProxy} from "./definition-proxy";
import {Evaluator} from "./evaluator";
import {Instance} from "./fixture-riveter";

import {first, isFunction, isPlainObject, last} from "lodash";

export interface FixtureOptions {
	aliases?: string[];
	traits?: string[];
	parent?: string;
}

type ConvertToFn<T, FN = () => any> = {
	[P in keyof T]-?: <Q = undefined>(
		fn: FN,
		overrides?: Partial<Q extends undefined ? T extends Instance ? T : Instance : Q>,
	) => Promise<T[P]>;
};

type EvaluatorFn<T> =
	((evaluator: ConvertToFn<T> & Evaluator) => Promise<any> | any) |
	string[] |
	Partial<T extends Instance ? T : Instance>;

export type AttrFunction<T> = (f: ConvertToFn<T, EvaluatorFn<T>> & Evaluator) => Promise<any> | any;

export type BlockFunction<T> = (f: ConvertToFn<T, EvaluatorFn<T>> & DefinitionProxy<T>) => void;

export type FixtureArgs<T> = FixtureOptions | BlockFunction<T>;

export function fixtureOptionsParser<T>(
	options?: FixtureArgs<T>,
): [FixtureOptions, BlockFunction<T> | undefined];

export function fixtureOptionsParser<T>(
	fixtureOptions: FixtureOptions,
	block?: BlockFunction<T>,
): [FixtureOptions, BlockFunction<T> | undefined];

export function fixtureOptionsParser<T>(
	...rest: any[]
): [FixtureOptions, BlockFunction<T> | undefined] {
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
