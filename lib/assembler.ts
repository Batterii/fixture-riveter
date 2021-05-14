import {Adapter} from "./adapters/adapter";
import {AttributeAssigner} from "./attribute-assigner";
import {Hook} from "./hook";
import {Pojo} from "./types";

export class Assembler<T> {
	attributeAssigner: AttributeAssigner<T>;
	hooks: Hook<T>[];

	adapter: Adapter;

	constructor(
		attributeAssigner: AttributeAssigner<T>,
		hooks: Hook<T>[],
		adapter: Adapter,
	) {
		this.attributeAssigner = attributeAssigner;
		this.hooks = hooks;
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

	async runHooks(name: string, instance: T): Promise<void> {
		const hooks = this.hooks.filter((c) => c.name === name);

		for (const hook of hooks) {
			await hook.run(instance, this.attributeAssigner.evaluator);
		}
	}
}
