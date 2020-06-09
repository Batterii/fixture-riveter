export class Sequence {
	// eslint-disable-next-line class-methods-use-this
	next(): void {} // eslint-disable-line @typescript-eslint/no-empty-function

	*[Symbol.iterator](): any {
		while (true) {
			yield this.next();
		}
	}
}
