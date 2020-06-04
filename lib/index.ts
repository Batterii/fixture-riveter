import {Adapter} from './adapters/adapter';
import {DefaultAdapter} from './adapters/default-adapter';
import {ObjectionAdapter} from './adapters/objection-adapter';
import {FactoryBuilder} from './factory-builder';

const factory = new FactoryBuilder();

export {
	factory,
	Adapter,
	DefaultAdapter,
	ObjectionAdapter,
};
