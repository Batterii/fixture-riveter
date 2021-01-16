export class DummyModel {
	name: string;
	age: number;

	constructor(name?: string, age?: number) {
		this.name = name || "Noah";
		this.age = age || 32;
	}

	async save(): Promise<any> {
		return this;
	}
}
