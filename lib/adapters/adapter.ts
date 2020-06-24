export interface Adapter {
	build(attributes: Record<string, any>, Model: any): Record<string, any>;
	save(instance: Record<string, any>, Model?: any): Record<string, any>;
	destroy(instance: Record<string, any>, Model?: any): Record<string, any>;
}
