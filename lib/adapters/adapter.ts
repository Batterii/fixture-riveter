export interface Adapter {
	build(props: Record<string, any>, Model: any): Record<string, any>;
	save(model: Record<string, any>, Model?: any): Record<string, any>;
	destroy(model: Record<string, any>, Model?: any): Record<string, any>;
}
