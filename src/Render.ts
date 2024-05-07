import { fadeIn, fadeOut } from "fading";

import { RenderError } from "./Error";

const fadeDuration = 100;

/**
 * Empties the given HTML element by fading it out and clearing its inner HTML.
 * @param element - The HTML element to be emptied.
 * @returns A promise that resolves when the element is emptied.
 */
export async function EmptyElement(element: HTMLElement): Promise<any> {
	if (!(element instanceof HTMLElement)) {
		return false;
	}
	await fadeOut(element, fadeDuration);
	element.replaceChildren();
}

/**
 * Removes an element from the DOM after fading it out.
 * @param element - The element to be removed.
 * @returns A promise that resolves once the element is removed.
 */
export async function RemoveElement(element: HTMLElement): Promise<void> {
	await fadeOut(element, fadeDuration);
	element?.remove();
}

/**
 * Prepends the specified content to the parent element and applies a fade-in effect if specified.
 * @param parent - The parent element to prepend the content to.
 * @param content - The content to prepend to the parent element.
 * @param cssDisplay - The CSS display property value for the content element (default: "block").
 * @param duration - The duration of the fade-in effect in milliseconds (default: fadeDuration).
 * @returns A promise that resolves once the content has been prepended and the fade-in effect (if any) has completed.
 * @throws {RenderError} If an error occurs while rendering.
 */
export async function PrependToElement({
	parent,
	content,
	cssDisplay = "block",
	duration = fadeDuration,
}: {
	content: HTMLElement;
	cssDisplay?: string;
	duration?: number;
	parent: HTMLElement;
}): Promise<void> {
	try {
		parent.prepend(...(Array.isArray(content) ? content : [content]));
		if (duration) {
			return fadeIn(content, fadeDuration, cssDisplay);
		}
	} catch (error) {
		throw new RenderError();
	}
}

/**
 * Appends the given content to the parent element and applies a fade-in effect if specified.
 * @param parent - The parent element to append the content to.
 * @param content - The content element(s) to be appended.
 * @param cssDisplay - The CSS display property value for the content element(s).
 * @param duration - The duration of the fade-in effect in milliseconds.
 * @returns A promise that resolves when the content has been appended and the fade-in effect (if any) has completed.
 * @throws {RenderError} If an error occurs while appending the content.
 */
export async function AppendToElement({
	parent,
	content,
	cssDisplay = "block",
	duration = fadeDuration,
}: {
	content: HTMLElement;
	cssDisplay?: string;
	duration?: number;
	parent: HTMLElement;
}): Promise<void> {
	try {
		parent.append(...(Array.isArray(content) ? content : [content]));
		if (duration) {
			return fadeIn(content, fadeDuration, cssDisplay);
		}
	} catch (error) {
		throw new RenderError();
	}
}

/**
 * Renders an element by replacing the content of a parent element with the provided content.
 * Optionally applies a fade-in animation to the rendered element.
 *
 * @param parent - The parent element where the content will be rendered.
 * @param content - The content element(s) to be rendered.
 * @param cssDisplay - The CSS display property value for the rendered element. Defaults to "block".
 * @param duration - The duration of the fade-in animation in milliseconds. Defaults to `fadeDuration`.
 * @returns A promise that resolves when the rendering is complete.
 */
export async function RenderElement({
	parent,
	content,
	cssDisplay = "block",
	duration = fadeDuration,
}: {
	content: HTMLElement;
	cssDisplay?: string;
	duration?: number;
	parent: HTMLElement;
}): Promise<void> {
	try {
		parent.replaceChildren();
		parent.prepend(...(Array.isArray(content) ? content : [content]));
		if (duration) {
			return fadeIn(parent, fadeDuration, cssDisplay);
		}
	} catch (error) {
		throw new RenderError();
	}
}

export async function EmptyAndRenderElement({
	parent,
	content,
	cssDisplay = "block",
	duration = fadeDuration,
}: {
	content: HTMLElement;
	cssDisplay?: string;
	duration?: number;
	parent: HTMLElement;
}): Promise<void> {
	await EmptyElement(parent);
	return await RenderElement({ parent, content, cssDisplay, duration });
}

/**
 * Fades out the body element and empties its content.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
export const EmptyBody = (): Promise<void> => EmptyElement(document.body);

/**
 * Empties the body element and renders the given page content.
 * @param {HTMLElement} pageContent - The page content to render.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
export const RenderBody = (pageContent: HTMLElement): Promise<void> =>
	RenderElement({
		parent: document.body,
		content: pageContent,
	});

/**
 * Prepends the given page content to the body element and fades it in.
 * @param {HTMLElement} pageContent - The page content to prepend.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
export const PrependToBody = (pageContent: HTMLElement): Promise<void> =>
	PrependToElement({
		parent: document.body,
		content: pageContent,
	});

/**
 * Appends the given page content to the body element and fades it in.
 * @param {HTMLElement} pageContent - The page content to append.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
export const AppendToBody = (pageContent: HTMLElement): Promise<void> =>
	AppendToElement({
		parent: document.body,
		content: pageContent,
	});
