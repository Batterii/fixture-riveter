import {Attribute} from "./attribute";
import {CallbackHandler} from "./callback-handler";
import {Definition} from "./definition";
import {Evaluator} from "./evaluator";
import {FactoryBuilder} from "./factory-builder";
import {NullFactory} from "./null-factory";
import {
	blockFunction,
	FactoryOptions,
	factoryOptionsParser,
} from "./factory-options-parser";
import {Strategy} from "./strategies/strategy";

import {isFunction} from "lodash";
import {Callback} from "./callback";

export interface ExtraAttributes {
	traits?: string[];
	attrs?: Record<string, any>;
}

export class Factory extends Definition {
	factoryBuilder: FactoryBuilder;
	model: any;
	parent?: string;

	constructor(
		factoryBuilder: FactoryBuilder,
		name: string,
		model: any,
		rest?: FactoryOptions | blockFunction,
	);

	constructor(
		factoryBuilder: FactoryBuilder,
		name: string,
		model: any,
		options?: FactoryOptions,
		block?: blockFunction,
	);

	constructor(
		factoryBuilder: FactoryBuilder,
		name: string,
		model: any,
		...rest: any[]
	) {
		super(name, factoryBuilder);

		this.model = model;

		const [options, block] = factoryOptionsParser(...rest);

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

	parentFactory(): Factory {
		if (this.parent) {
			return this.factoryBuilder.getFactory(this.parent, false);
		}
		return new NullFactory(this.factoryBuilder) as Factory;
	}

	compile(): void {
		if (!this.compiled) {
			const parentFactory = this.parentFactory();
			parentFactory.compile();
			for (const definedTrait of parentFactory.definedTraits) {
				this.defineTrait(definedTrait);
			}
			super.compile();
			this.compiled = true;
		}
	}

	getParentAttributes(): Attribute[] {
		const attributeNames = this.attributeNames();

		return this.parentFactory()
			.getAttributes()
			.filter((attribute) => !attributeNames.includes(attribute.name));
	}

	getAttributes(): Attribute[] {
		this.compile();

		// Need to generate child attributes before parent attributes
		const definitionAttributes = super.getAttributes();
		const attributesToKeep = this.getParentAttributes();

		return attributesToKeep.concat(definitionAttributes);
	}

	attributesToApply(overrides: Record<string, any>): Attribute[] {
		return this.getAttributes()
			// This will skip any attribute passed in by the caller
			.filter((attribute) => {
				return !Object.prototype.hasOwnProperty.call(overrides, attribute.name);
			});
	}

	getCallbacks(): Callback[] {
		const globalCallbacks = this.factoryBuilder.getCallbacks();
		const parentCallbacks = this.parentFactory().getCallbacks();
		const definedCallbacks = super.getCallbacks();

		return Array.prototype.concat(globalCallbacks, parentCallbacks, definedCallbacks);
	}

	async run(buildStrategy: Strategy, overrides: Record<string, any> = {}): Promise<any> {
		const attributesToApply = this.attributesToApply(overrides);

		const evaluator = new Evaluator(
			this.factoryBuilder,
			buildStrategy,
			attributesToApply,
			overrides,
		);

		this.callbackHandler.setEvaluator(evaluator);
		this.callbackHandler.setCallbacks(this.getCallbacks());

		return buildStrategy.result(this.callbackHandler, this.model);
	}
}
