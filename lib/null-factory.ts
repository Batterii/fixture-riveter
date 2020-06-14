import {Attribute} from './attribute';
import {Declaration} from './declaration';
import {Trait} from './trait';
import {Definition} from './definition';
import {FactoryBuilder} from './factory-builder';
import {SequenceHandler} from './sequence-handler';

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-function */
export class NullFactory implements Definition {
	factoryBuilder: FactoryBuilder;
	name: string;
	model: any;
	aliases: string[];
	traits: Set<Trait>;
	parent?: string;
	block: Function;
	attributes: Attribute[];
	declarations: Declaration[];
	sequenceHandler: SequenceHandler;

	constructor(
		factoryBuilder: FactoryBuilder,
		model: any,
	) {
		this.factoryBuilder = factoryBuilder;
		this.name = 'nullFactory';
		this.model = model;
		this.aliases = [];
		this.traits = new Set();
		this.attributes = [];
		this.declarations = [];
		this.sequenceHandler = new SequenceHandler();
	}

	names(): string[] {
		return [this.name];
	}

	attributeNames(): string[] {
		return [];
	}

	getParentAttributes(): Attribute[] {
		return [];
	}

	getAttributes(): Attribute[] {
		return [];
	}

	traitNames(): string[] {
		return [];
	}

	getParentTraits(): Trait[] {
		return [];
	}

	getTraits(): Trait[] {
		return [];
	}

	applyAttributes(): Record<string, any> {
		return {};
	}

	parentFactory(): any { }
	declareAttribute(): void { }
	defineTrait(): void { }
	build(): any { }
	create(): any { }
}
