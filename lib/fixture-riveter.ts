import {Adapter} from "./adapters/adapter";
import {AdapterHandler, FixtureNames} from "./adapter-handler";
import {DefinitionProxy} from "./definition-proxy";
import {Fixture} from "./fixture";
import {
	BlockFunction,
	FixtureArgs,
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
	isPlainObject,
	isString,
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

export type FixtureName = string | {tableName: string};
export function nameGuard(fixtureName: FixtureName): string {
	if (isString(fixtureName)) {
		return fixtureName;
	}
	if (fixtureName.tableName) {
		return fixtureName.tableName;
	}
	throw new Error(`${fixtureName} isn't the right shape`);
}

export class FixtureRiveter {
	fixtures: Record<string, Fixture<any>>;
	traits: Record<string, Trait<any>>;
	instances: [string, any][];
	adapterHandler: any;
	sequenceHandler: SequenceHandler;
	useParentStrategy: boolean;
	callbackHandler: CallbackHandler;
	strategyHandler: StrategyHandler;

	constructor() {
		this.fixtures = {};
		this.traits = {};
		this.instances = [];
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

	getFixture(name: string, throws = true): Fixture<any> {
		const fixture = this.fixtures[name];
		if (throws && !fixture) {
			throw new Error(`${name} hasn't been defined yet`);
		}
		return fixture;
	}

	registerFixture<T>(fixture: Fixture<T>): void {
		for (const name of fixture.names()) {
			this.fixtures[name] = fixture;
		}
	}

	fixture<T>(
		name: FixtureName,
		model: ModelConstructor<T>,
		options: FixtureOptions,
		block?: BlockFunction<T>,
	): Fixture<T>;

	fixture<T>(
		name: FixtureName,
		model: ModelConstructor<T>,
		rest?: FixtureArgs<T>,
	): Fixture<T>;

	fixture<T>(fixtureName: FixtureName, model: ModelConstructor<T>, ...rest: any[]): Fixture<T> {
		const name = nameGuard(fixtureName);
		if (this.getFixture(name, false)) {
			throw new Error(`${name} is already defined`);
		}

		const fixture = new Fixture(this, name, model, ...rest);
		const proxy = new DefinitionProxy<T>(fixture);

		proxy.execute();
		this.registerFixture(fixture);

		proxy.childFixtures.forEach((child: any[]) => {
			const [childName, childModel, ...childRest] = child;
			const [childOptions, childBlock] = fixtureOptionsParser(...childRest);
			childOptions.parent = childOptions.parent || name;
			this.fixture(childName, childModel, childOptions, childBlock);
		});

		return fixture;
	}

	getTrait<T>(name: string): Trait<T> {
		const trait = this.traits[name];
		if (!trait) {
			throw new Error(`Trait ${name} hasn't been defined yet`);
		}
		return trait;
	}

	trait<T>(name: string, block: BlockFunction<T>): void {
		const trait = new Trait(name, this, block);
		this.traits[trait.name] = trait;
	}

	sequence(
		name: FixtureName,
		initial?: string | number | {aliases: string[]} | SequenceCallback,
	): Sequence;

	sequence(
		name: FixtureName,
		initial?: string | number,
		options?: {aliases: string[]},
		callback?: SequenceCallback,
	): Sequence;

	sequence(name: string, ...rest: any[]): Sequence {
		return this.sequenceHandler.registerSequence(name, ...rest);
	}

	resetSequences(): void {
		this.sequenceHandler.resetSequences();
		for (const [, fixture] of Object.entries(this.fixtures)) {
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

	async run<T = Instance>(
		fixtureName: FixtureName,
		strategy: string,
		traits: any[],
	): Promise<T> {
		const name = nameGuard(fixtureName);
		const overrides = extractAttributes(traits);
		let fixture = this.getFixture(name);

		fixture.compile();

		traits = traits.flat(2);
		if (traits.length > 0) {
			fixture = fixture.copy();
			fixture.appendTraits(traits);
		}
		const adapter = this.getAdapter(name);
		const StrategyRiveter = this.strategyHandler.getStrategy(strategy);
		const buildStrategy = new StrategyRiveter(strategy, this, adapter);
		const instance = await fixture.run(buildStrategy, overrides);
		this.instances.push([name, instance]);
		return instance;
	}

	async runList<T = Instance>(
		name: FixtureName,
		strategy: string,
		count: number,
		traits: any[],
	): Promise<List<T>> {
		const instances: T[] = [];
		for (let idx = 0; idx < count; idx += 1) {
			// eslint-disable-next-line no-await-in-loop
			const instance = await this.run<T>(name, strategy, cloneDeep(traits));
			instances.push(instance);
		}
		return instances;
	}

	registerStrategy(strategyName: string, strategyClass: any): void {
		this.strategyHandler.registerStrategy(strategyName, strategyClass);
	}

	before<T>(name: string, block?: callbackFunction<T>): void;
	before<T>(name: string, name2: string, block: callbackFunction<T>): void;
	before<T>(name: string, name2: string, name3: string, block: callbackFunction<T>): void;
	before(...rest: any[]): void {
		this.callbackHandler.before(...rest);
	}

	after<T>(name: string, block?: callbackFunction<T>): void;
	after<T>(name: string, name2: string, block: callbackFunction<T>): void;
	after<T>(name: string, name2: string, name3: string, block: callbackFunction<T>): void;
	after(...rest: any[]): void {
		this.callbackHandler.after(...rest);
	}

	addCallback<T>(names: string[], block: callbackFunction<T>): void {
		this.callbackHandler.addCallback(names, block);
	}

	getCallbacks<T>(): Callback<T>[] {
		return this.callbackHandler.callbacks;
	}

	async cleanUp(): Promise<void> {
		for (const [name, instance] of this.instances) {
			const fixture = this.getFixture(name);
			const adapter = this.getAdapter(name);
			// eslint-disable-next-line no-await-in-loop
			await adapter.destroy(instance, fixture.model);
		}
		this.instances = [];
	}

	/* eslint-disable */

	// Typescript sucks for dynamically defined methods lol
	// All of these will be overwritten on instantiation
	async attributesFor<T = Instance>(
		name: FixtureName,
		traits?: string[],
		overrides?: Override<T>,
	): Promise<T>;

	async attributesFor<T = Instance>(
		name: FixtureName,
		traits?: string[]|Override<T>,
	): Promise<T>;

	async attributesFor<T>(..._args: any[]): Promise<T> {
		return undefined as any;
	}

	async attributesForList<T = Instance>(
		name: FixtureName,
		count: number,
		traits?: string[],
		overrides?: Override<T>,
	): Promise<List<T>>;

	async attributesForList<T = Instance>(
		name: FixtureName,
		count: number,
		traits?: string[]|Override<T>,
	): Promise<List<T>>;

	async attributesForList<T>(..._args: any[]): Promise<List<T>> {
		return undefined as any;
	}

	async attributesForPair<T = Instance>(
		name: FixtureName,
		traits?: string[],
		overrides?: Override<T>,
	): Promise<Pair<T>>;

	async attributesForPair<T = Instance>(
		name: FixtureName,
		traits?: string[]|Override<T>,
	): Promise<Pair<T>>;

	async attributesForPair<T>(..._args: any[]): Promise<Pair<T>> {
		return undefined as any;
	}

	async build<T = Instance>(
		name: FixtureName,
		traits?: string[]|Override<T>,
	): Promise<T>;

	async build<T = Instance>(
		name: FixtureName,
		traits?: string[],
		overrides?: Override<T>,
	): Promise<T>;

	async build<T = Instance>(..._args: any[]): Promise<T> {
		return undefined as any;
	}

	async buildList<T = Instance>(
		name: FixtureName,
		count: number,
		traits?: string[],
		overrides?: Override<T>,
	): Promise<List<T>>;

	async buildList<T = Instance>(
		name: FixtureName,
		count: number,
		traits?: string[]|Override<T>,
	): Promise<List<T>>;

	async buildList<T = Instance>(..._args: any[]): Promise<List<T>> {
		return undefined as any;
	}

	async buildPair<T = Instance>(
		name: FixtureName,
		traits?: string[],
		overrides?: Override<T>,
	): Promise<Pair<T>>;

	async buildPair<T = Instance>(
		name: FixtureName,
		traits?: string[]|Override<T>,
	): Promise<Pair<T>>;

	async buildPair<T = Instance>(..._args: any[]): Promise<Pair<T>> {
		return undefined as any;
	}

	async create<T = Instance>(
		name: FixtureName,
		traits?: string[],
		overrides?: Override<T>,
	): Promise<T>;

	async create<T = Instance>(
		name: FixtureName,
		traits?: string[]|Override<T>,
	): Promise<T>;

	async create<T = Instance>(..._args: any[]): Promise<T> {
		return undefined as any;
	}

	async createList<T = Instance>(
		name: FixtureName,
		count: number,
		traits?: string[],
		overrides?: Override<T>,
	): Promise<List<T>>;

	async createList<T = Instance>(
		name: FixtureName,
		count: number,
		traits?: string[]|Override<T>,
	): Promise<List<T>>;

	async createList<T = Instance>(..._args: any[]): Promise<List<T>> {
		return undefined as any;
	}

	async createPair<T = Instance>(
		name: FixtureName,
		traits?: string[],
		overrides?: Override<T>,
	): Promise<Pair<T>>;

	async createPair<T = Instance>(
		name: FixtureName,
		traits?: string[]|Override<T>,
	): Promise<Pair<T>>;

	async createPair<T = Instance>(..._args: any[]): Promise<Pair<T>> {
		return undefined as any;
	}
	/* eslint-enable */
}

export type Instance = Record<string, any>;

type Pair<T> = [T, T];
type List<T> = T[];

type Override<T> = Partial<T extends Instance ? T : Instance>;

export interface ModelConstructor<T> {
	new(): T;
}
