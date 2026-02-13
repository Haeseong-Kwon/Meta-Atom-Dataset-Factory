/**
 * SweepManager Logic Verification (Self-contained)
 */

class SweepManager {
    static generateCombinations(parameters) {
        if (parameters.length === 0) return [];

        const generate = (index, current) => {
            if (index === parameters.length) {
                return [current];
            }

            const param = parameters[index];
            const combinations = [];

            for (let val = param.start; val <= param.end; val += param.step) {
                const roundedVal = Math.round(val * 1e10) / 1e10;
                combinations.push(...generate(index + 1, { ...current, [param.name]: roundedVal }));
            }

            return combinations;
        };

        return generate(0, {});
    }
}

const testParams = [
    { name: 'radius', start: 100, end: 120, step: 10 },
    { name: 'height', start: 400, end: 500, step: 100 }
];

const results = SweepManager.generateCombinations(testParams);

console.log('Results Count:', results.length);
if (results.length === 6) {
    console.log('Test Passed: Generated 6 combinations.');
    process.exit(0);
} else {
    console.error('Test Failed: Expected 6 combinations, but got', results.length);
    process.exit(1);
}
