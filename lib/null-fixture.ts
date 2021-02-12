import {Attribute} from "./attributes/attribute";
import {Callback} from "./callback";
import {Definition} from "./definition";
import {FixtureRiveter} from "./fixture-riveter";
import {ModelConstructor} from "./types";
import {Trait} from "./trait";

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-function */
export class NullFixture<T> extends Definition<T> {
	model: ModelConstructor<T>;

	constructor(fixtureRiveter: FixtureRiveter) {
		super("nullFixture", fixtureRiveter);
	}

	compile(): void { }

	getAttributes(): Attribute[] {
		return [];
	}

	getCallbacks(): Callback<T>[] {
		return this.fixtureRiveter.getCallbacks();
	}

	traitByName(name: string): Trait<T> {
		return undefined as any;
	}

	toBuild(): <U = T>(Model: any) => U {
		const currentAdapter = this.fixtureRiveter.getAdapter(this.name);
		return (...args) => currentAdapter.build(...args);
	}

	toSave(): <U = T>(instance: any, Model?: any) => Promise<U> {
		const currentAdapter = this.fixtureRiveter.getAdapter(this.name);
		return async(...args) => currentAdapter.save(...args);
	}

	toDestroy(): (instance: any, Model?: any) => Promise<void> {
		const currentAdapter = this.fixtureRiveter.getAdapter(this.name);
		return async(...args) => currentAdapter.destroy(...args);
	}

	toRelate(): (
		instance: any,
		name: string,
		other: any,
		Model?: any,
	) => Promise<Record<string, any>> {
		const currentAdapter = this.fixtureRiveter.getAdapter(this.name);
		return async(...args) => currentAdapter.relate(...args);
	}

	toSet(): (instance: any, key: any, value: any) => Promise<Record<string, any>> {
		const currentAdapter = this.fixtureRiveter.getAdapter(this.name);
		return async(...args) => currentAdapter.set(...args);
	}
}
