import {Definition} from "./definition";
import {FixtureRiveter} from "./fixture-riveter";

/* eslint-disable @typescript-eslint/unbound-method */
export class DefinitionHierarchy {
	fixtureRiveter: FixtureRiveter;
	fixtureName: string;

	constructor(fixtureRiveter: FixtureRiveter, fixtureName: string) {
		this.fixtureRiveter = fixtureRiveter;
		this.fixtureName = fixtureName;
	}

	static setAdapterMethods(definition: Definition<any>): void {
		const toBuild = definition.toBuild();
		if (toBuild) {
			this.prototype.build = toBuild;
		}

		const toSave = definition.toSave();
		if (toSave) {
			this.prototype.save = toSave;
		}

		const toDestroy = definition.toDestroy();
		if (toDestroy) {
			this.prototype.destroy = toDestroy;
		}

		const toRelate = definition.toRelate();
		if (toRelate) {
			this.prototype.relate = toRelate;
		}

		const toSet = definition.toSet();
		if (toSet) {
			this.prototype.set = toSet;
		}
	}

	build(Model: any): any {
		return this.fixtureRiveter.getAdapter(this.fixtureName).build(Model);
	}

	async save(instance: any, Model?: any): Promise<any> {
		return this.fixtureRiveter.getAdapter(this.fixtureName).save(instance, Model);
	}

	async destroy(instance: any, Model?: any): Promise<void> {
		return this.fixtureRiveter.getAdapter(this.fixtureName).destroy(instance, Model);
	}

	async relate(instance: any, name: string, other: any, Model?: any): Promise<any> {
		return this.fixtureRiveter
			.getAdapter(this.fixtureName)
			.relate(instance, name, other, Model);
	}

	async set(instance: any, key: string, value: any): Promise<any> {
		return this.fixtureRiveter.getAdapter(this.fixtureName).set(instance, key, value);
	}
}
