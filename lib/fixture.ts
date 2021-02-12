import {addMethodMissing} from "./method-missing";
import {Assembler} from "./assembler";
import {Attribute} from "./attributes/attribute";
import {AttributeAssigner} from "./attribute-assigner";
import {Callback} from "./callback";
import {Definition} from "./definition";
import {Evaluator} from "./evaluator";
import {FixtureRiveter} from "./fixture-riveter";
import {NullFixture} from "./null-fixture";
import {fixtureOptionsParser} from "./fixture-options-parser";
import {Strategy} from "./strategies/strategy";
import {Trait} from "./trait";

import {isFunction, last} from "lodash";

import {
	BlockFunction,
	FixtureRestArgs,
	FixtureOptions,
	ModelConstructor,
} from "./types";
import { Adapter } from "./adapters/adapter";

export class Fixture<T> extends Definition<T> {
	fixtureRiveter: FixtureRiveter;
	model: ModelConstructor<T>;
	parent?: string;

	constructor(
		fixtureRiveter: FixtureRiveter,
		name: string,
		model: ModelConstructor<T>,
		options?: FixtureOptions,
		block?: BlockFunction<T>,
	);

	constructor(
		fixtureRiveter: FixtureRiveter,
		name: string,
		model: ModelConstructor<T>,
		rest?: FixtureRestArgs<T>,
	);

	constructor(
		fixtureRiveter: FixtureRiveter,
		name: string,
		model: ModelConstructor<T>,
		...rest: any[]
	) {
		super(name, fixtureRiveter);

		this.model = model;

		const [options, block] = fixtureOptionsParser(...rest);

		if (options.aliases) {
			this.aliases = options.aliases;
		}
		if (options.traits) {
			this.baseTraits = options.traits;
		}
		if (options.parent) {
			this.parent = options.parent;
		}

		if (block && isFunction(block)) {
			this.block = block;
		}
	}

	parentFixture(): Fixture<T> {
		if (this.parent) {
			const fixture = this.fixtureRiveter.getFixture(this.parent, false);
			if (fixture) {
				return fixture;
			}
		}
		return new NullFixture(this.fixtureRiveter) as Fixture<T>;
	}

	compile(): void {
		if (!this.compiled) {
			this.parentFixture().compile();
			super.compile();
			this.compiled = true;
		}
	}

	traitByName(name: string): Trait<T> {
		return this.traitsCache.get(name) ||
			this.parentFixture().traitByName(name) ||
			this.fixtureRiveter.getTrait(name);
	}

	mapTraitToThis(t: Trait<T>): Trait<T> {
		t.setFixture(this);
		return t;
	}

	getBaseTraits(): Trait<T>[] {
		return super.getBaseTraits().map((t) => this.mapTraitToThis(t));
	}

	getAdditionalTraits(): Trait<T>[] {
		return super.getAdditionalTraits().map((t) => this.mapTraitToThis(t));
	}

	getAttributes(): Attribute[] {
		const attributes = super.getAttributes();
		const parentAttributes = this.parentFixture().getAttributes();
		return parentAttributes.concat(attributes);
	}

	getCallbacks(): Callback<T>[] {
		const callbacks = super.getCallbacks();
		const parentCallbacks = this.parentFixture().getCallbacks();
		return parentCallbacks.concat(callbacks);
	}

	toBuild(): <U = T>(Model: any) => U {
		return super.toBuild() || this.parentFixture().toBuild();
	}

	async run(buildStrategy: Strategy, overrides: Record<string, any> = {}): Promise<T> {
		this.compile();

		const evaluator = addMethodMissing(
			new Evaluator(
				this.fixtureRiveter,
				buildStrategy,
				this.getAttributes(),
				overrides,
			),
		);

		const attributeAssigner = new AttributeAssigner<T>(
			this.fixtureRiveter,
			this.name,
			this.model,
			evaluator,
			this.buildAdapter(),
		);

		const assembler = new Assembler<T>(attributeAssigner, this.getCallbacks());
		return buildStrategy.result(assembler, this.model) as unknown as T;
	}
}
