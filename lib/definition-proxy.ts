import {Factory} from './factory';
import {FactoryOptions} from './factory-options-parser';
import {Sequence} from './sequences/sequence';

import {isFunction} from 'lodash';

export class DefinitionProxy {
	definition: Factory;
	childFactories: any[];

	constructor(factory: Factory) {
		this.definition = factory;
		this.childFactories = [];
	}

	execute(): void {
		if (this.definition.block) {
			this.definition.block(this);
		}
	}

	attr(attrName: string, block?: Function): void {
		if (block && isFunction(block)) {
			this.definition.defineAttribute(attrName, block);
		} else {
			throw new Error(`wrong options, bruh: ${attrName}, ${block}`);
		}
	}

	factory(name: string, model: object, rest?: FactoryOptions | Function): void;
	factory(name: string, model: object, ...rest: any[]): void {
		this.childFactories.push([name, model, rest]);
	}

	sequence(
		name: string,
		initial?: string | number,
		options?: {aliases: string[]},
		callback?: Function,
	): Sequence;

	sequence(name: string, ...rest: any[]): Sequence {
		const newSequence = this.definition.sequenceHandler.registerSequence(name, ...rest);
		this.definition.defineAttribute(name, () => newSequence.next());
		return newSequence;
	}
}
