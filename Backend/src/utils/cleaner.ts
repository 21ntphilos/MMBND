export function cleanRes(
	originalObject: any,
	propertiesToRemove: string[]
): any {
	const newObject:any = {};

	for (const key in originalObject) {
		if (!propertiesToRemove.includes(key)) {
			newObject[key] = originalObject[key];
		}
	}

	return newObject;
}