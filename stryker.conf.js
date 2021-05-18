/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
	packageManager: "npm",
	reporters: ["html", "progress", "dashboard"],
	thresholds: { high: 80, low: 80, break: 80 },
	testRunner: "mocha",
	coverageAnalysis: "perTest",
	buildCommand: 'npm run build',
	mochaOptions: {
		"config": ".mocharc.json",
		"spec": ["dist/test/**/*.js"]
	},
};
