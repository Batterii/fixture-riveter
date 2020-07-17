import {addMethodMissing} from "./method-missing";
import {Assembler} from "./assembler";
import {Attribute} from "./attributes/attribute";
import {AttributeAssigner} from "./attribute-assigner";
import {Definition} from "./definition";
import {Evaluator} from "./evaluator";
import {FixtureRiveter} from "./fixture-riveter";
import {NullFixture} from "./null-fixture";
import {
	blockFunction,
	FixtureOptions,
	fixtureOptionsParser,
} from "./fixture-options-parser";
import {Strategy} from "./strategies/strategy";
import {Trait} from "./trait";

import {isFunction} from "lodash";
import {Callback} from "./callback";

export interface ExtraAttributes {
	traits?: string[];
	attrs?: Record<string, any>;
}

export class Fixture extends Definition {
	fixtureRiveter: FixtureRiveter;
	model: any;
	parent?: string;

	constructor(
		fixtureRiveter: FixtureRiveter,
		name: string,
		model: any,
		rest?: FixtureOptions | blockFunction,
	);

	constructor(
		fixtureRiveter: FixtureRiveter,
		name: string,
		model: any,
		options?: FixtureOptions,
		block?: blockFunction,
	);

	constructor(
		fixtureRiveter: FixtureRiveter,
		name: string,
		model: any,
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

	parentFixture(): Fixture {
		if (this.parent) {
			return this.fixtureRiveter.getFixture(this.parent, false);
		}
		return new NullFixture(this.fixtureRiveter) as Fixture;
	}

	compile(): void {
		if (!this.compiled) {
			this.parentFixture().compile();
			super.compile();
			this.compiled = true;
		}
	}

	mapTraitToThis(t: Trait): Trait {
		t.fixture = this;
		return t;
	}

	getAttributes(): Attribute[] {
		this.compile();

		const attributesToKeep = this.parentFixture().getAttributes();

		if (!this.attributes || this.attributes.length === 0) {
			this.attributes = [
				this.getBaseTraits()
					.map((t) => this.mapTraitToThis(t))
					.map((t) => t.getAttributes()),
				this.declarationHandler.getAttributes(),
				this.getAdditionalTraits()
					.map((t) => this.mapTraitToThis(t))
					.map((t) => t.getAttributes()),
			].flat(Infinity).filter(Boolean);
		}

		return attributesToKeep.concat(this.attributes);
	}

	getCallbacks(): Callback[] {
		const globalCallbacks = this.fixtureRiveter.getCallbacks();
		const parentCallbacks = this.parentFixture().getCallbacks();
		const definedCallbacks = super.getCallbacks();

		return globalCallbacks.concat(parentCallbacks, definedCallbacks);
	}

	traitByName(name: string): Trait {
		return this.traits[name] ||
			this.parentFixture().traitByName(name) ||
			this.fixtureRiveter.getTrait(name);
	}

	async run(buildStrategy: Strategy, overrides: Record<string, any> = {}): Promise<any> {
		const evaluator = addMethodMissing(
			new Evaluator(
				this.fixtureRiveter,
				buildStrategy,
				this.getAttributes(),
				overrides,
			),
		);

		const attributeAssigner = new AttributeAssigner(
			this.fixtureRiveter,
			this.name,
			this.model,
			evaluator,
		);

		const assembler = new Assembler(attributeAssigner, this.getCallbacks());

		return buildStrategy.result(assembler, this.model);
	}
}
