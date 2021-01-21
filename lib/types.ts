import {DefinitionProxy} from "./definition-proxy";
import {Evaluator} from "./evaluator";

export type Pojo = Record<string, any>;

export interface ModelConstructor<T> {
	new(): T;
}

export type ClassOrRecord<T> =
	T extends Pojo ? T : Pojo;

export type Overrides<T> = Partial<ClassOrRecord<T>>;

export type OverrideForRelation<T, R = undefined> = Overrides<R extends undefined ? T : R>;

export interface TraitsFn<T, KeyType, ArgFN, Relation = undefined> {
	(fn: ArgFN): Promise<KeyType>;
	<R = Relation>(
		traitsOrOverrides?:
		| string[]
		| OverrideForRelation<T, R>,
	): Promise<KeyType>;
	<R = Relation>(
		traits: string[],
		overrides?: OverrideForRelation<T, R>,
	): Promise<KeyType>;
}

export type ConvertToFn<T, ArgFN = () => any> = {
	[Key in keyof T]-?: TraitsFn<T, T[Key], ArgFN>;
};

type CurrentEvaluator<T> = {
	[Key in keyof T]-?: () => Promise<T[Key]>;
} & Exclude<Evaluator, "methodMissing">;

export type EvaluatorFunction<T> =
	| ((evaluator: CurrentEvaluator<T>) => any)
	| string[]
	| Overrides<T>;

export type BlockFunction<T> =
	(
		fixture: (
			& ConvertToFn<T, EvaluatorFunction<T>>
			& Exclude<DefinitionProxy<T>, "methodMissing">
		)
	) => any;

export interface FixtureOptions {
	aliases?: string[];
	traits?: string[];
	parent?: string;
}

export type FixtureRestArgs<T> = FixtureOptions | BlockFunction<T>;
