import {Sequence, SequenceCallback, SequenceOptions} from "./sequence";

export class SequenceHandler {
	sequences: Map<string, Sequence<any>>;

	constructor() {
		this.sequences = new Map();
	}

	registerSequence<C extends string | number | (() => Generator<any, any, any>)>(
		sequenceName: string,
		options?: C | SequenceOptions | SequenceCallback<number>,
	): Sequence<C>;

	registerSequence<C extends string | number | (() => Generator<any, any, any>)>(
		sequenceName: string,
		initial: C,
		optionsOrCallback?: (
			| Omit<SequenceOptions, "initial" | "gen">
			| SequenceCallback<C extends (() => Generator<infer U, any, any>) ? U : C>
		),
	): Sequence<C>;

	registerSequence<C extends string | number | (() => Generator<any, any, any>)>(
		sequenceName: string,
		initialOrOptions: C | SequenceOptions,
		callback?: SequenceCallback<C extends (() => Generator<infer U, any, any>) ? U : C>
	): Sequence<C>;

	registerSequence<C extends string | number | (() => Generator<any, any, any>)>(
		sequenceName: string,
		initial: C,
		options: {aliases: string[]},
		callback?: SequenceCallback<C extends (() => Generator<infer U, any, any>) ? U : C>
	): Sequence<C>;

	registerSequence(sequenceName: string, ...rest: any[]): Sequence<any> {
		const newSequence = new Sequence(sequenceName, ...rest);

		for (const name of newSequence.names()) {
			if (this.sequences.has(name)) {
				throw new Error(`Can't define ${name} sequence twice`);
			}
			this.sequences.set(name, newSequence);
		}

		return newSequence;
	}

	resetSequences(): void {
		this.sequences.forEach((seq) => seq.reset());
	}

	findSequence(name: string): Sequence<any> | undefined {
		return this.sequences.get(name);
	}
}
