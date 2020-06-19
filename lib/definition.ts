import {Attribute} from "./attribute";
import {Declaration} from "./declaration";
import {DeclarationHandler} from "./declaration-handler";
import {Trait} from "./trait";
import {FactoryBuilder} from "./factory-builder";
import {SequenceHandler} from "./sequence-handler";

export abstract class Definition {
	factoryBuilder: FactoryBuilder;
	name: string;
	aliases: string[];
	attributes: Attribute[];
	traits: Set<Trait>;
	compiled: boolean;

	sequenceHandler: SequenceHandler;
	declarationHandler: DeclarationHandler;

	constructor(name: string, factoryBuilder: FactoryBuilder) {
		this.name = name;
		this.aliases = [];

		this.factoryBuilder = factoryBuilder;
		this.traits = new Set();
		this.attributes = [];

		this.sequenceHandler = new SequenceHandler();
		this.declarationHandler = new DeclarationHandler(name);
	}

	names(): string[] {
		return [this.name, ...this.aliases];
	}

	compile(): void {
		if (!this.compiled) {
			this.compiled = true;
		}
	}

	declareAttribute(declaration: Declaration): void {
		this.declarationHandler.declareAttribute(declaration);
	}

	defineTrait(trait: Trait): void {
		this.traits.add(trait);
	}
}
