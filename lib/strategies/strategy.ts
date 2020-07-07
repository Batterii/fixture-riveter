import {Adapter} from "../adapters/adapter";
import {Assembler} from "../assembler";
import {FixtureRiveter} from "../fixture-riveter";

export abstract class Strategy {
	adapter: Adapter;
	fixtureRiveter: FixtureRiveter;
	name: string;

	constructor(name: string, fixtureRiveter: FixtureRiveter, adapter: Adapter) {
		this.name = name;
		this.adapter = adapter;
		this.fixtureRiveter = fixtureRiveter;
	}

	abstract association(fixtureName: string, traitsAndOverrides: any[]): Promise<any>;
	abstract result(assembler: Assembler, model?: any): Promise<any>;
}
