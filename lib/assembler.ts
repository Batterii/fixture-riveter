import {AttributeAssigner} from "./attribute-assigner";
import {Callback} from "./callback";

export class Assembler<T> {
	attributeAssigner: AttributeAssigner<T>;
	callbacks: Callback<T>[];

	constructor(attributeAssigner: AttributeAssigner<T>, callbacks: Callback<T>[]) {
		this.attributeAssigner = attributeAssigner;
		this.callbacks = callbacks;
	}

	async toObject(): Promise<Record<string, any>> {
		return this.attributeAssigner.toObject();
	}

	async toInstance(): Promise<T> {
		return this.attributeAssigner.toInstance();
	}

	async runCallbacks(name: string, instance: T): Promise<void> {
		const callbacks = this.callbacks.filter((c) => c.name === name);

		for (const callback of callbacks) {
			// eslint-disable-next-line no-await-in-loop
			await callback.run(instance, this.attributeAssigner.evaluator);
		}
	}
}
