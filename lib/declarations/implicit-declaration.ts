import {Attribute} from "../attribute";
import {Declaration} from "../declaration";
import {Factory} from "../factory";
import {FactoryBuilder} from "../factory-builder";
import {SequenceAttribute} from "../attributes/sequence-attribute";

export class ImplicitDeclaration extends Declaration {
	factoryBuilder: FactoryBuilder;
	factory: Factory;

	constructor(name: string, factoryBuilder: FactoryBuilder, factory: Factory) {
		super(name);
		this.factoryBuilder = factoryBuilder;
		this.factory = factory;
	}

	checkSelfReference(): boolean {
		return this.factory.name === this.name;
	}

	build(): Attribute[] {
		const factory = this.factoryBuilder.getFactory(this.name, false);
		if (factory) {
			return []; // to do: Association
		}
		const sequence = this.factoryBuilder.findSequence(this.name);
		if (sequence) {
			return [new SequenceAttribute(this.name, sequence)];
		}
		if (this.checkSelfReference()) {
			throw new Error(`Self-referencing trait '${this.name}'`);
		}
		this.factory.inheritTraits([this.name]);
		return [];
	}
}
