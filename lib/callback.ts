import {Evaluator} from "./evaluator";
import {FixtureRiveter} from "./fixture-riveter";

export type CallbackFunction<T> = (instance: T, evaluator: T & Evaluator) => void | Promise<void>;

export class Callback<T> {
	fixtureRiveter: FixtureRiveter;
	name: string;
	block: CallbackFunction<T>;

	constructor(fixtureRiveter: FixtureRiveter, name: string, block: CallbackFunction<T>) {
		this.fixtureRiveter = fixtureRiveter;
		this.name = name;
		this.block = block;
	}

	async run(instance: T, evaluator: Evaluator): Promise<any> {
		return this.block.call(this.fixtureRiveter, instance, evaluator);
	}
}
