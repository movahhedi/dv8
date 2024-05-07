export class RenderError extends Error {
	constructor(message = "An error occurred while rendering.") {
		super(message);
		this.name = "RenderError";
	}
}
