import {Evaluator} from "./evaluator";
import {FixtureRiveter} from "./fixture-riveter";

export type callbackFunction = (instance: any, evaluator: Evaluator) => any;

export class Callback {
	fixtureRiveter: FixtureRiveter;
	name: string;
	block: callbackFunction;

	constructor(fixtureRiveter: FixtureRiveter, name: string, block: callbackFunction) {
		this.fixtureRiveter = fixtureRiveter;
		this.name = name;
		this.block = block;
	}

	async run(instance: any, evaluator: Evaluator): Promise<any> {
		return this.block.call(this.fixtureRiveter, instance, evaluator);
	}
}
