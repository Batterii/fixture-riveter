import {Sequence, SequenceCallback} from "./sequence";

export class SequenceHandler {
	sequences: Record<string, Sequence<any>>;

	constructor() {
		this.sequences = {};
	}

	registerSequence<C extends string | number | (() => Generator<any, any, any>)>(
		sequenceName: string,
		options?: C | string[] | SequenceCallback<number>,
	): Sequence<C>;

	registerSequence<C extends string | number | (() => Generator<any, any, any>)>(
		sequenceName: string,
		initial: C,
		aliasesOrCallback?: (
			| string[]
			| SequenceCallback<C extends (() => Generator<infer T, any, any>) ? T : C>
		),
	): Sequence<C>;

	registerSequence<C extends string | number | (() => Generator<any, any, any>)>(
		sequenceName: string,
		initialOrAliases: C | string[],
		callback?: SequenceCallback<C extends (() => Generator<infer T, any, any>) ? T : C>,
	): Sequence<C>;

	registerSequence<C extends string | number | (() => Generator<any, any, any>)>(
		sequenceName: string,
		initial: C,
		aliases: string[],
		callback?: SequenceCallback<C extends (() => Generator<infer T, any, any>) ? T : C>,
	): Sequence<C>;

	registerSequence(sequenceName: string, ...rest: any[]): Sequence<any> {
		const newSequence = new Sequence(sequenceName, ...rest);

		for (const name of newSequence.names()) {
			if (this.sequences[name]) {
				throw new Error(`Can't define ${name} sequence twice`);
			}
			this.sequences[name] = newSequence;
		}

		return newSequence;
	}

	resetSequences(): void {
		Object.values(this.sequences).forEach((seq) => seq.reset());
	}

	findSequence(name: string): Sequence<any> | undefined {
		return this.sequences[name];
	}
}
