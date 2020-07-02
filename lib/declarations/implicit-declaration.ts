import {Attribute} from "../attributes/attribute";
import {Declaration} from "../declarations/declaration";
import {Factory} from "../factory";
import {FactoryBuilder} from "../factory-builder";
import {AssociationAttribute} from "../attributes/association-attribute";
import {SequenceAttribute} from "../attributes/sequence-attribute";

export class ImplicitDeclaration extends Declaration {
	factoryBuilder: FactoryBuilder;
	factory: Factory;

	constructor(
		name: string,
		ignored: boolean,
		factoryBuilder: FactoryBuilder,
		factory: Factory,
	) {
		super(name, ignored);
		this.factoryBuilder = factoryBuilder;
		this.factory = factory;
	}

	checkSelfReference(): boolean {
		return this.factory.name === this.name;
	}

	build(): Attribute[] {
		if (this.factoryBuilder.getFactory(this.name, false)) {
			return [new AssociationAttribute(this.name, this.name, [])];
		}
		const sequence = this.factoryBuilder.findSequence(this.name);
		if (sequence) {
			return [new SequenceAttribute(this.name, this.ignored, sequence)];
		}
		if (this.checkSelfReference()) {
			throw new Error(`Self-referencing trait '${this.name}'`);
		}
		this.factory.inheritTraits([this.name]);
		return [];
	}
}
