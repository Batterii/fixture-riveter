import {Adapter} from "./adapters/adapter";
import {AttributeAssigner} from "./attribute-assigner";
import {Callback} from "./callback";
import {Pojo} from "./types";

export class Assembler<T> {
	attributeAssigner: AttributeAssigner<T>;
	callbacks: Callback<T>[];

	adapter: Adapter;

	constructor(
		attributeAssigner: AttributeAssigner<T>,
		callbacks: Callback<T>[],
		adapter: Adapter,
	) {
		this.attributeAssigner = attributeAssigner;
		this.callbacks = callbacks;
		this.adapter = adapter;
	}

	async toObject(): Promise<Pojo> {
		return this.attributeAssigner.toObject();
	}

	async toInstance(): Promise<T> {
		return this.attributeAssigner.toInstance();
	}

	async save(instance: any, Model: any): Promise<any> {
		return this.adapter.save(instance, Model);
	}

	async runCallbacks(name: string, instance: T): Promise<void> {
		const callbacks = this.callbacks.filter((c) => c.name === name);

		for (const callback of callbacks) {
			await callback.run(instance, this.attributeAssigner.evaluator);
		}
	}
}
