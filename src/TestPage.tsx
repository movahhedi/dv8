import { PageFillType, type IDeviatePageClass } from "./PrintPageTypes";

/* export const page: IDeviatePageClass = class {
	static _meta = () => ({
		fillType: PageFillType.Main,
		requiresLogin: false,
		requiredRole: false,
		pageTitle: "Hello",
	});

	static async render(urlParams: URLSearchParams = null) {
		const pageContent: HTMLElement = <h1>Hi</h1>;

		return pageContent;
	}
};

export default page; */

export const page: IDeviatePageClass = {
	_meta: () => ({
		fillType: PageFillType.Main,
		requiresLogin: false,
		requiredRole: false,
		pageTitle: "Hello",
	}),

	async render(urlParams: URLSearchParams = null) {
		const pageContent: HTMLElement = <h1>Hi</h1>;

		return pageContent;
	},
};

export default page;
