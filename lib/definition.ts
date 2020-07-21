import {Attribute} from "./attributes/attribute";
import {
	Callback,
	callbackFunction,
} from "./callback";
import {CallbackHandler} from "./callback-handler";
import {Declaration} from "./declarations/declaration";
import {DeclarationHandler} from "./declaration-handler";
import {blockFunction} from "./fixture-options-parser";
import {Trait} from "./trait";
import {FixtureRiveter} from "./fixture-riveter";
import {SequenceHandler} from "./sequence-handler";

export class Definition {
	fixtureRiveter: FixtureRiveter;
	name: string;
	aliases: string[];
	attributes: Attribute[];
	baseTraits: string[];
	additionalTraits: string[];
	traitsCache?: Record<string, Trait>;
	compiled: boolean;
	block?: blockFunction;
	callbackHandler: CallbackHandler;

	sequenceHandler: SequenceHandler;
	declarationHandler: DeclarationHandler;

	traits: any;

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

		this.traits = {};
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

	defineTrait(newTrait: Trait): void {
		if (!this.traits[newTrait.name]) {
			this.traits[newTrait.name] = newTrait;
		}
	}

	appendTraits(traits: string[]): void {
		this.additionalTraits = this.additionalTraits.concat(traits);
	}

	inheritTraits(traits: string[]): void {
		this.baseTraits = this.baseTraits.concat(traits);
	}

	traitByName(name: string): Trait {
		// This is overridden by both Fixture and Trait, so ignore it please
		// I've only written this out so Typescript will shut up lol
		return this.traits[name] || this.fixtureRiveter.getTrait(name);
	}

	getInternalTraits(internalTraits: string[]): Trait[] {
		const traits: Trait[] = [];
		for (const name of internalTraits) {
			traits.push(this.traitByName(name));
		}
		return traits;
	}

	getBaseTraits(): Trait[] {
		return this.getInternalTraits(this.baseTraits);
	}

	getAdditionalTraits(): Trait[] {
		return this.getInternalTraits(this.additionalTraits);
	}

	aggregateFromTraitsAndSelf(methodName: string, block: Function): any[] {
		this.compile();

		return [
			this.getBaseTraits().map((t) => t[methodName]()),
			block(),
			this.getAdditionalTraits().map((t) => t[methodName]()),
		].flat(Infinity).filter(Boolean);
	}

	copy<T>(): T {
		const copy = Object.assign(Object.create(Object.getPrototypeOf(this)), this);

		copy.compiled = false;
		delete copy.attributes;
		delete copy.traitsCache;

		return copy;
	}

	before(...rest: any[]): void {
		this.callbackHandler.before(...rest);
	}

	after(...rest: any[]): void {
		this.callbackHandler.after(...rest);
	}

	addCallback(names: string[], block: callbackFunction): void {
		this.callbackHandler.addCallback(names, block);
	}

	getCallbacks(): Callback[] {
		return this.aggregateFromTraitsAndSelf(
			"getCallbacks",
			() => this.callbackHandler.callbacks,
		);
	}
}
