import {Attribute} from './attribute';
import {Definition} from './definition';
import {DefinitionProxy} from './definition-proxy';
import {FactoryBuilder} from './factory-builder';
import {SequenceHandler} from './sequence-handler';

export class Trait implements Definition {
	factoryBuilder: FactoryBuilder;
	name: string;
	traits: Set<Trait>;
	parent?: string;
	block: Function;
	attributes: Attribute[];
	sequenceHandler: SequenceHandler;

	constructor(
		factoryBuilder: FactoryBuilder,
		name: string,
		block?: Function,
	) {
		this.factoryBuilder = factoryBuilder;
		this.name = name;
		this.traits = new Set();
		this.attributes = [];
		this.sequenceHandler = new SequenceHandler();
		if (block) {
			this.block = block;
		}

		const proxy = new DefinitionProxy(this);
		proxy.execute();
	}

	names(): string[] {
		return [this.name];
	}

	defineAttribute(attribute: Attribute): void {
		this.attributes.push(attribute);
	}

	defineTrait(trait: Trait): void {
		throw new Error(`Can't define nested traits: ${trait.name}`);
	}
}
