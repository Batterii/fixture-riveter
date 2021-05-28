import {Adapter} from "../adapters/adapter";
import {Assembler} from "../assembler";
import {FixtureRiveter} from "../fixture-riveter";
import {ModelConstructor} from "../types";

export class Strategy {
	adapter: Adapter;
	fixtureRiveter: FixtureRiveter;
	name: string;

	constructor(name: string, fixtureRiveter: FixtureRiveter, adapter: Adapter) {
		this.name = name;
		this.adapter = adapter;
		this.fixtureRiveter = fixtureRiveter;
	}

	async result<T>(assembler: Assembler<T>, model?: ModelConstructor<T>): Promise<any>;
	async result<T>(assembler: Assembler<T>): Promise<any> {
		return assembler.toObject();
	}

	/* eslint-disable @typescript-eslint/no-empty-function */
	/* eslint-disable @typescript-eslint/no-unused-vars */
	async relation(fixtureName: string, traitsAndOverrides: any[]): Promise<any> {}
}
