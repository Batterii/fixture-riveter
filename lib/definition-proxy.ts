import {addMethodMissing} from "./method-missing";
import {Declaration} from "./declarations/declaration";
import {AssociationDeclaration} from "./declarations/association-declaration";
import {DynamicDeclaration} from "./declarations/dynamic-declaration";
import {ImplicitDeclaration} from "./declarations/implicit-declaration";
import {Trait} from "./trait";
import {Definition} from "./definition";
import {Fixture} from "./fixture";
import {
	AttrFunction,
	BlockFunction,
	FixtureArgs,
	FixtureOptions,
} from "./fixture-options-parser";
import {callbackFunction} from "./callback";
import {FixtureRiveter} from "./fixture-riveter";
import {
	Sequence,
	SequenceCallback,
} from "./sequences/sequence";
import {SequenceHandler} from "./sequence-handler";

import {isFunction, last} from "lodash";

export class DefinitionProxy<T> {
	definition: Definition<T>;
	childFixtures: [string, ModelConstructor<T>, ...any][];
	ignore: boolean;

	constructor(definition: Definition<T>, ignore = false) {
		this.definition = definition;
		this.childFixtures = [];
		this.ignore = ignore;
	}

	execute(): void {
		if (this.definition.block) {
			const wrappedThis = addMethodMissing(this);
			this.definition.block.call(wrappedThis, wrappedThis);
		}
	}

	get fixtureRiveter(): FixtureRiveter {
		return this.definition.fixtureRiveter;
	}

	get sequenceHandler(): SequenceHandler {
		return this.definition.sequenceHandler;
	}

	methodMissing(name: string, ...rest: any[]): void {
		this.attr(name, ...rest);
	}

	attr(name: string, rest?: FixtureOptions | AttrFunction<T>): void;

	attr(name: string, ...rest: any[]): void {
		let declaration: Declaration;

		if (rest.length > 0) {
			const block = last(rest);
			if (isFunction(block)) {
				declaration = new DynamicDeclaration(name, this.ignore, block);
			} else {
				declaration = new AssociationDeclaration(name, rest);
			}
		} else {
			declaration = new ImplicitDeclaration(
				name,
				this.ignore,
				this.fixtureRiveter,
				this.definition as Fixture<T>,
			);
		}
		this.definition.declareAttribute(declaration);
	}

	fixture(
		name: string,
		model: ModelConstructor<T>,
		options: FixtureOptions,
		block?: BlockFunction<T>,
	): void;

	fixture(
		name: string,
		model: ModelConstructor<T>,
		rest?: FixtureArgs<T>,
	): void;

	fixture(name: string, model: ModelConstructor<T>, ...rest: any[]): void {
		this.childFixtures.push([name, model, ...rest]);
	}

	association(name: string, ...rest: any[]): void {
		const association = new AssociationDeclaration(name, rest);
		this.definition.declareAttribute(association);
	}

	sequence(
		name: string,
		initial?: string | number | {aliases: string[]} | SequenceCallback,
	): Sequence;

	sequence(name: string, ...rest: any[]): Sequence {
		const sequence = this.sequenceHandler.registerSequence(name, ...rest);
		this.attr(name, () => sequence.next());
		return sequence;
	}

	trait(name: string, block: BlockFunction<T>): void {
		const newTrait = new Trait(name, this.fixtureRiveter, block);
		this.definition.defineTrait(newTrait);
	}

	transient(block: BlockFunction<T>): void {
		const proxy = new DefinitionProxy(this.definition, true);
		block(addMethodMissing(proxy));
	}

	before(name: string, name2: string, name3: string, block: callbackFunction): void;
	before(name: string, name2: string, block: callbackFunction): void;
	before(name: string, block: callbackFunction): void;
	before(...rest: any[]): void {
		this.definition.before(...rest);
	}

	after(name: string, name2: string, name3: string, block: callbackFunction): void;
	after(name: string, name2: string, block: callbackFunction): void;
	after(name: string, block: callbackFunction): void;
	after(name: string, ...block: any[]): void;
	after(...rest: any[]): void {
		this.definition.after(...rest);
	}
}

interface ModelConstructor<T> {
	new(): T
}
