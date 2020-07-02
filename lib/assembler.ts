import {AttributeAssigner} from "./attribute-assigner";
import {Callback} from "./callback";

export class Assembler {
	attributeAssigner: AttributeAssigner;
	callbacks: Callback[];

	constructor(attributeAssigner: AttributeAssigner, callbacks: Callback[]) {
		this.attributeAssigner = attributeAssigner;
		this.callbacks = callbacks;
	}

	async toObject(): Promise<any> {
		return this.attributeAssigner.toObject();
	}

	async toInstance(): Promise<any> {
		return this.attributeAssigner.toInstance();
	}

	async runCallbacks(name: string, instance: any): Promise<void> {
		const callbacks = this.callbacks.filter((c) => c.name === name);

		for (const callback of callbacks) {
			// eslint-disable-next-line no-await-in-loop
			await callback.run(instance, this.attributeAssigner.evaluator);
		}
	}
}
