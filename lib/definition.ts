import {Attribute} from "./attribute";
import {Declaration} from "./declaration";
import {Trait} from "./trait";
import {FactoryBuilder} from "./factory-builder";
import {SequenceHandler} from "./sequence-handler";

export interface Definition {
	factoryBuilder: FactoryBuilder;
	name: string;
	names: () => string[];
	attributes: Attribute[];
	traits: Set<Trait>;
	block: Function;
	declareAttribute: (declaration: Declaration) => void;
	defineTrait: (trait: Trait) => void;
	sequenceHandler: SequenceHandler;
}
