import { type JSONValidObject } from "json-types2";

import * as PagesImport from "../Pages";

import {
	PageFillType,
	PrintPageHistoryState,
	type IDeviatePageClass,
	type IDeviatePageFamily,
	type IDeviateUrlParams,
	type IPages,
} from "./PrintPageTypes";
import { EmptyBody, RenderBody } from "./Render";
import { IsEmptyObject } from "./Utilities/Object";
import { UrlSearchParamsToObject, UrlSearchParamsToQuerystring } from "./Utilities/Url";

const Pages: IPages = PagesImport;

let pageParam: string | null = "";

export interface IHistoryStateMeta {
	anchor?: string;
	scrollY?: number;
}

export interface IHistoryState {
	meta: IHistoryStateMeta;
	pageData: JSONValidObject;
	url: string;
	urlParams: Record<string, string>;
}

export interface IPrintPage_Props {
	// scrollToTop?: boolean;
	changeUrl?: boolean;
	// checkIsLoggedIn?: boolean;
	// saveScrollState?: boolean;
	force?: boolean;
	isPopState?: boolean;
	meta?: IHistoryStateMeta;
	setHistoryState?: PrintPageHistoryState;
}

const printPage_DefaultProps: IPrintPage_Props = {
	setHistoryState: PrintPageHistoryState.Push,
	// checkIsLoggedIn: true,
	// saveScrollState: true,
	// scrollToTop: true,
	changeUrl: true,
	force: false,
	isPopState: false,
};

export let isInitialAppRendered = false;

async function LoadPage(
	pageName: string,
	startPoint: IDeviatePageClass | IPages | IDeviatePageFamily = Pages,
): Promise<IDeviatePageClass> {
	let pageUnknownType:
		| IDeviatePageClass
		| IDeviatePageFamily
		| (() => Promise<any>);
	let page: IDeviatePageClass;
	let pageImportFunction: () => Promise<any>;

	if (startPoint[pageName]) {
		// page = await import(`../Pages/${Page}`);

		pageUnknownType = startPoint[pageName];
	} /* else if (typeof Entities[entityParam]?.[actionParam] === "function") {
		await Entities[entityParam][actionParam](urlParams, pageOptions);
	} */ else if (!pageName) {
		// await Pages.Home.render(urlParams, pageOptions);
		pageUnknownType = Pages.Home;
	} else {
		/* await ShowErrorPage(null, {
			code: 404,
			onlyErrorPage: false,
			title: i18n.Error.PageNotFound,
			memo2: "404",
		}); */
		return;
	}

	if ((pageUnknownType as IDeviatePageClass)?._meta) {
		page = pageUnknownType as IDeviatePageClass;
	} else {
		pageImportFunction = pageUnknownType as () => Promise<any>;
		const loadImport = (await pageImportFunction()) || {};
		page = loadImport.default || loadImport.page || loadImport[pageName];
	}

	return page;
}

async function LoadPageRecursive(pagePath: string[]): Promise<IDeviatePageClass> {
	const pagePathLength = pagePath.length;
	if (pagePathLength === 0) {
		return LoadPage("Home");
	}

	let page: IDeviatePageClass;

	for (let i = 0; i < pagePathLength; i++) {
		const pageRoadPath = pagePath[i];
		page = await LoadPage(pageRoadPath, page || Pages);

		if (!page) {
			return undefined;
		}
	}

	return page;
}

export async function PrintPageByState(
	state: IHistoryState,
	options: IPrintPage_Props = {},
) {
	const urlParams = new URLSearchParams(state.urlParams);
	return await PrintPage(
		urlParams,
		{
			setHistoryState: PrintPageHistoryState.None,
			...options,
			meta: state.meta,
		},
		state.pageData,
	);
}

let currentStateUnchangedBeforePrintPage: IHistoryState;

