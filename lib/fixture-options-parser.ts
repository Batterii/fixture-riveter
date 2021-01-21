import {FixtureRestArgs, FixtureOptions, BlockFunction} from "./types";
import {first, isFunction, isPlainObject, last} from "lodash";

export function fixtureOptionsParser<T>(
	options?: FixtureRestArgs<T>,
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
