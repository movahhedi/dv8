import type * as PagesImport from "../Pages";

export type IPages = Record<
	keyof typeof PagesImport,
	IDeviatePageClass | (() => Promise<any>)
>;

export interface IDeviatePageClass {
	// new (): IDeviatePage;
	_meta: IDeviatePageMetaFunction;
	render: IRenderFunction;
}
export type IDeviatePageFamily = Record<string, IDeviatePageClass> | { _meta: true };

/* export interface IDeviatePage {
	_meta: IDeviatePageMetaFunction;
	render: IRenderFunction;
} */

export type IDeviatePageMetaFunction = (
	urlParams: URLSearchParams,
	options?: object,
) => IDeviatePageMeta;

export interface IDeviatePageMeta {
	fillType: PageFillType | (() => PageFillType);
	pageTitle: string | (() => string);
	requiredRole: number | false | (() => number | false);
	requiresLogin: boolean | (() => boolean);
	pageType?: SpecialPageType;
}

/* export interface IImportFunction {
	(): Promise<any>;
	isImportFunction: true;
} */

export type IRenderFunction = (
	urlParams: URLSearchParams,
	options: Record<string, any>,
) => Promise<JSX.Element>;

export interface IDeviateUrlParams_Base {
	glowlichen?: string;
	pageNo?: string;
	pageSize?: string;
	peerContext?: string;
	peerId?: string;
}

type IPagePath = keyof IPages | [keyof IPages, ...string[]];

export type IDeviateUrlParams_Known = {
	id?: string;
	page: IPagePath;
};

export type IDeviateUrlParams = IDeviateUrlParams_Base &
	IDeviateUrlParams_Known &
	Record<string, string | IPagePath>;

/* export interface IDeviateUrlParams_Page extends IDeviateUrlParams_Base {
	page: keyof IPages | [keyof IPages];
}

export interface IDeviateUrlParams_Entity extends IDeviateUrlParams_Base {
	entity: keyof typeof Entities;
	action: string;
	id?: string;
}
export interface IDeviateUrlParams_Entity_Generic<T extends keyof typeof Entities>
	extends IDeviateUrlParams_Base {
	entity: T;
	action: keyof Omit<(typeof Entities)[T], "prototype">;
	id?: string;
}

export type IDeviateUrlParams<T extends keyof typeof Entities | "" = ""> =
	T extends keyof typeof Entities
		? IDeviateUrlParams_Entity_Generic<T>
		: Either<IDeviateUrlParams_Page, IDeviateUrlParams_Entity>; */

export const enum PrintPageHistoryState {
	Push = 1,
	Replace = 2,
	None = 0,
}

export const enum SpecialPageType {
	Normal = 0,
	Home,
	Error,
	Login,
	ForgotPassword,
	Signup,
	ServerConnectFailed,
}

export const enum PageFillType {
	App,
	Main,
	Part,
	AppAppend,
	MainAppend,
	Body,
}