export async function PrintPage(
	urlParams: URLSearchParams | null | IDeviateUrlParams | string = null,
	options: IPrintPage_Props = {},
	pageData: JSONValidObject | (() => JSONValidObject) = {},
) {
	options = { ...printPage_DefaultProps, ...options };
	const currentUrlString = window.location.href,
		currentUrl = new URL(currentUrlString),
		currentUrlParams = currentUrl.searchParams,
		currentAnchor = currentUrl.hash || undefined,
		currentHistoryState: IHistoryState = history.state || {};

	if (!currentStateUnchangedBeforePrintPage) {
		currentStateUnchangedBeforePrintPage = currentHistoryState;
	}

	const mainWrapper: HTMLElement | null = document.getElementById("mainWrapper");

	if (!options.isPopState) {
		// if (options.saveScrollState) {
		// Preserve the current scroll position of the page in case the user came back.
		// const scrollY = window.scrollY || window.pageYOffset;
		const scrollY = mainWrapper?.scrollTop;

		const currentHistoryStateToReplace: IHistoryState = {
			...currentStateUnchangedBeforePrintPage,
			// url: currentUrlString,
			meta: {
				...currentStateUnchangedBeforePrintPage.meta,
				scrollY,
				anchor: currentAnchor,
			},
		};
		console.dev.log("PrintPage: Old State", currentHistoryStateToReplace);

		history.replaceState(
			currentHistoryStateToReplace,
			"",
			currentHistoryStateToReplace.url,
		);
		// }
	}

	// Handle new page

	if (!urlParams || IsEmptyObject(urlParams)) {
		urlParams = currentUrlParams;
	}
	if (!(urlParams instanceof URLSearchParams)) {
		urlParams = new URLSearchParams(urlParams as any);
	}

	let newUrl: string;

	if (options.changeUrl) {
		newUrl = UrlSearchParamsToQuerystring(urlParams);
	} else {
		newUrl = UrlSearchParamsToQuerystring(currentUrlParams);
	}

	if (typeof pageData === "function") {
		pageData = pageData();
	}

	const newHistoryStateUrlParams = UrlSearchParamsToObject(urlParams);

	const newHistoryState: IHistoryState = {
		url: newUrl,
		urlParams: newHistoryStateUrlParams,
		pageData,
		meta: options.meta,
	};

	console.dev.log("PrintPage: New State", newHistoryState);

	if (options.setHistoryState === PrintPageHistoryState.Push) {
		history.pushState(newHistoryState, "", newUrl);
	} else if (options.setHistoryState === PrintPageHistoryState.Replace) {
		history.replaceState(newHistoryState, "", newUrl);
	}

	pageParam = urlParams.get("page");

	pageParam = pageParam?.replace(/[^a-zA-Z0-9.,/ +]/g, "") || "";
	const path = pageParam.split(/[.,/ +]/).filter((i) => i);

	const page = await LoadPageRecursive(path);

	if (!page || !page._meta) {
		return PrintPage(
			{ page: "ErrorPage" },
			{
				changeUrl: false,
				setHistoryState: PrintPageHistoryState.None,
			},
			{
				code: 404,
				onlyErrorPage: !isInitialAppRendered,
				title: "PageNotFound",
				memo2: "404",
			},
		);
		/* await ShowErrorPage(urlParams, {
				code: 404,
				onlyErrorPage: !isInitialAppRendered,
				title: i18n.Error.PageNotFound,
				memo2: "404",
			});
			return; */
	}

	const pageMeta = page._meta(urlParams, pageData);

	const fillType =
		(typeof pageMeta.fillType === "function"
			? pageMeta.fillType()
			: pageMeta.fillType) ?? PageFillType.Main;

	const pageRender = page.render(urlParams, pageData);

	const pageTitle =
		typeof pageMeta.pageTitle === "function"
			? pageMeta.pageTitle()
			: pageMeta.pageTitle.toString();

	SetPageTitle(pageTitle);

	if (fillType === PageFillType.Body) {
		isInitialAppRendered = false;
		const promise_EmptyApp = EmptyBody();
		const [, pageContent] = await Promise.all([promise_EmptyApp, pageRender]);

		if (pageContent) {
			RenderBody(pageContent);
		}
	}

	// if (options.scrollToTop) {
	// TODO doesn't work
	// window.scrollTo({ top: 0, behavior: "smooth" });
	// window.scrollTo(0, 0);

	if (options.meta?.scrollY) {
		mainWrapper?.scrollTo({
			behavior: "smooth",
			top: options.meta.scrollY,
		});
	} else if (options.meta?.anchor) {
		const scrollDiv: number | 0 | false =
			document.getElementById(options.meta.anchor)?.offsetTop || false;

		// 0 !== false
		if (scrollDiv !== false) {
			window.scrollTo({ top: scrollDiv, behavior: "smooth" });
		}
	} else {
		mainWrapper?.scrollTo({
			behavior: "smooth",
			top: 0,
		});
	}
	// }

	// console.dev.timeEnd("PrintPage Time");

	currentStateUnchangedBeforePrintPage = history.state;
}
