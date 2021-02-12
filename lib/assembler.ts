import {AttributeAssigner} from "./attribute-assigner";
import {Callback} from "./callback";
import {Pojo} from "./types";

export class Assembler<T> {
	attributeAssigner: AttributeAssigner<T>;
	callbacks: Callback<T>[];

	constructor(attributeAssigner: AttributeAssigner<T>, callbacks: Callback<T>[]) {
		this.attributeAssigner = attributeAssigner;
		this.callbacks = callbacks;
	}

	async toObject(): Promise<Pojo> {
		return this.attributeAssigner.toObject();
	}

	async toInstance(): Promise<T> {
		return this.attributeAssigner.toInstance();
	}

	async runCallbacks(name: string, instance: T): Promise<void> {
		const callbacks = this.callbacks.filter((c) => c.name === name);

		for (const callback of callbacks) {
			await callback.run(instance, this.attributeAssigner.evaluator);
		}
	}

	async save(instance: T, Model?: any): Promise<T> {
		return this.attributeAssigner.save(instance, Model);
	}
}
