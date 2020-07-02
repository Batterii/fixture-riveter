import {Attribute} from "./attributes/attribute";
import {
	Callback,
	callbackFunction,
} from "./callback";
import {CallbackHandler} from "./callback-handler";
import {Declaration} from "./declarations/declaration";
import {DeclarationHandler} from "./declaration-handler";
import {blockFunction} from "./factory-options-parser";
import {Trait} from "./trait";
import {FactoryBuilder} from "./factory-builder";
import {SequenceHandler} from "./sequence-handler";

export class Definition {
	factoryBuilder: FactoryBuilder;
	name: string;
	aliases: string[];
	attributes: Attribute[];
	definedTraits: Trait[];
	baseTraits: string[];
	additionalTraits: string[];
	traitsCache?: Record<string, Trait>;
	compiled: boolean;
	block?: blockFunction;
	callbackHandler: CallbackHandler;

	sequenceHandler: SequenceHandler;
	declarationHandler: DeclarationHandler;

	constructor(name: string, factoryBuilder: FactoryBuilder) {
		this.name = name;
		this.factoryBuilder = factoryBuilder;

		this.aliases = [];
		this.attributes = [];
		this.definedTraits = [];
		this.baseTraits = [];
		this.additionalTraits = [];
		this.compiled = false;

		this.sequenceHandler = new SequenceHandler();
		this.declarationHandler = new DeclarationHandler(name);
		this.callbackHandler = new CallbackHandler(factoryBuilder);
	}

	names(): string[] {
		return [this.name, ...this.aliases];
	}

	compile(): void {
		if (!this.compiled) {
			// Generates the list of attributes
			this.declarationHandler.getAttributes();

			for (const definedTrait of this.definedTraits) {
				for (const baseTrait of this.getBaseTraits()) {
					baseTrait.defineTrait(definedTrait);
				}
				for (const additionalTraits of this.getAdditionalTraits()) {
					additionalTraits.defineTrait(definedTrait);
				}
			}
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
		if (!this.definedTraits.map((t) => t.name).includes(newTrait.name)) {
			this.definedTraits.push(newTrait);
		}
	}

	appendTraits(traits: string[]): void {
		this.additionalTraits = this.additionalTraits.concat(traits);
	}

	inheritTraits(traits: string[]): void {
		this.baseTraits = this.baseTraits.concat(traits);
	}

	populateTraitsCache(): Record<string, Trait> {
		if (!this.traitsCache || Object.keys(this.traitsCache).length === 0) {
			const cache = {};
			for (const trait of this.definedTraits) {
				cache[trait.name] = trait;
			}
			this.traitsCache = cache;
		}
		return this.traitsCache;
	}

	traitFor(name: string): Trait | undefined {
		const traitsCache = this.populateTraitsCache();
		return traitsCache[name];
	}

	traitByName(name: string): Trait {
		return this.traitFor(name) || this.factoryBuilder.getTrait(name);
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

	getAttributes(): Attribute[] {
		if (!this.attributes || this.attributes.length === 0) {
			this.attributes = this.aggregateFromTraitsAndSelf(
				"getAttributes",
				() => this.declarationHandler.getAttributes(),
			);
		}
		return this.attributes;
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
