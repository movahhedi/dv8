import { PageFillType, type IDeviateProPageClass } from "./PrintPageTypes";

/* export const page: IDeviateProPageClass = class {
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

export const page: IDeviateProPageClass = {
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
