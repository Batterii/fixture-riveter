import {Adapter} from "./adapters/adapter";
import {AdapterHandler, FixtureNames} from "./adapter-handler";
import {DefinitionProxy} from "./definition-proxy";
import {Fixture} from "./fixture";
import {
	blockFunction,
	FixtureOptions,
	fixtureOptionsParser,
} from "./fixture-options-parser";
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

import {
	isFunction,
	isPlainObject,
	last,
	cloneDeep,
} from "lodash";

export function extractAttributes(traitsAndOptions: any[]): Record<string, any> {
	const options = last(traitsAndOptions);
	if (isPlainObject(options)) {
		return traitsAndOptions.pop();
	}
	return {};
}

export class FixtureRiveter {
	factories: Record<string, Fixture>;
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

	getAdapter(fixtureName?: string): Adapter {
		return this.adapterHandler.getAdapter(fixtureName);
	}

	setAdapter(adapter: Adapter, fixtureNames?: FixtureNames): Adapter {
		return this.adapterHandler.setAdapter(adapter, fixtureNames);
	}

	getFixture(name: string, throws = true): Fixture {
		const fixture = this.factories[name];
		if (throws && !fixture) {
			throw new Error(`${name} hasn't been defined yet`);
		}
		return fixture;
	}

	registerFixture(fixture: Fixture): void {
		for (const name of fixture.names()) {
			this.factories[name] = fixture;
		}
	}

	fixture(name: string, model: Function, rest?: FixtureOptions | blockFunction): Fixture;

	fixture(
		name: string,
		model: Function,
		options?: FixtureOptions,
		block?: blockFunction,
	): Fixture;

	fixture(name: string, model: Function, ...rest: any[]): Fixture {
		if (this.getFixture(name, false)) {
			throw new Error(`${name} is already defined`);
		}
		const fixture = new Fixture(this, name, model, ...rest);
		const proxy = new DefinitionProxy(fixture);

		proxy.execute();
		this.registerFixture(fixture);

		proxy.childFactories.forEach((child: any[]) => {
			const [childName, childModel, ...childRest] = child;
			const [childOptions, childBlock] = fixtureOptionsParser(...childRest);
			childOptions.parent = childOptions.parent || name;
			this.fixture(childName, childModel, childOptions, childBlock);
		});

		return fixture;
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
		for (const [, fixture] of Object.entries(this.factories)) {
			fixture.sequenceHandler.resetSequences();
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
		let fixture = this.getFixture(name);

		fixture.compile();

		if (traits.length > 0) {
			fixture = fixture.copy();
			fixture.appendTraits(traits);
		}
		const adapter = this.getAdapter(name);
		const StrategyRiveter = this.strategyHandler.getStrategy(strategy);
		const buildStrategy = new StrategyRiveter(strategy, this, adapter);
		return fixture.run(buildStrategy, overrides);
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
			const instance = await this.run(name, strategy, cloneDeep(traits));
			// eslint-disable-next-line no-await-in-loop
			await fn(instance, idx);
			instances.push(instance);
		}
		return instances;
	}

	registerStrategy(strategyName: string, strategyClass: any): void {
		this.strategyHandler.registerStrategy(strategyName, strategyClass);
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
	/* eslint-disable */
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
