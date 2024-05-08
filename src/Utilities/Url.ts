import { type IDeviateUrlParams } from "../PrintPageTypes";

/**
 *
 * @param urlParams URLSearchParams
 * @returns An object containing key-value pairs.
 */
export const UrlSearchParamsToObject = (urlParams: URLSearchParams) =>
	Object.fromEntries(urlParams.entries());

export const UrlSearchParamsToQuerystring = (urlParams: URLSearchParams) =>
	"?" + urlParams.toString();

export const ParamsToHref = (
	urlParams:
		| string
		| URLSearchParams
		| string[][]
		| Record<string, string>
		| IDeviateUrlParams,
) => {
	if (typeof urlParams == "string") return urlParams;

	if (urlParams instanceof URLSearchParams) {
		return "?" + urlParams.toString();
	}

	return "?" + new URLSearchParams(urlParams as any).toString();
};
