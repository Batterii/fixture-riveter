// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

/* eslint-disable max-classes-per-file */

import {Adapter} from "./adapters/adapter";
import {AdapterMethodBuilder} from "./adapter-method-builder";
import {addMethodMissing} from "./method-missing";
import {Assembler} from "./assembler";
import {Attribute} from "./attributes/attribute";
import {AttributeAssigner} from "./attribute-assigner";
import {Hook} from "./hook";
import {Definition} from "./definition";
import {Evaluator} from "./evaluator";
import {FixtureRiveter} from "./fixture-riveter";
import {NullFixture} from "./null-fixture";
import {fixtureOptionsParser} from "./fixture-options-parser";
import {Strategy} from "./strategies/strategy";
import {Trait} from "./trait";

import {isFunction} from "lodash";

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

	_adapterMethodsClass?: typeof AdapterMethodBuilder;
	_adapterMethodsInstance?: any;

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
			this.setAdapterMethods();
			this.compiled = true;
		}
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
		this.compile();
		const parentAttributes = this.parentFixture().getAttributes();
		const definedAttributes = super.getAttributes();
		return parentAttributes.concat(definedAttributes);
	}

	getHooks(): Hook<T>[] {
		this.compile();
		const parentHooks = this.parentFixture().getHooks();
		const definedHooks = super.getHooks();
		return parentHooks.concat(definedHooks);
	}

	traitByName(name: string): Trait<T> {
		return this.traitsCache.get(name) ||
			this.parentFixture().traitByName(name) ||
			this.fixtureRiveter.getTrait(name);
	}

	adapterMethodsClass(): typeof AdapterMethodBuilder {
		if (!this._adapterMethodsClass) {
			this._adapterMethodsClass = class extends this.parentFixture().adapterMethodsClass() {};
		}
		return this._adapterMethodsClass;
	}

	setAdapterMethods(): void {
		this.adapterMethodsClass().setAdapterMethods(this);
	}

	adapterMethodsInstance(): Adapter {
		if (!this._adapterMethodsInstance) {
			const AdapterMethodsClass = this.adapterMethodsClass();
			this._adapterMethodsInstance = new AdapterMethodsClass(this.fixtureRiveter, this.name);
		}
		return this._adapterMethodsInstance;
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

		const adapter = this.adapterMethodsInstance();

		const attributeAssigner = new AttributeAssigner<T>(
			this.fixtureRiveter,
			this.name,
			this.model,
			evaluator,
			adapter,
		);

		const assembler = new Assembler<T>(attributeAssigner, this.getHooks(), adapter);

		return buildStrategy.result(assembler, this.model) as unknown as T;
	}

	copy<C extends Fixture<T>>(): C {
		const copy: C = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
		copy.compiled = false;
		copy._adapterMethodsClass = undefined;
		copy._adapterMethodsInstance = undefined;
		return copy;
	}
}
