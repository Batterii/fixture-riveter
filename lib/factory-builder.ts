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
import {Strategy} from "./strategies/strategy";
import {AttributesForStrategy} from "./strategies/attributes-for-strategy";
import {BuildStrategy} from "./strategies/build-strategy";
import {CreateStrategy} from "./strategies/create-strategy";
import {NullStrategy} from "./strategies/null-strategy";
import {Trait} from "./trait";
import {
	callbackFunction,
	Callback,
} from "./callback";
import {CallbackHandler} from "./callback-handler";

import {isFunction, isPlainObject, last} from "lodash";

export function extractAttributes(traitsAndOptions: any[]): Record<string, any> {
	const options = last(traitsAndOptions);
	if (isPlainObject(options)) {
		return traitsAndOptions.pop();
	}
	return {};
}

export function strategyCalculator(
	factoryBuilder: FactoryBuilder,
	buildStrategy: string,
	adapter: Adapter,
): Strategy {
	switch (buildStrategy) {
		case "attributesFor":
			return new AttributesForStrategy(factoryBuilder, adapter);
		case "build":
			return new BuildStrategy(factoryBuilder, adapter);
		case "create":
			return new CreateStrategy(factoryBuilder, adapter);
		case "null":
			return new NullStrategy(factoryBuilder, adapter);
		default:
			throw new Error("Choose a better strategy");
	}
}

export class FactoryBuilder {
	factories: Record<string, Factory>;
	traits: Record<string, Trait>;
	adapterHandler: any;
	sequenceHandler: SequenceHandler;
	useParentStrategy: boolean;
	callbackHandler: CallbackHandler;

	constructor() {
		this.factories = {};
		this.traits = {};
		this.adapterHandler = new AdapterHandler();
		this.sequenceHandler = new SequenceHandler();
		this.callbackHandler = new CallbackHandler(this);
		this.useParentStrategy = true;
	}

	getAdapter(factoryName?: string): Adapter {
		return this.adapterHandler.getAdapter(factoryName);
	}

	setAdapter(adapter: Adapter, factoryNames?: FactoryNames): Adapter {
		return this.adapterHandler.setAdapter(adapter, factoryNames);
	}

	define(block: Function): void {
		block(this);
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
		if (traits.length > 0) {
			factory = factory.copy();
			factory.appendTraits(traits);
		}
		const adapter = this.getAdapter();
		const buildStrategy = strategyCalculator(this, strategy, adapter);
		return factory.run(buildStrategy, overrides);
	}

	async attributesFor(name: string, ...traits: any[]): Promise<Record<string, any>> {
		return this.run(name, "attributesFor", traits);
	}

	async build(name: string, ...traits: any[]): Promise<Record<string, any>> {
		return this.run(name, "build", traits);
	}

	async create(name: string, ...traits: any[]): Promise<Record<string, any>> {
		return this.run(name, "create", traits);
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

	async attributesForList(
		name: string,
		count: number,
		...traits: any[]
	): Promise<Record<string, any>[]> {
		return this.generateList(name, "attributesFor", count, traits);
	}

	async buildList(
		name: string,
		count: number,
		...traits: any[]
	): Promise<Record<string, any>[]> {
		return this.generateList(name, "build", count, traits);
	}

	async createList(
		name: string,
		count: number,
		...traits: any[]
	): Promise<Record<string, any>[]> {
		return this.generateList(name, "create", count, traits);
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
}
