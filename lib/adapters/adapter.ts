export interface Adapter {
	build(Model: any): Record<string, any>;
	save(instance: Record<string, any>, Model?: any): Promise<Record<string, any>>;
	set(instance: Record<string, any>, key: string, value: any): Promise<Record<string, any>>;
}
