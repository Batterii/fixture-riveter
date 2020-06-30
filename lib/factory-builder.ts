import {Adapter} from "./adapters/adapter";
import {AdapterHandler, FactoryNames} from "./adapter-handler";
import {DefinitionProxy} from "./definition-proxy";
import {Factory} from "./factory";
import {
	blockFunction,
	FactoryOptions,
	factoryOptionsParser,
} from "./factory-options-parser";
import {
	Sequence,
	SequenceCallback,
} from "./sequences/sequence";
import {SequenceHandler} from "./sequence-handler";
import {Trait} from "./trait";
import {
	callbackFunction,
	Callback,
} from "./callback";
import {CallbackHandler} from "./callback-handler";
import {StrategyHandler} from "./strategy-handler";

import {isFunction, isPlainObject, last} from "lodash";

export function extractAttributes(traitsAndOptions: any[]): Record<string, any> {
	const options = last(traitsAndOptions);
	if (isPlainObject(options)) {
		return traitsAndOptions.pop();
	}
	return {};
}

export class FactoryBuilder {
	factories: Record<string, Factory>;
	traits: Record<string, Trait>;
	adapterHandler: any;
	sequenceHandler: SequenceHandler;
	useParentStrategy: boolean;
	callbackHandler: CallbackHandler;
	strategyHandler: StrategyHandler;

	constructor() {
		this.factories = {};
		this.traits = {};
		this.adapterHandler = new AdapterHandler();
		this.sequenceHandler = new SequenceHandler();
		this.callbackHandler = new CallbackHandler(this);
		this.strategyHandler = new StrategyHandler(this);

		this.strategyHandler.registerDefaultStategies();
		this.useParentStrategy = true;
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

	factory(name: string, model: Function, rest?: FactoryOptions | blockFunction): Factory;

	factory(
		name: string,
		model: Function,
		options?: FactoryOptions,
		block?: blockFunction,
	): Factory;

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

	getTrait(name: string): Trait {
		const trait = this.traits[name];
		if (!trait) {
			throw new Error(`Trait ${name} hasn't been defined yet`);
		}
		return trait;
	}

	registerTrait(trait: Trait): void {
		for (const name of trait.names()) {
			this.traits[name] = trait;
		}
	}

	trait(name: string, block?: blockFunction): Trait {
		const trait = new Trait(name, this, block);
		this.registerTrait(trait);
		return trait;
	}

	sequence(
		name: string,
		initial?: string | number | {aliases: string[]} | SequenceCallback,
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

	generate(name: string): any {
		const sequence = this.findSequence(name);
		if (sequence) {
			return sequence.next();
		}
	}

	async run(name: string, strategy: string, traits: any[]): Promise<Record<string, any>> {
		const overrides = extractAttributes(traits);
		let factory = this.getFactory(name);

		factory.compile();

		if (traits.length > 0) {
			factory = factory.copy();
			factory.appendTraits(traits);
		}
		const adapter = this.getAdapter();
		const StrategyBuilder = this.strategyHandler.getStrategy(strategy);
		const buildStrategy = new StrategyBuilder(this, adapter);
		return factory.run(buildStrategy, overrides);
	}

	async generateList(
		name: string,
		strategy: string,
		count: number,
		traits: any[],
	): Promise<Record<string, any>[]> {
		let fn = (instance: any, index: number): any => [index, instance];
		if (isFunction(last(traits))) {
			fn = traits.pop();
		}
		const instances: any[] = [];
		for (let idx = 0; idx < count; idx += 1) {
			// eslint-disable-next-line no-await-in-loop
			const instance = await this.run(name, strategy, traits);
			// eslint-disable-next-line no-await-in-loop
			await fn(instance, idx);
			instances.push(instance);
		}
		return instances;
	}

	before(name: string, block: callbackFunction): void;
	before(name: string, ...rest: any[]): void;
	before(...rest: any[]): void {
		this.callbackHandler.before(...rest);
	}

	after(name: string, block: callbackFunction): void;
	after(name: string, ...rest: any[]): void;
	after(...rest: any[]): void {
		this.callbackHandler.after(...rest);
	}

	addCallback(names: string[], block: callbackFunction): void {
		this.callbackHandler.addCallback(names, block);
	}

	getCallbacks(): Callback[] {
		return this.callbackHandler.callbacks;
	}

	// Typescript sucks for dynamically defined methods lol
	// All of these will be overwritten on instantiation
	attributesFor(...rest): any {}
	attributesForList(...rest): any {}
	attributesForPair(...rest): any {}
	build(...rest): any {}
	buildList(...rest): any {}
	buildPair(...rest): any {}
	create(...rest): any {}
	createList(...rest): any {}
	createPair(...rest): any {}
}
