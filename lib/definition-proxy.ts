import {addMethodMissing} from "./method-missing";
import {Declaration} from "./declarations/declaration";
import {RelationDeclaration} from "./declarations/relation-declaration";
import {DynamicDeclaration} from "./declarations/dynamic-declaration";
import {ImplicitDeclaration} from "./declarations/implicit-declaration";
import {Trait} from "./trait";
import {Definition} from "./definition";
import {Fixture} from "./fixture";
import {
	EvaluatorFunction,
	BlockFunction,
	FixtureRestArgs,
	FixtureName,
	FixtureOptions,
	ModelConstructor,
	OverrideForRelation,
	CurrentEvaluator,
} from "./types";
import {CallbackFunction} from "./callback";
import {FixtureRiveter, nameGuard} from "./fixture-riveter";
import {Sequence, SequenceCallback} from "./sequence";
import {SequenceHandler} from "./sequence-handler";

import {isFunction, last} from "lodash";

export class DefinitionProxy<T> {
	definition: Definition<T>;
	childFixtures: [string, ModelConstructor<T>, ...any][];
	ignore: boolean;

	constructor(definition: Definition<T>, ignore = false) {
		this.definition = definition;
		this.childFixtures = [];
		this.ignore = ignore;
	}

	execute(): void {
		if (this.definition.block) {
			const wrappedThis = addMethodMissing(this);
			this.definition.block.call(wrappedThis, wrappedThis);
		}
	}

	get fixtureRiveter(): FixtureRiveter {
		return this.definition.fixtureRiveter;
	}

	get sequenceHandler(): SequenceHandler {
		return this.definition.sequenceHandler;
	}

	methodMissing(name: string, ...rest: any[]): void {
		this.attr(name, ...rest);
	}

	attr(name: string, fn: EvaluatorFunction<T>): void;

	attr<R = undefined>(
		name: string,
		traits: string[],
		overrides?: OverrideForRelation<T, R>,
	): void;

	attr<R = undefined>(
		name: string,
		traitOrOverrides?: string[] | OverrideForRelation<T, R>,
	): void;

	attr(name: string, ...rest: any[]): void {
		let declaration: Declaration;

		if (rest.length > 0) {
			const block = last(rest);
			if (isFunction(block)) {
				declaration = new DynamicDeclaration(name, this.ignore, block);
			} else {
				declaration = new RelationDeclaration(name, rest.flat(2));
			}
		} else {
			declaration = new ImplicitDeclaration(
				name,
				this.ignore,
				this.fixtureRiveter,
				this.definition as Fixture<T>,
			);
		}
		this.definition.declareAttribute(declaration);
	}

	fixture(
		name: FixtureName<T>,
		model: ModelConstructor<T>,
		options: FixtureOptions,
		block?: BlockFunction<T>,
	): void;

	fixture(name: FixtureName<T>, model: ModelConstructor<T>, rest?: FixtureRestArgs<T>): void;

	fixture(fixtureName: FixtureName<T>, model: ModelConstructor<T>, ...rest: any[]): void {
		const name = nameGuard(fixtureName);
		this.childFixtures.push([name, model, ...rest]);
	}

	relation<R = undefined>(
		name: string,
		traits: string[],
		overrides?: OverrideForRelation<T, R> & {strategy?: string, fixture?: string | string[]},
	): void;

	relation<R = undefined>(
		name: string,
		traitOrOverrides?: string[] | (
			OverrideForRelation<T, R> & {strategy?: string, fixture?: string | string[]}
		),
	): void;

	relation(name: string, ...rest: any[]): void {
		const relation = new RelationDeclaration(name, rest);
		this.definition.declareAttribute(relation);
	}

	sequence<C extends string | number | (() => Generator<any, any, any>)>(
		name: string,
		options?: C | SequenceCallback<number>,
	): Sequence<C>;

	sequence<C extends string | number | (() => Generator<any, any, any>)>(
		name: string,
		initial: C,
		callback?: SequenceCallback<C extends string ? string : C extends | number ? number : any>,
	): Sequence<C>;

	sequence(name: string, ...rest: any[]): Sequence<any> {
		if (rest.some((s) => Array.isArray(s))) {
			throw new Error(`Can't define the inline sequence ${name} with aliases`);
		}
		const sequence = this.sequenceHandler.registerSequence(name, ...rest);
		this.attr(name, () => sequence.next());
		return sequence;
	}

	trait(name: string, block: BlockFunction<T>): void {
		const newTrait = new Trait(name, this.fixtureRiveter, block);
		this.definition.defineTrait(newTrait);
	}

	transient(block: BlockFunction<T>): void {
		const proxy = new DefinitionProxy(this.definition, true);
		block(addMethodMissing(proxy));
	}

	before(name: string, block: CallbackFunction<T>): void;
	before(name: string, name2: string, block: CallbackFunction<T>): void;
	before(name: string, name2: string, name3: string, block: CallbackFunction<T>): void;
	before(...rest: any[]): void {
		this.definition.before(...rest);
	}

	after(name: string, block: CallbackFunction<T>): void;
	after(name: string, name2: string, block: CallbackFunction<T>): void;
	after(name: string, name2: string, name3: string, block: CallbackFunction<T>): void;
	after(...rest: any[]): void {
		this.definition.after(...rest);
	}

	toBuild<U = T>(
		fn: (Model: ModelConstructor<U>, evaluator: CurrentEvaluator<U>) => T|Promise<T>,
	): void {
		this.definition._toBuild = fn;
	}

	toSave(fn: (instance: any, Model?: any) => Promise<any>): void {
		this.definition._toSave = fn;
	}

	toDestroy(fn: (instance: any, Model?: any) => Promise<void>): void {
		this.definition._toDestroy = fn;
	}

	toRelate(fn: (instance: any, name: string, other: any, Model?: any) => Promise<any>): void {
		this.definition._toRelate = fn;
	}

	toSet(fn: (instance: any, key: string, value: any) => Promise<any>): void {
		this.definition._toSet = fn;
	}
}
