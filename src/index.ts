import { fadeIn, fadeOut } from "fading";

import { RenderError } from "./Error";
import { EnsureArray } from "./Utilities/Object";

const fadeDuration = 100;

export class Deviate {
	public element: HTMLElement;
	// public isAlive: boolean;

	constructor(selector: string);
	constructor(element: HTMLElement);
	constructor(elementOrSelector: HTMLElement | string) {
		if (typeof elementOrSelector === "string") {
			this.element = document.querySelector(elementOrSelector) as HTMLElement;
		} else {
			this.element = elementOrSelector;
		}

		if (!(this.element instanceof HTMLElement)) {
			console.error(
				"Deviate element is not an instance of HTMLElement.",
				this.element,
			);

			this.element = undefined;

			// this.isAlive = false;
			return undefined;
		}

		// this.isAlive = true;
	}

	/**
	 * Renders an element by replacing the content of a parent element with the provided content.
	 * Optionally applies a fade-in animation to the rendered element.
	 *
	 * @param content - The content element(s) to be rendered.
	 * @param cssDisplay - The CSS display property value for the rendered element. Defaults to "block".
	 * @param duration - The duration of the fade-in animation in milliseconds. Defaults to `fadeDuration`.
	 * @returns A promise that resolves when the rendering is complete.
	 */
	render({
		content,
		cssDisplay = "block",
		duration = fadeDuration,
	}: IChildrenParam): Promise<void> {
		if (!this.isAlive) {
			throw new RenderError();
		}

		try {
			this.emptyNow();
			this.element.prepend(...EnsureArray(content));

			if (duration) {
				return fadeIn(this.element, duration, cssDisplay);
			}
		} catch (error) {
			throw new RenderError(error?.message);
		}
	}

	/**
	 * Prepends the specified content to the parent element and applies a fade-in effect if specified.
	 * @param content - The content to prepend to the parent element.
	 * @param cssDisplay - The CSS display property value for the content element (default: "block").
	 * @param duration - The duration of the fade-in effect in milliseconds (default: fadeDuration).
	 * @returns A promise that resolves once the content has been prepended and the fade-in effect (if any) has completed.
	 * @throws {RenderError} If an error occurs while rendering.
	 */
	prepend({
		content,
		cssDisplay = "block",
		duration = fadeDuration,
	}: IChildrenParam): Promise<void> {
		if (!this.isAlive) {
			throw new RenderError();
		}

		try {
			this.element.prepend(...EnsureArray(content));

			if (duration) {
				return fadeIn(content, duration, cssDisplay);
			}
		} catch (error) {
			throw new RenderError(error?.message);
		}
	}

	/**
	 * Appends the given content to the parent element and applies a fade-in effect if specified.
	 * @param content - The content element(s) to be appended.
	 * @param cssDisplay - The CSS display property value for the content element(s).
	 * @param duration - The duration of the fade-in effect in milliseconds.
	 * @returns A promise that resolves when the content has been appended and the fade-in effect (if any) has completed.
	 * @throws {RenderError} If an error occurs while appending the content.
	 */
	append({
		content,
		cssDisplay = "block",
		duration = fadeDuration,
	}: IChildrenParam): Promise<void> {
		if (!this.isAlive) {
			throw new RenderError();
		}

		try {
			this.element.append(...EnsureArray(content));

			if (duration) {
				return fadeIn(content, duration, cssDisplay);
			}
		} catch (error) {
			throw new RenderError(error?.message);
		}
	}

	async emptyAndRender({
		content,
		cssDisplay = "block",
		duration = fadeDuration,
	}: IChildrenParam): Promise<void> {
		await this.empty(duration);
		return await this.render({ content, cssDisplay, duration });
	}

	/**
	 * Empties the given HTML element by fading it out and clearing its inner HTML.
	 * @param element - The HTML element to be emptied.
	 * @returns A promise that resolves when the element is emptied.
	 */
	async empty(duration = fadeDuration): Promise<boolean> {
		if (!this.isAlive) {
			throw new RenderError();
		}

		if (duration) {
			await fadeOut(this.element, duration);
		}
		this.emptyNow();
		return true;
	}

	emptyNow() {
		if (!this.isAlive) {
			throw new RenderError();
		}

		this.element.replaceChildren();
	}

	/**
	 * Removes an element from the DOM after fading it out.
	 * @returns A promise that resolves once the element is removed.
	 */
	async remove(duration = fadeDuration): Promise<void> {
		if (!this.isAlive) {
			throw new RenderError();
		}

		try {
			if (duration) {
				await fadeOut(this.element, duration);
			}
			this.dispose();
		} catch (error) {
			throw new RenderError(error?.message);
		}
	}

	dispose() {
		this.element?.remove && this.element?.remove();
		this.element = undefined;
	}

	get isAlive(): boolean {
		if (!this.element) {
			// this.isAlive = false;
			return false;
		}

		if (!(this.element instanceof HTMLElement)) {
			// this.isAlive = false;
			return false;
		}

		/* if (!IsInPage(this.element)) {
			this.isAlive = false;
			return false;
		} */

		return true;
	}

	isAliveThrow(): boolean | never {
		if (this.isAlive) {
			return true;
		}

		// this.isAlive = false;
		throw new RenderError("Deviate element is not alive.");
	}

	get isInPage(): boolean {
		return IsInPage(this.element);
	}
}

type IChildrenParam = {
	content: HTMLElement;
	cssDisplay?: string;
	duration?: number;
};

function IsInPage(node: Node) {
	// return node === document.body ? false : document.body.contains(node);
	return document.body.contains(node);
}
