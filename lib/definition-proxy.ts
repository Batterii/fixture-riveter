import {Attribute} from './attribute';
import {Trait} from './trait';
import {Definition} from './definition';
import {FactoryOptions} from './factory-options-parser';
import {FactoryBuilder} from './factory-builder';
import {Sequence} from './sequences/sequence';
import {SequenceHandler} from './sequence-handler';

import {isFunction} from 'lodash';

export class DefinitionProxy {
	definition: Definition;
	childFactories: any[];

	constructor(definition: Definition) {
		this.definition = definition;
		this.childFactories = [];
	}

	execute(): void {
		if (this.definition.block) {
			this.definition.block(this);
		}
	}

	get factoryBuilder(): FactoryBuilder {
		return this.definition.factoryBuilder;
	}

	get sequenceHandler(): SequenceHandler {
		return this.definition.sequenceHandler;
	}

	attr(name: string, block?: Function): void {
		if (block && isFunction(block)) {
			this.definition.defineAttribute(new Attribute(name, block));
		} else {
			throw new Error(`wrong options, bruh: ${name}, ${block}`);
		}
	}

	factory(name: string, model: object, rest?: FactoryOptions | Function): void;
	factory(name: string, model: object, ...rest: any[]): void {
		this.childFactories.push([name, model, ...rest]);
	}

	sequence(
		name: string,
		initial?: string | number,
		options?: {aliases: string[]},
		callback?: Function,
	): Sequence;

	sequence(name: string, ...rest: any[]): Sequence {
		const newSequence = this.sequenceHandler.registerSequence(name, ...rest);
		this.definition.defineAttribute(new Attribute(name, () => newSequence.next()));
		return newSequence;
	}

	trait(name: string, block?: Function): void {
		if (block && isFunction(block)) {
			this.definition.defineTrait(new Trait(this.factoryBuilder, name, block));
		} else {
			throw new Error(`wrong options, bruh: ${name}, ${block}`);
		}
	}
}
