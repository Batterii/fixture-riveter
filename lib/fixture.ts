import {addMethodMissing} from "./method-missing";
import {Assembler} from "./assembler";
import {Attribute} from "./attributes/attribute";
import {AttributeAssigner} from "./attribute-assigner";
import {Definition} from "./definition";
import {Evaluator} from "./evaluator";
import {FixtureRiveter} from "./fixture-riveter";
import {NullFixture} from "./null-fixture";
import {fixtureOptionsParser} from "./fixture-options-parser";
import {Strategy} from "./strategies/strategy";
import {Trait} from "./trait";

import {isFunction} from "lodash";
import {Callback} from "./callback";

import {
	BlockFunction,
	FixtureRestArgs,
	FixtureOptions,
	ModelConstructor,
} from "./types";

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

	mapTraitToThis(t: Trait<T>): Trait<T> {
		t.fixture = this;
		return t;
	}

	getParentAttributes(): Attribute[] {
		return this.parentFixture().getAttributes();
	}

	getAttributes(): Attribute[] {
		this.compile();

		const attributesToKeep = this.getParentAttributes();

		if (!this.attributes || this.attributes.length === 0) {
			this.attributes = [
				this.getBaseTraits()
					.map((t) => this.mapTraitToThis(t))
					.map((t) => t.getAttributes()),
				this.declarationHandler.getAttributes(),
				this.getAdditionalTraits()
					.map((t) => this.mapTraitToThis(t))
					.map((t) => t.getAttributes()),
			].flat(2).filter(Boolean);
		}

		return attributesToKeep.concat(this.attributes);
	}

	getCallbacks(): Callback<T>[] {
		const globalCallbacks = this.fixtureRiveter.getCallbacks();
		const parentCallbacks = this.parentFixture().getCallbacks();
		const definedCallbacks = super.getCallbacks();

		return globalCallbacks.concat(parentCallbacks, definedCallbacks);
	}

	traitByName(name: string): Trait<T> {
		return this.traitsCache.get(name) ||
			this.parentFixture().traitByName(name) ||
			this.fixtureRiveter.getTrait(name);
	}

	async prepare(
		buildStrategy: Strategy,
		overrides: Record<string, any> = {},
	): Promise<Assembler<T>> {
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
		);

		return new Assembler<T>(attributeAssigner, this.getCallbacks());
	}
}
