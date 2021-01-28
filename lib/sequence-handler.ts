import {Sequence, SequenceCallback} from "./sequence";

export class SequenceHandler {
	sequences: Record<string, Sequence>;

	constructor() {
		this.sequences = {};
	}

	registerSequence(
		sequenceName: string,
		options?: string | number | Generator<any, any, any> | string[] | SequenceCallback,
	): Sequence;

	registerSequence(
		sequenceName: string,
		initial: string | number | Generator<any, any, any>,
		aliasesOrCallback?: string[] | SequenceCallback,
	): Sequence;

	registerSequence(
		sequenceName: string,
		initialOrAliases: string | number | Generator<any, any, any> | string[],
		callback?: SequenceCallback,
	): Sequence;

	registerSequence(
		sequenceName: string,
		initial: string | number | Generator<any, any, any>,
		aliases: string[],
		callback?: SequenceCallback,
	): Sequence;

	registerSequence(sequenceName: string, ...rest: any[]): Sequence {
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

	findSequence(name: string): Sequence | undefined {
		return this.sequences[name];
	}
}
