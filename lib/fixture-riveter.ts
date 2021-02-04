import {AdapterHandler} from "./adapter-handler";
import {Adapter} from "./adapters/adapter";
import {CallbackFunction, Callback} from "./callback";
import {CallbackHandler} from "./callback-handler";
import {DefinitionProxy} from "./definition-proxy";
import {Fixture} from "./fixture";
import {Sequence, SequenceCallback} from "./sequence";
import {SequenceHandler} from "./sequence-handler";
import {StrategyHandler} from "./strategy-handler";
import {Strategy} from "./strategies/strategy";
import {Trait} from "./trait";
import {fixtureOptionsParser} from "./fixture-options-parser";

import {
	Pojo,
	ModelConstructor,
	BlockFunction,
	FixtureRestArgs,
	FixtureName,
	FixtureOptions,
	ObjectionModelConstructor,
	Overrides,
} from "./types";

import {DefaultStrategyMethods} from "./strategies/default-strategy-methods";

import {
	isPlainObject,
	isString,
	last,
	cloneDeep,
} from "lodash";

export function extractOverrides(traitsAndOptions: any[]): Record<string, any> {
	const options = last(traitsAndOptions);
	if (isPlainObject(options)) {
		return traitsAndOptions.pop();
	}
	return {};
}

export function nameGuard<T>(fixtureName: FixtureName<T>): string {
	if (isString(fixtureName)) {
		return fixtureName;
	}
	if (fixtureName.tableName) {
		return fixtureName.tableName;
	}
	if (fixtureName.name) {
		return fixtureName.name;
	}
	throw new Error(`${fixtureName} isn't the right shape`);
}

export class FixtureRiveter implements DefaultStrategyMethods {
	fixtures: Map<string, Fixture<any>>;
	traits: Map<string, Trait<any>>;
	instances: [string, any][];
	adapterHandler: AdapterHandler;
	sequenceHandler: SequenceHandler;
	useParentStrategy: boolean;
	callbackHandler: CallbackHandler;
	strategyHandler: StrategyHandler;

