/**
 * Returns a random integer between min (inclusive) and max (inclusive),
 * excluding a specific value. Throws if the only possible number is the excluded one.
 */
export function getRandomIntExcluding(
	min: number,
	max: number,
	excluding: number,
): number {
	max -= 1;
	const floorMin = Math.ceil(min);
	const floorMax = Math.floor(max);

	const rangeSize = floorMax - floorMin + 1;

	// Check if exclusion makes it impossible to return a number
	if (rangeSize <= 1 && excluding >= floorMin && excluding <= floorMax) {
		throw new Error(
			'No valid numbers available in the given range excluding the specified value.',
		);
	}

	let randInt: number;

	do {
		randInt = Math.floor(Math.random() * rangeSize) + floorMin;
	} while (randInt === excluding);

	return randInt;
}
