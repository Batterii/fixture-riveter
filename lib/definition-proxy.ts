import {addMethodMissing} from "./method-missing";
import {Declaration} from "./declarations/declaration";
import {AssociationDeclaration} from "./declarations/association-declaration";
import {DynamicDeclaration} from "./declarations/dynamic-declaration";
import {ImplicitDeclaration} from "./declarations/implicit-declaration";
import {Trait} from "./trait";
import {Definition} from "./definition";
import {Fixture} from "./fixture";
import {
	blockFunction,
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

export class DefinitionProxy {
	definition: Definition;
	childFixtures: any[];
	ignore: boolean;

	constructor(definition: Definition, ignore = false) {
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
				this.definition as Fixture,
			);
		}
		this.definition.declareAttribute(declaration);
	}

	fixture(name: string, model: object, rest?: FixtureOptions | blockFunction): void;
	fixture(name: string, model: object, options: FixtureOptions, block?: blockFunction): void;
	fixture(name: string, model: object, ...rest: any[]): void {
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

	trait(name: string, block?: blockFunction): void {
		const newTrait = new Trait(name, this.fixtureRiveter, block);
		this.definition.defineTrait(newTrait);
	}

	transient(block: blockFunction): void {
		const proxy = new DefinitionProxy(this.definition, true);
		block(addMethodMissing(proxy));
	}

	before(name: string, block: callbackFunction): void;
	before(name: string, name2: string, block: callbackFunction): void;
	before(name: string, name2: string, name3: string, block: callbackFunction): void;
	before(...rest: any[]): void {
		this.definition.before(...rest);
	}

	after(name: string, block: callbackFunction): void;
	after(name: string, name2: string, block: callbackFunction): void;
	after(name: string, name2: string, name3: string, block: callbackFunction): void;
	after(name: string, ...block: any[]): void;
	after(...rest: any[]): void {
		this.definition.after(...rest);
	}
}
