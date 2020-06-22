import {Adapter} from "./adapters/adapter";
import {AdapterHandler, FactoryNames} from "./adapter-handler";
import {DefinitionProxy} from "./definition-proxy";
import {ExtraAttributes, Factory} from "./factory";
import {FactoryOptions, factoryOptionsParser} from "./factory-options-parser";
import {Sequence} from "./sequences/sequence";
import {SequenceHandler} from "./sequence-handler";
import {Trait} from "./trait";

import {isPlainObject, last} from "lodash";

export function extractAttributes(traitsAndOptions: any[]): Record<string, any> {
	const options = last(traitsAndOptions);
	if (isPlainObject(options)) {
		return traitsAndOptions.pop();
	}
	return {};
}

export function buildTraitsAndAttributes(traits: any[]): ExtraAttributes {
	const attrs = extractAttributes(traits);
	return {traits, attrs};
}

export class FactoryBuilder {
	factories: Record<string, Factory>;
	traits: Record<string, Trait>;
	adapterHandler: any;
	sequenceHandler: SequenceHandler;

	constructor() {
		this.factories = {};
		this.traits = {};
		this.adapterHandler = new AdapterHandler();
		this.sequenceHandler = new SequenceHandler();
	}

	getAdapter(factoryName?: string): Adapter {
		return this.adapterHandler.getAdapter(factoryName);
	}

	setAdapter(adapter: Adapter, factoryNames?: FactoryNames): Adapter {
		return this.adapterHandler.setAdapter(adapter, factoryNames);
	}

	define(block: Function): void {
		block.call(this, this);
	}

	getFactory(name: string, throws = true): Factory {
		const factory = this.factories[name];
		if (throws && !factory) {
			throw new Error(`${name} hasn't been defined yet`);
		}
		return factory;
	}

	registerFactory(factory: Factory): void {
		for (const name of factory.names()) {
			this.factories[name] = factory;
		}
	}

	factory(name: string, model: Function, rest?: FactoryOptions | Function): Factory;
	factory(name: string, model: Function, options?: FactoryOptions, block?: Function): Factory;
	factory(name: string, model: Function, ...rest: any[]): Factory {
		if (this.getFactory(name, false)) {
			throw new Error(`${name} is already defined`);
		}
		const factory = new Factory(this, name, model, ...rest);
		const proxy = new DefinitionProxy(factory);

		proxy.execute();
		this.registerFactory(factory);

		proxy.childFactories.forEach((child: any[]) => {
			const [childName, childModel, ...childRest] = child;
			const [childOptions, childBlock] = factoryOptionsParser(...childRest);
			childOptions.parent = childOptions.parent || name;
			this.factory(childName, childModel, childOptions, childBlock);
		});

		return factory;
	}

	getTrait(name: string, throws = true): Trait {
		const trait = this.traits[name];
		if (throws && !trait) {
			throw new Error(`${name} hasn't been defined yet`);
		}
		return trait;
	}

	registerTrait(trait: Trait): void {
		for (const name of trait.names()) {
			this.traits[name] = trait;
		}
	}

	trait(name: string, block?: Function): Trait {
		const trait = new Trait(name, this, block);
		this.registerTrait(trait);
		return trait;
	}

	attributesFor(name: string, ...traits: any[]): Record<string, any> {
		const traitsAndAttributes = buildTraitsAndAttributes(traits);
		const factory = this.getFactory(name);
		return factory.applyAttributes(traitsAndAttributes);
	}

	async build(name: string, ...traits: any[]): Promise<Record<string, any>> {
		const traitsAndAttributes = buildTraitsAndAttributes(traits);
		const adapter = this.getAdapter();
		const factory = this.getFactory(name);
		return factory.build(adapter, traitsAndAttributes);
	}

	async create(name: string, ...traits: any[]): Promise<Record<string, any>> {
		const traitsAndAttributes = buildTraitsAndAttributes(traits);
		const adapter = this.getAdapter();
		const factory = this.getFactory(name);
		return factory.create(adapter, traitsAndAttributes);
	}

	sequence(
		name: string,
		initial?: string | number | {aliases: string[]} | Function,
	): Sequence;

	sequence(
		name: string,
		initial?: string | number,
		options?: {aliases: string[]},
		callback?: Function,
	): Sequence;

	sequence(name: string, ...rest: any[]): Sequence {
		return this.sequenceHandler.registerSequence(name, ...rest);
	}

	resetSequences(): void {
		this.sequenceHandler.resetSequences();
		for (const [, factory] of Object.entries(this.factories)) {
			factory.sequenceHandler.resetSequences();
		}
	}

	findSequence(name: string): Sequence | undefined {
		return this.sequenceHandler.findSequence(name);
	}
}
