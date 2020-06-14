import {Attribute} from '../attribute';
import {Declaration} from '../declaration';
import {Factory} from '../factory';
import {FactoryBuilder} from '../factory-builder';

export class ImplicitDeclaration extends Declaration {
	factoryBuilder: FactoryBuilder;
	factory: Factory;

	constructor(name: string, factoryBuilder: FactoryBuilder, factory: Factory) {
		super(name);
		this.factoryBuilder = factoryBuilder;
		this.factory = factory;
	}

	build(): Attribute[] {
		if (this.factoryBuilder.factories[this.name]) {
			return []; // TODO: Association
		}
		if (this.factoryBuilder.findSequence(this.name)) {
			return []; // TODO: Sequences
		}
		if (this.factory.name === this.name) {
			throw new Error(`Self-referencing trait '${this.name}`);
		}
		this.factory.inheritTraits([this.name]);
		return [];
	}

	// def build
	//   if FactoryBot.factories.registered?(name)
	//     [Attribute::Association.new(name, name, {})]
	//   elsif FactoryBot::Internal.sequences.registered?(name)
	//     [Attribute::Sequence.new(name, name, @ignored)]
	//   elsif @factory.name.to_s == name.to_s
	//     message = "Self-referencing trait '#{@name}'"
	//     raise TraitDefinitionError, message
	//   else
	//     @factory.inherit_traits([name])
	//     []
	//   end
	// end
}
