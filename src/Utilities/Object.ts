export function IsObject(obj: unknown) {
	return typeof obj === "object" && !Array.isArray(obj) && obj !== null;
}

export function IsArrayEmpty(array: any) {
	// return !array || array?.length === 0;
	return Array.isArray(array) && array.length === 0;
}

export function IsEmpty(obj: any) {
	for (var prop in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, prop)) {
			return false;
		}
	}

	return true;
}

export function IsEmptyObject(value: unknown) {
	/* for (const _ in value) {
		return false;
	}
	return true; */

	if (value == null) {
		// null or undefined
		return false;
	}

	if (typeof value !== "object") {
		// boolean, number, string, function, etc.
		return false;
	}

	const proto = Object.getPrototypeOf(value);

	// consider `Object.create(null)`, commonly used as a safe map
	// before `Map` support, an empty object as well as `{}`
	if (proto !== null && proto !== Object.prototype) {
		return false;
	}

	return IsEmpty(value);
}

export function IsClass(v: unknown) {
	return typeof v === "function" && /^\s*class\s+/.test(v.toString());
}

export function EnsureArray(a: any) {
	return Array.isArray(a) ? a : [a];
}
