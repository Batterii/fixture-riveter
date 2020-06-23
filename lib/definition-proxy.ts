import {Declaration} from "./declaration";
import {AssociationDeclaration} from "./declarations/association-declaration";
import {DynamicDeclaration} from "./declarations/dynamic-declaration";
import {ImplicitDeclaration} from "./declarations/implicit-declaration";
import {Trait} from "./trait";
import {Definition} from "./definition";
import {Factory} from "./factory";
import {blockFunction, FactoryOptions} from "./factory-options-parser";
import {FactoryBuilder} from "./factory-builder";
import {
	Sequence,
	SequenceCallback,
} from "./sequences/sequence";
import {SequenceHandler} from "./sequence-handler";

import {isFunction, last} from "lodash";

export class DefinitionProxy {
	definition: Definition;
	childFactories: any[];

	constructor(definition: Definition) {
		this.definition = definition;
		this.childFactories = [];
	}

	execute(): void {
		if (this.definition.block) {
			this.definition.block(this);
		}
	}

	get factoryBuilder(): FactoryBuilder {
		return this.definition.factoryBuilder;
	}

	get sequenceHandler(): SequenceHandler {
		return this.definition.sequenceHandler;
	}

	attr(name: string, ...rest: any[]): void {
		let declaration: Declaration;

		if (rest.length > 0) {
			const block = last(rest);
			if (isFunction(block)) {
				declaration = new DynamicDeclaration(name, block);
			} else {
				declaration = new AssociationDeclaration(name, rest);
			}
		} else {
			declaration = new ImplicitDeclaration(
				name,
				this.factoryBuilder,
				this.definition as Factory,
			);
		}
		this.definition.declareAttribute(declaration);
	}

	factory(name: string, model: object, rest?: FactoryOptions | blockFunction): void;
	factory(name: string, model: object, options: FactoryOptions, block?: blockFunction): void;
	factory(name: string, model: object, ...rest: any[]): void {
		this.childFactories.push([name, model, ...rest]);
	}

	association(name: string, ...rest: any[]): void {
		const association = new AssociationDeclaration(name, rest);
		this.definition.declareAttribute(association);
	}

	sequence(
		name: string,
		initial?: string | number,
		options?: {aliases: string[]},
		callback?: SequenceCallback,
	): Sequence;

	sequence(name: string, ...rest: any[]): Sequence {
		const sequence = this.sequenceHandler.registerSequence(name, ...rest);
		this.definition.declareAttribute(new DynamicDeclaration(name, () => sequence.next()));
		return sequence;
	}

	trait(name: string, block?: blockFunction): void {
		if (block && isFunction(block)) {
			this.definition.defineTrait(new Trait(name, this.factoryBuilder, block));
		} else {
			throw new Error(`wrong options, bruh: ${name}, ${block}`);
		}
	}
}
