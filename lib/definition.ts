import {Attribute} from "./attributes/attribute";
import {
	Callback,
	CallbackFunction,
} from "./callback";
import {CallbackHandler} from "./callback-handler";
import {Declaration} from "./declarations/declaration";
import {DeclarationHandler} from "./declaration-handler";
import {Trait} from "./trait";
import {FixtureRiveter} from "./fixture-riveter";
import {SequenceHandler} from "./sequence-handler";
import {BlockFunction} from "./types";

export class Definition<T> {
	fixtureRiveter: FixtureRiveter;
	name: string;
	aliases: string[];
	attributes: Attribute[];
	baseTraits: string[];
	additionalTraits: string[];
	traitsCache?: Record<string, Trait<T>>;
	compiled: boolean;
	block?: BlockFunction<T>;
	callbackHandler: CallbackHandler;

	declarationHandler: DeclarationHandler;

	traits: Record<string, Trait<T>>;

	constructor(name: string, fixtureRiveter: FixtureRiveter) {
		this.name = name;
		this.fixtureRiveter = fixtureRiveter;

		this.aliases = [];
		this.attributes = [];
		this.baseTraits = [];
		this.additionalTraits = [];
		this.compiled = false;

		this.declarationHandler = new DeclarationHandler(name);
		this.callbackHandler = new CallbackHandler(fixtureRiveter);

		this.traits = {};
	}

	get sequenceHandler(): SequenceHandler {
		return this.fixtureRiveter.sequenceHandler;
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

	defineTrait(newTrait: Trait<T>): void {
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

	traitByName(name: string): Trait<T> {
		// This is overridden by both Fixture and Trait, so ignore it please
		// I've only written this out so Typescript will shut up lol
		return this.traits[name] || this.fixtureRiveter.getTrait(name);
	}

	getInternalTraits(internalTraits: string[]): Trait<T>[] {
		const traits: Trait<T>[] = [];
		for (const name of internalTraits) {
			traits.push(this.traitByName(name));
		}
		return traits;
	}

	getBaseTraits(): Trait<T>[] {
		return this.getInternalTraits(this.baseTraits);
	}

	getAdditionalTraits(): Trait<T>[] {
		return this.getInternalTraits(this.additionalTraits);
	}

	copy<C>(): C {
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

	addCallback(names: string[], block: CallbackFunction<T>): void {
		this.callbackHandler.addCallback(names, block);
	}

	getCallbacks(): Callback<T>[] {
		this.compile();

		return [
			this.getBaseTraits().map((t) => t.getCallbacks()),
			this.callbackHandler.callbacks,
			this.getAdditionalTraits().map((t) => t.getCallbacks()),
		].flat(2).filter(Boolean);
	}
}
