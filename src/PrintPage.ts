import { type JSONValidObject } from "json-types2";

import * as PagesImport from "../Pages";

import { HandleError } from "./Errors/Errors";
import {
	PageFillType,
	PrintPageHistoryState,
	SpecialPageType,
	type IDeviateProPageClass,
	type IDeviateProPageFamily,
	type IDeviateProUrlParams,
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
	startPoint: IDeviateProPageClass | IPages | IDeviateProPageFamily = Pages,
): Promise<IDeviateProPageClass> {
	let pageUnknownType: IDeviateProPageClass | IDeviateProPageFamily | (() => Promise<any>);
	let page: IDeviateProPageClass;
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

	if ((pageUnknownType as IDeviateProPageClass)?._meta) {
		page = pageUnknownType as IDeviateProPageClass;
	} else {
		pageImportFunction = pageUnknownType as () => Promise<any>;
		const loadImport = (await pageImportFunction()) || {};
		page = loadImport.default || loadImport.page || loadImport[pageName];
	}

	return page;
}

async function LoadPageRecursive(pagePath: string[]): Promise<IDeviateProPageClass> {
	const pagePathLength = pagePath.length;
	if (pagePathLength === 0) {
		return LoadPage("Home");
	}

	let page: IDeviateProPageClass;

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
	urlParams: URLSearchParams | null | IDeviateProUrlParams | string = null,
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

	try {
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
					title: i18n.Error.PageNotFound,
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

		const isLoggedIn = thisAccount?.role !== undefined;

		const pageMeta = page._meta(urlParams, pageData);

		const fillType =
			(typeof pageMeta.fillType === "function"
				? pageMeta.fillType()
				: pageMeta.fillType) ?? PageFillType.Main;

		if (!options.force && pageMeta.pageType === SpecialPageType.Login && isLoggedIn) {
			return PrintPage({ page: "Home" });
		}

		if (!options.force && pageMeta.requiresLogin && !isLoggedIn) {
			/* await ShowErrorPage(urlParams, {
				code: 401,
				onlyErrorPage: true,
				// title: i18n.Error.NotLoggedIn,
				title: i18n.Error.Unauthorized,
				memo2: "401",
			});
			return; */

			console.dev.info("Page requires login but user is not logged in.");

			return PrintPage(
				{ page: "Login" },
				{
					changeUrl: false,
					setHistoryState: PrintPageHistoryState.None,
				},
			);
		}

		const requiredRole =
			typeof pageMeta.requiredRole === "function"
				? pageMeta.requiredRole()
				: pageMeta.requiredRole;

		if (!options.force && isLoggedIn && !thisAccount.role) {
			return PrintPage(
				{ page: "ErrorPage" },
				{
					force: true,
					changeUrl: false,
					setHistoryState: PrintPageHistoryState.None,
				},
				{
					code: 403,
					onlyErrorPage: !isInitialAppRendered,
					title: i18n.ErrorShared.accountDisabled,
					memo2: "403",
				},
			);
		}

		if (!options.force && requiredRole && !ThisAccountHasRole(requiredRole)) {
			return PrintPage(
				{ page: "ErrorPage" },
				{
					force: true,
					changeUrl: false,
					setHistoryState: PrintPageHistoryState.None,
				},
				{
					code: 403,
					onlyErrorPage: !isInitialAppRendered,
					title: i18n.Error.PermissionRequired,
					memo2: "403",
				},
			);
			/* await ShowErrorPage(urlParams, {
				code: 403,
				onlyErrorPage: !isInitialAppRendered,
				title: i18n.Error.PermissionRequired,
				memo2: "403",
			}); */
		}

		const pageRender = page.render(urlParams, pageData);

		const pageTitle =
			typeof pageMeta.pageTitle === "function"
				? pageMeta.pageTitle()
				: pageMeta.pageTitle;
		SetPageTitle(pageTitle);

		if (fillType === PageFillType.App) {
			isInitialAppRendered = false;
			const promise_EmptyApp = EmptyApp();
			const [, pageContent] = await Promise.all([promise_EmptyApp, pageRender]);

			if (pageContent) {
				RenderApp(pageContent);
			}
		} else if (fillType === PageFillType.Main) {
			let promise_BeforeRenderMain: Promise<any>;

			if (!isInitialAppRendered) {
				promise_BeforeRenderMain = RenderInitialApp();
			} else {
				promise_BeforeRenderMain = EmptyMain();
			}

			const [, pageContent] = await Promise.all([
				promise_BeforeRenderMain,
				pageRender,
			]);

			if (pageContent) {
				RenderMain(pageContent);
			}
		} else if (fillType === PageFillType.Body) {
			isInitialAppRendered = false;
			const promise_EmptyApp = EmptyBody();
			const [, pageContent] = await Promise.all([promise_EmptyApp, pageRender]);

			if (pageContent) {
				RenderBody(pageContent);
			}
		} else if (fillType === PageFillType.AppAppend) {
			const pageContent = await pageRender;

			if (pageContent) {
				AppendToApp(pageContent);
			}
		} else if (fillType === PageFillType.MainAppend) {
			if (!isInitialAppRendered) {
				await RenderInitialApp();
				isInitialAppRendered = true;
			}

			const pageContent = await pageRender;

			if (pageContent) {
				AppendToMain(pageContent);
			}
		}
	} catch (error) {
		HandleError(error);
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

	Glowlichen(urlParams);

	// }

	// console.dev.timeEnd("PrintPage Time");

	currentStateUnchangedBeforePrintPage = history.state;
}
