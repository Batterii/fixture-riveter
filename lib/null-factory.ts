import {Attribute} from './attribute';
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
	traits: any[];
	parent?: string;
	block: Function;
	attributes: Attribute[];
	sequenceHandler: SequenceHandler;

	constructor(
		factoryBuilder: FactoryBuilder,
		model: any,
	) {
		this.factoryBuilder = factoryBuilder;
		this.name = 'nullFactory';
		this.model = model;
		this.aliases = [];
		this.traits = [];
		this.attributes = [];
		this.sequenceHandler = new SequenceHandler();
	}

	names(): string[] {
		return [this.name];
	}

	parentFactory(): any { }

	defineAttribute(): void { }

	attributeNames(): string[] {
		return [];
	}

	getParentAttributes(): Attribute[] {
		return [];
	}

	getAttributes(): Attribute[] {
		return [];
	}

	applyAttributes(): Record<string, any> {
		return {};
	}

	build(): any { }

	create(): any { }
}
