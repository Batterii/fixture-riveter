import {Attribute} from "./attributes/attribute";
import {Hook, Callback} from "./hook";
import {CallbackHandler} from "./callback-handler";
import {Declaration} from "./declarations/declaration";
import {DeclarationHandler} from "./declaration-handler";
import {Trait} from "./trait";
import {FixtureRiveter} from "./fixture-riveter";
import {SequenceHandler} from "./sequence-handler";
import {BlockFunction} from "./types";

import {last} from "lodash";

export class Definition<T> {
	fixtureRiveter: FixtureRiveter;
	name: string;
	aliases: string[];
	baseTraits: string[];
	additionalTraits: string[];
	traitsCache: Map<string, Trait<T>>;
	compiled: boolean;
	block?: BlockFunction<T>;
	callbackHandler: CallbackHandler;

	sequenceHandler: SequenceHandler;
	declarationHandler: DeclarationHandler;

	_toBuild?: any;
	_toSave?: any;
	_toDestroy?: any;
	_toRelate?: any;
	_toSet?: any;

	constructor(name: string, fixtureRiveter: FixtureRiveter) {
		this.name = name;
		this.fixtureRiveter = fixtureRiveter;

		this.aliases = [];
		this.baseTraits = [];
		this.additionalTraits = [];
		this.compiled = false;

		this.sequenceHandler = new SequenceHandler();
		this.declarationHandler = new DeclarationHandler(name);
		this.callbackHandler = new CallbackHandler(fixtureRiveter);

		this.traitsCache = new Map();
	}

	names(): string[] {
		return [this.name, ...this.aliases];
	}

	compile(): void {
		if (!this.compiled) {
			this.declarationHandler.getAttributes();
			this.compiled = true;
		}
	}

	// block is passed in as a function instead of value so it's not generated
	// until after we've compiled the definition
	aggregateFromTraitsAndSelf(
		traitMethod: (x: Trait<any>) => any|any[],
		block: () => any|any[],
	): any[] {
		this.compile();

		return [
			this.getBaseTraits().map((t) => traitMethod(t)),
			block(),
			this.getAdditionalTraits().map((t) => traitMethod(t)),
		].flat(2).filter(Boolean);
	}

	attributeNames(): string[] {
		return this.getAttributes().map((a) => a.name);
	}

	declareAttribute(declaration: Declaration): void {
		this.declarationHandler.declareAttribute(declaration);
	}

	getAttributes(): Attribute[] {
		return this.aggregateFromTraitsAndSelf(
			(trait) => trait.getAttributes(),
			() => this.declarationHandler.getAttributes(),
		);
	}

	defineTrait(newTrait: Trait<T>): void {
		if (!this.traitsCache.has(newTrait.name)) {
			this.traitsCache.set(newTrait.name, newTrait);
		}
	}

	appendTraits(traits: string[]): void {
		this.additionalTraits = this.additionalTraits.concat(traits);
	}

	inheritTraits(traits: string[]): void {
		this.baseTraits = this.baseTraits.concat(traits);
	}

	traitByName(name: string): Trait<T> {
		return this.traitsCache.get(name) || this.fixtureRiveter.getTrait(name);
	}

	getBaseTraits(): Trait<T>[] {
		return this.baseTraits.map((name) => this.traitByName(name));
	}

	getAdditionalTraits(): Trait<T>[] {
		return this.additionalTraits.map((name) => this.traitByName(name));
	}

	before(...rest: any[]): void {
		this.callbackHandler.before(...rest);
	}

	after(...rest: any[]): void {
		this.callbackHandler.after(...rest);
	}

	registerHook(names: string[], block: Callback<T>): void {
		this.callbackHandler.registerHook(names, block);
	}

	getHooks(): Hook<T>[] {
		return this.aggregateFromTraitsAndSelf(
			(trait) => trait.getHooks(),
			() => this.callbackHandler.hooks,
		);
	}

	toBuild(): ((Model: any) => any) | undefined {
		return last(this.aggregateFromTraitsAndSelf(
			(trait) => trait.toBuild(),
			() => this._toBuild,
		));
	}

	toSave(): ((instance: any, Model?: any) => Promise<any>) | undefined {
		return last(this.aggregateFromTraitsAndSelf(
			(trait) => trait.toSave(),
			() => this._toSave,
		));
	}

	toDestroy(): ((instance: any, Model?: any) => Promise<any>) | undefined {
		return last(this.aggregateFromTraitsAndSelf(
			(trait) => trait.toDestroy(),
			() => this._toDestroy,
		));
	}

	toRelate(): (
		(instance: any, name: string, other: any, Model?: any) => Promise<any> | any
	) | undefined {
		return last(this.aggregateFromTraitsAndSelf(
			(trait) => trait.toRelate(),
			() => this._toRelate,
		));
	}

	toSet(): ((instance: any, key: string, value: any) => Promise<any> | any) | undefined {
		return last(this.aggregateFromTraitsAndSelf(
			(trait) => trait.toSet(),
			() => this._toSet,
		));
	}
}
