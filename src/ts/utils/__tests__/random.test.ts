import { describe, expect, test } from 'bun:test';
import { getRandomIntExcluding } from '@rakeli/utils';

describe('Random Number Generator', () => {
	test('Generated number is not equal to the excluded number and runs fast', () => {
		const iterations = 1_000_000;
		const start = performance.now();

		for (let i = 0; i < iterations; i++) {
			const result = getRandomIntExcluding(0, iterations, i);
			expect(result).toSatisfy((val) => val != i && val < iterations);
		}

		const end = performance.now();
		const duration = end - start;

		console.log(`Test completed in ${duration.toFixed(2)}ms`);

		expect(duration).toBeLessThan(1500);
	});
});
