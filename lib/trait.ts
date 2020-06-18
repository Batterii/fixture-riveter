import {Attribute} from "./attribute";
import {Declaration} from "./declaration";
import {Definition} from "./definition";
import {DefinitionProxy} from "./definition-proxy";
import {FactoryBuilder} from "./factory-builder";
import {SequenceHandler} from "./sequence-handler";
import {DeclarationHandler} from "./declaration-handler";

/* eslint-disable class-methods-use-this */
export class Trait implements Definition {
	factoryBuilder: FactoryBuilder;
	name: string;
	traits: Set<Trait>;
	parent?: string;
	block: Function;
	attributes: Attribute[];
	sequenceHandler: SequenceHandler;
	declarationHandler: DeclarationHandler;

	constructor(
		name: string,
		factoryBuilder: FactoryBuilder,
		block?: Function,
	) {
		this.factoryBuilder = factoryBuilder;
		this.name = name;
		this.traits = new Set();
		this.attributes = [];
		this.sequenceHandler = new SequenceHandler();
		this.declarationHandler = new DeclarationHandler(name);

		if (block) {
			this.block = block;
		}

		const proxy = new DefinitionProxy(this);
		proxy.execute();
	}

	names(): string[] {
		return [this.name];
	}

	declareAttribute(declaration: Declaration): void {
		this.declarationHandler.declareAttribute(declaration);
	}

	defineTrait(trait: Trait): void {
		throw new Error(`Can't define nested traits: ${trait.name}`);
	}
}
