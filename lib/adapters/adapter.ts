export interface Adapter {
	build(Model: any, props: Record<string, any>): Record<string, any>;
	save(model: Record<string, any>, Model?: any): Record<string, any>;
	destroy(model: Record<string, any>, Model?: any): Record<string, any>;
}
