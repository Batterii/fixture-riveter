import {Attribute} from "./attributes/attribute";
import {Callback, CallbackFunction} from "./callback";
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

	attributeNames(): string[] {
		return this.getAttributes().map((a) => a.name);
	}

	declareAttribute(declaration: Declaration): void {
		this.declarationHandler.declareAttribute(declaration);
	}

	getAttributes(): Attribute[] {
		this.compile();

		return this.aggregateFromTraitsAndSelf(
			"getAttributes",
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

	addCallback(names: string[], block: CallbackFunction<T>): void {
		this.callbackHandler.addCallback(names, block);
	}

	getCallbacks(): Callback<T>[] {
		return this.aggregateFromTraitsAndSelf(
			"getCallbacks",
			() => this.callbackHandler.callbacks,
		);
	}

	aggregateFromTraitsAndSelf(traitMethod: string, block: () => any|any[]): any[] {
		this.compile();

		return [
			this.getBaseTraits().map((t) => t[traitMethod]()),
			block(),
			this.getAdditionalTraits().map((t) => t[traitMethod]()),
		].flat(2).filter(Boolean);
	}

	toBuild(): ((Model: any) => any) | undefined {
		return last(this.aggregateFromTraitsAndSelf("toBuild", () => this._toBuild));
	}

	toSave(): ((instance: any, Model?: any) => Promise<any>) | undefined {
		return last(this.aggregateFromTraitsAndSelf("toSave", () => this._toSave));
	}

	toDestroy(): ((instance: any, Model?: any) => Promise<any>) | undefined {
		return last(this.aggregateFromTraitsAndSelf("toDestroy", () => this._toDestroy));
	}

	toRelate(): (
		(instance: any, name: string, other: any, Model?: any) => Promise<any> | any
	) | undefined {
		return last(this.aggregateFromTraitsAndSelf("toRelate", () => this._toRelate));
	}

	toSet(): ((instance: any, key: string, value: any) => Promise<any> | any) | undefined {
		return last(this.aggregateFromTraitsAndSelf("toSet", () => this._toSet));
	}
}
