import {Evaluator} from "./evaluator";
import {FixtureRiveter} from "./fixture-riveter";

export type callbackFunction<T> = (instance: T, evaluator: T & Evaluator) => any;

export class Callback<T> {
	fixtureRiveter: FixtureRiveter;
	name: string;
	block: callbackFunction<T>;

	constructor(fixtureRiveter: FixtureRiveter, name: string, block: callbackFunction<T>) {
		this.fixtureRiveter = fixtureRiveter;
		this.name = name;
		this.block = block;
	}

	async run(instance: T, evaluator: Evaluator): Promise<any> {
		return this.block.call(this.fixtureRiveter, instance, evaluator);
	}
}
