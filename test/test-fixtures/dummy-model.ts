/* eslint-disable class-methods-use-this, @typescript-eslint/no-unused-vars */
export class DummyModel {
	name: string;
	age: number;

	constructor(name?: string, age?: number) {
		this.name = name || 'Noah';
		this.age = age || 32;
	}

	async save(model: any, Model: any): Promise<any> {
		return model;
	}

	async destroy(model: any, Model: any): Promise<any> {
		return model;
	}
}