	constructor() {
		this.fixtures = new Map();
		this.traits = new Map();
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

	setAdapter(adapter: Adapter, fixtureNames?: string | string[]): Adapter {
		return this.adapterHandler.setAdapter(adapter, fixtureNames);
	}

	getFixture<T = any>(name: string, throws = true): Fixture<T> | undefined {
		const fixture = this.fixtures.get(name);
		if (throws && !fixture) {
			throw new Error(`${name} hasn't been defined yet`);
		}
		return fixture;
	}

	registerFixture<T>(fixture: Fixture<T>): void {
		for (const name of fixture.names()) {
			if (this.fixtures.has(name)) {
				throw new Error(`Can't define ${name} fixture twice`);
			}
			this.fixtures.set(name, fixture);
		}
	}

	fixture<T>(
		fixtureClass: ObjectionModelConstructor<T>,
		options: FixtureOptions,
		block?: BlockFunction<T>,
	): Fixture<T>;

	fixture<T>(
		fixtureClass: ObjectionModelConstructor<T>,
		rest?: FixtureRestArgs<T>,
	): Fixture<T>;

	fixture<T>(
		name: string,
		model: ModelConstructor<T>,
		options: FixtureOptions,
		block?: BlockFunction<T>,
	): Fixture<T>;

	fixture<T>(
		name: string,
		model: ModelConstructor<T>,
		rest?: FixtureRestArgs<T>,
	): Fixture<T>;

	fixture<T>(...rest: any[]): Fixture<T> {
		let fixtureName: FixtureName<T>;
		let model: ModelConstructor<T> & {tableName?: string};

		if (isString(rest[0])) {
			fixtureName = rest.shift();
			model = rest.shift();
		} else {
			fixtureName = model = rest.shift();
		}

		const name = nameGuard<T>(fixtureName);
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
		const trait = this.traits.get(name);
		if (!trait) {
			throw new Error(`Trait ${name} hasn't been defined yet`);
		}
		return trait;
	}

	trait<T>(name: string, block: BlockFunction<T>): void {
		const trait = new Trait(name, this, block);
		this.traits.set(trait.name, trait);
	}

	sequence<C extends string | number | (() => Generator<any, any, any>)>(
		name: string,
		options?: C | string[] | SequenceCallback<number>,
	): Sequence<C>;

	sequence<C extends string | number | (() => Generator<any, any, any>)>(
		name: string,
		initial: C,
		aliasesOrCallback?: (
			| string[]
			| SequenceCallback<C extends (() => Generator<infer T, any, any>) ? T : C>
		),
	): Sequence<C>;

	sequence<C extends string | number | (() => Generator<any, any, any>)>(
		name: string,
		initialOrAliases: C | string[],
		callback?: SequenceCallback<C extends (() => Generator<infer T, any, any>) ? T : C>,
	): Sequence<C>;

	sequence<C extends string | number | (() => Generator<any, any, any>)>(
		name: string,
		initial: C,
		aliases: string[],
		callback?: SequenceCallback<C extends (() => Generator<infer T, any, any>) ? T : C>,
	): Sequence<C>;

	sequence(name: string, ...rest: any[]): Sequence<any> {
		return this.sequenceHandler.registerSequence(name, ...rest);
	}

	resetSequences(): void {
		this.sequenceHandler.resetSequences();
		for (const fixture of this.fixtures.values()) {
			fixture.sequenceHandler.resetSequences();
		}
	}

	findSequence(name: string): Sequence<any> | undefined {
		return this.sequenceHandler.findSequence(name);
	}

	generate(name: string): any | undefined {
		const sequence = this.findSequence(name);
		if (sequence !== undefined) {
			return sequence.next();
		}
	}

	async run<T = Pojo>(
		fixtureName: FixtureName<T> | FixtureName<Pojo>,
		strategyName: string | typeof Strategy,
		traitsOrOverride?: string[]|Overrides<T>,
	): Promise<T>;

	async run<T = Pojo>(
		fixtureName: FixtureName<T> | FixtureName<Pojo>,
		strategyName: string | typeof Strategy,
		traits: string[],
		overrides?: Overrides<T>,
	): Promise<T>;

	async run<T>(
		fixtureName: FixtureName<T> | FixtureName<Pojo>,
		strategyName: string | typeof Strategy,
		...traitsAndOverrides: any[]
	): Promise<T> {
		const name = nameGuard(fixtureName);
		const traits = traitsAndOverrides.flat(2);
		const overrides = extractOverrides(traits);
		let fixture = this.getFixture<T>(name);

		if (fixture !== undefined) {
			fixture.compile();

			if (traits.length > 0) {
				fixture = fixture.copy<Fixture<T>>();
				fixture.appendTraits(traits);
			}

			const adapter = this.getAdapter(name);
			const sName = nameGuard(strategyName as FixtureName<Strategy>);

			let StrategyConstructor: typeof strategyName;
			if (isString(strategyName)) {
				const strategy = this.strategyHandler.getStrategy(sName);
				if (strategy === undefined) {
					throw new Error(`Strategy ${sName} hasn't been defined`);
				} else {
					StrategyConstructor = strategy;
				}
			} else {
				StrategyConstructor = strategyName;
			}
			const strategy = new StrategyConstructor(sName, this, adapter);

			const assembler = await fixture.prepare(strategy, overrides);
			const instance = await strategy.result<T>(assembler, fixture.model);
			this.instances.push([name, instance]);
			return instance;
		}
		throw new Error(`Fixture ${name} hasn't been defined`);
	}

	async runList<T = Pojo>(
		name: FixtureName<T> | FixtureName<Pojo>,
		strategyName: string | typeof Strategy,
		count: number,
		traitsOrOverride?: string[] | Overrides<T>,
	): Promise<T[]>;

	async runList<T = Pojo>(
		name: FixtureName<T> | FixtureName<Pojo>,
		strategyName: string | typeof Strategy,
		count: number,
		traits: string[],
		overrides?: Overrides<T>,
	): Promise<T[]>;

	async runList<T = Pojo>(
		name: FixtureName<T> | FixtureName<Pojo>,
		strategyName: string | typeof Strategy,
		count: number,
		...traitsAndOverrides: any[]
	): Promise<T[]> {
		const strategy = nameGuard(strategyName as FixtureName<Strategy>);

		const instances: T[] = [];
		for (let idx = 0; idx < count; idx += 1) {
			const instance = await this.run<T>(name, strategy, ...cloneDeep(traitsAndOverrides));
			instances.push(instance);
		}
		return instances;
	}

	registerStrategy(strategyClass: typeof Strategy): void;
	registerStrategy(strategyName: string, strategyClass: typeof Strategy): void;

	registerStrategy(...rest: any[]): void {
		let name: string | FixtureName<Strategy>;
		let strategyClass: typeof Strategy;

		if (isString(rest[0])) {
			name = rest.shift();
			strategyClass = rest.shift();
		} else {
			name = strategyClass = rest.shift();
		}

		const strategyName = nameGuard(name);

		this.strategyHandler.registerStrategy(strategyName, strategyClass);
	}

	before<T>(name: string, block: CallbackFunction<T>): void;
	before<T>(name: string, name2: string, block: CallbackFunction<T>): void;
	before<T>(name: string, name2: string, name3: string, block: CallbackFunction<T>): void;
	before(...rest: any[]): void {
		this.callbackHandler.before(...rest);
	}

	after<T>(name: string, block: CallbackFunction<T>): void;
	after<T>(name: string, name2: string, block: CallbackFunction<T>): void;
	after<T>(name: string, name2: string, name3: string, block: CallbackFunction<T>): void;
	after(...rest: any[]): void {
		this.callbackHandler.after(...rest);
	}

	addCallback<T>(names: string[], block: CallbackFunction<T>): void {
		this.callbackHandler.addCallback(names, block);
	}

	getCallbacks<T>(): Callback<T>[] {
		return this.callbackHandler.callbacks;
	}

	async cleanUp(): Promise<void> {
		await Promise.all(this.instances.map(([name, instance]) => {
			const fixture = this.getFixture(name);
			const adapter = this.getAdapter(name);
			if (fixture && adapter) {
				return adapter.destroy(instance, fixture.model);
			}
			return undefined;
		}));
		this.instances = [];
	}

	/* eslint-disable */

	// Typescript sucks for dynamically defined methods lol
	// All of these will be overwritten on instantiation
	async attributesFor<T = Pojo>(..._args: any[]): Promise<T> { return undefined as any; }
	async attributesForList<T = Pojo>(..._args: any[]): Promise<T[]> { return undefined as any; }
	async attributesForPair<T = Pojo>(..._args: any[]): Promise<[T, T]> { return undefined as any; }

	async build<T = Pojo>(..._args: any[]): Promise<T> { return undefined as any; }
	async buildList<T = Pojo>(..._args: any[]): Promise<T[]> { return undefined as any; }
	async buildPair<T = Pojo>(..._args: any[]): Promise<[T, T]> { return undefined as any; }

	async create<T = Pojo>(..._args: any[]): Promise<T> { return undefined as any; }
	async createList<T = Pojo>(..._args: any[]): Promise<T[]> { return undefined as any; }
	async createPair<T = Pojo>(..._args: any[]): Promise<[T, T]> { return undefined as any; }
	/* eslint-enable */
}
