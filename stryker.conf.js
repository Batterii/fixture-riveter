/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
	packageManager: "npm",
	reporters: ["html", "progress"],
	thresholds: { high: 80, low: 80, break: 80 },
	testRunner: "mocha",
	coverageAnalysis: "perTest",
	buildCommand: 'npm run build',
	mochaOptions: {
		"config": ".mocharc-stryker.json",
		"spec": [ "dist/test/**/*.js"]
	},
};
