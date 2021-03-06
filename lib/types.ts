// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {DefinitionProxy} from "./definition-proxy";
import {Evaluator} from "./evaluator";

export type Pojo = Record<string, any>;

export interface ModelConstructor<T> {name?: string; new(): T}

export type ObjectionModelConstructor<T> = {tableName?: string} & ModelConstructor<T>;
export type FixtureName<T> = string | ObjectionModelConstructor<T>;

export type ClassOrRecord<T> = T extends Pojo ? T : Pojo;

export type Overrides<T> = Partial<ClassOrRecord<T>>;

export type OverrideForRelation<T, R> = Overrides<R extends undefined ? T : R>;

interface TraitsFn<T, KeyType, ArgFN, Relation = undefined> {
	(fn: ArgFN): Promise<KeyType>;
	<R = Relation>(
		traitsOrOverrides?:
		| string[]
		| OverrideForRelation<T, R>,
	): Promise<KeyType>;
	<R = Relation>(traits?: string[], overrides?: OverrideForRelation<T, R>): Promise<KeyType>;
}

type ConvertToFn<T, ArgFN = () => any> = {
	[Key in keyof T]-?: TraitsFn<T, T[Key], ArgFN>;
};

export type CurrentEvaluator<T> = {
	[Key in keyof T]-?: () => Promise<T[Key]>;
} & Exclude<Evaluator, "methodMissing">;

export type EvaluatorFunction<T> =
	| ((evaluator: CurrentEvaluator<T>) => any)
	| string[]
	| Overrides<T>;

type FixtureBuilder<T> = (
	& ConvertToFn<T, EvaluatorFunction<T>>
	& Exclude<DefinitionProxy<T>, "methodMissing">
);

export type BlockFunction<T> = (fixture: FixtureBuilder<T>) => any;

export interface FixtureOptions {
	aliases?: string[];
	traits?: string[];
	parent?: string;
}

export type FixtureRestArgs<T> = FixtureOptions | BlockFunction<T>;
