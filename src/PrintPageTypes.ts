import type * as PagesImport from "../Pages";

export type IPages = Record<
	keyof typeof PagesImport,
	IDeviateProPageClass | (() => Promise<any>)
>;

export interface IDeviateProPageClass {
	// new (): IDeviateProPage;
	_meta: IDeviateProPageMetaFunction;
	render: IRenderFunction;
}
export type IDeviateProPageFamily = Record<string, IDeviateProPageClass> | { _meta: true };

/* export interface IDeviateProPage {
	_meta: IDeviateProPageMetaFunction;
	render: IRenderFunction;
} */

export type IDeviateProPageMetaFunction = (
	urlParams: URLSearchParams,
	options?: object,
) => IDeviateProPageMeta;

export interface IDeviateProPageMeta {
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

export interface IDeviateProUrlParams_Base {
	glowlichen?: string;
	pageNo?: string;
	pageSize?: string;
	peerContext?: string;
	peerId?: string;
}

type IPagePath = keyof IPages | [keyof IPages, ...string[]];

export type IDeviateProUrlParams_Known = {
	id?: string;
	page: IPagePath;
};

export type IDeviateProUrlParams = IDeviateProUrlParams_Base &
	IDeviateProUrlParams_Known &
	Record<string, string | IPagePath>;

/* export interface IDeviateProUrlParams_Page extends IDeviateProUrlParams_Base {
	page: keyof IPages | [keyof IPages];
}

export interface IDeviateProUrlParams_Entity extends IDeviateProUrlParams_Base {
	entity: keyof typeof Entities;
	action: string;
	id?: string;
}
export interface IDeviateProUrlParams_Entity_Generic<T extends keyof typeof Entities>
	extends IDeviateProUrlParams_Base {
	entity: T;
	action: keyof Omit<(typeof Entities)[T], "prototype">;
	id?: string;
}

export type IDeviateProUrlParams<T extends keyof typeof Entities | "" = ""> =
	T extends keyof typeof Entities
		? IDeviateProUrlParams_Entity_Generic<T>
		: Either<IDeviateProUrlParams_Page, IDeviateProUrlParams_Entity>; */

export const enum PrintPageHistoryState {
	Push = 1,
	Replace = 2,
	None = 0,
}

export const enum SpecialPageType {
	Normal,
	Login,
	ForgotPassword,
	ServerConnectFailed,
	Home,
	Error,
	Signup,
	// AboutDeviatePro,
}

export const enum PageFillType {
	App,
	Main,
	Part,
	AppAppend,
	MainAppend,
	Body,
}
