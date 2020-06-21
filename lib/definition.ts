import {Attribute} from "./attribute";
import {Declaration} from "./declaration";
import {DeclarationHandler} from "./declaration-handler";
import {Trait} from "./trait";
import {FactoryBuilder} from "./factory-builder";
import {SequenceHandler} from "./sequence-handler";

export class Definition {
	factoryBuilder: FactoryBuilder;
	name: string;
	aliases: string[];
	attributes: Attribute[];
	definedTraits: Set<Trait>;
	baseTraits: string[];
	traitsCache?: Record<string, Trait>;
	compiled: boolean;
	block?: Function;

	sequenceHandler: SequenceHandler;
	declarationHandler: DeclarationHandler;

	constructor(name: string, factoryBuilder: FactoryBuilder) {
		this.name = name;
		this.factoryBuilder = factoryBuilder;

		this.aliases = [];
		this.attributes = [];
		this.definedTraits = new Set();
		this.baseTraits = [];
		this.compiled = false;

		this.sequenceHandler = new SequenceHandler();
		this.declarationHandler = new DeclarationHandler(name);
	}

	names(): string[] {
		return [this.name, ...this.aliases];
	}

	compile(): void {
		if (!this.compiled) {
			this.declarationHandler.getAttributes();
			for (const definedTrait of this.definedTraits) {
				for (const baseTrait of this.getBaseTraits()) {
					baseTrait.defineTrait(definedTrait);
				}
			}
			this.compiled = true;
		}
	}

	attributeNames(): string[] {
		return this.attributes.map((a) => a.name);
	}

	traitNames(): string[] {
		const traits = Array.from(this.definedTraits.values());
		return traits.map((t: Trait) => t.name);
	}

	declareAttribute(declaration: Declaration): void {
		this.declarationHandler.declareAttribute(declaration);
	}

	defineTrait(trait: Trait): void {
		this.definedTraits.add(trait);
	}

	populateTraitsCache(): Record<string, Trait> {
		if (!this.traitsCache || Object.keys(this.traitsCache).length === 0) {
			const cache = {};
			this.definedTraits.forEach((trait: Trait) => {
				cache[trait.name] = trait;
			});
			this.traitsCache = cache;
		}
		return this.traitsCache;
	}

	traitFor(name: string): Trait | undefined {
		const traitsCache = this.populateTraitsCache();
		return traitsCache[name];
	}

	traitByName(name: string): Trait | undefined {
		return this.traitFor(name) || this.factoryBuilder.getTrait(name, false);
	}

	getBaseTraits(): Trait[] {
		const traits: Trait[] = [];
		this.baseTraits.forEach((name: string) => {
			const result = this.traitByName(name);
			if (result) {
				traits.push(result);
			}
		});
		return traits;
	}

	aggregateFromTraitsAndSelf(attributes: any): any {
		this.compile();

		return [
			this.getBaseTraits(),
			attributes,
			// this.additionalTraits(),
		].flat(Infinity).filter(Boolean);
	}

	getAttributes(): Attribute[] {
		if (!this.attributes || this.attributes.length === 0) {
			const declarationAttributes = this.declarationHandler.getAttributes();
			this.attributes = this.aggregateFromTraitsAndSelf(declarationAttributes);
		}
		return this.attributes;
	}
}
