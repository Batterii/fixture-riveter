import {Attribute} from './attribute';
import {SequenceHandler} from './sequence-handler';

export interface Definition {
	name: string;
	names: () => string[];
	attributes: Attribute[];
	block: Function;
	defineAttribute: (name: string, block: Function) => void;
	sequenceHandler: SequenceHandler;
}
