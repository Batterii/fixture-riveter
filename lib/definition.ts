import {Adapter} from "./adapters/adapter";
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
	attributes: Attribute[];
	baseTraits: string[];
	additionalTraits: string[];
	traitsCache: Map<string, Trait<T>>;
	compiled: boolean;
	block?: BlockFunction<T>;
	callbackHandler: CallbackHandler;
	adapter: Partial<Adapter>;

	sequenceHandler: SequenceHandler;
	declarationHandler: DeclarationHandler;

	constructor(name: string, fixtureRiveter: FixtureRiveter) {
		this.name = name;
		this.fixtureRiveter = fixtureRiveter;

		this.aliases = [];
		this.attributes = [];
		this.baseTraits = [];
		this.additionalTraits = [];
		this.compiled = false;

		this.sequenceHandler = new SequenceHandler();
		this.declarationHandler = new DeclarationHandler(name);
		this.callbackHandler = new CallbackHandler(fixtureRiveter);
		this.adapter = {};

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
		return this.attributes.map((a) => a.name);
	}

	declareAttribute(declaration: Declaration): void {
		this.declarationHandler.declareAttribute(declaration);
	}

	getAttributes(): Attribute[] {
		this.compile();

		if (!this.attributes || this.attributes.length === 0) {
			this.attributes = this.aggregateFromTraitsAndSelf(
				"getAttributes",
				() => this.declarationHandler.getAttributes(),
			);
		}

		return this.attributes;
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
		// This is overridden by both Fixture and Trait, so ignore it please
		// I've only written this out so Typescript will shut up lol
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

	copy<C extends Definition<T>>(): C {
		const copy: C = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
		copy.compiled = false;
		copy.attributes = [];
		return copy;
	}

	// Adapter nonsense
	// tbh idk what the best way to handle this is, but here we are

	toBuild(): <U = T>(Model: any) => U {
		const toBuild = this.aggregateFromTraitsAndSelf(
			"toBuild",
			() => (this.adapter.build ? (Model: any) => this.adapter.build!(Model) : undefined),
		);
		return last(toBuild);
	}

	toSave(): <U = T>(instance: any, Model?: any) => Promise<U> {
		const currentAdapter = this.fixtureRiveter.getAdapter(this.name);
		return async(...args) => currentAdapter.save(...args);
	}

	toDestroy(): (instance: any, Model?: any) => Promise<void> {
		const currentAdapter = this.fixtureRiveter.getAdapter(this.name);
		return async(...args) => currentAdapter.destroy(...args);
	}

	toRelate(): (i: any, name: string, other: any, Model?: any) => Promise<Record<string, any>> {
		const currentAdapter = this.fixtureRiveter.getAdapter(this.name);
		return async(...args) => currentAdapter.relate(...args);
	}

	toSet(): (instance: any, key: any, value: any) => Promise<Record<string, any>> {
		const currentAdapter = this.fixtureRiveter.getAdapter(this.name);
		return async(...args) => currentAdapter.set(...args);
	}

	buildAdapter(): Adapter {
		return {
			build: this.toBuild(),
			save: this.toSave(),
			destroy: this.toDestroy(),
			relate: this.toRelate(),
			set: this.toSet(),
		};
	}
}
