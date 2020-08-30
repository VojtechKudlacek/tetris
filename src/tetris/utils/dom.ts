interface StructureNode {
	parent: HTMLElement;
	children?: Array<HTMLElement| StructureNode>;
}

export const createStructuredDom = (structure: StructureNode): HTMLElement => {
	if (structure.children) {
		for (const node of structure.children) {
			if (node instanceof HTMLElement) {
				structure.parent.appendChild(node);
			} else {
				structure.parent.appendChild(createStructuredDom(node));
			}
		}
	}
	return structure.parent;
}

export const createDomElement = <T extends keyof HTMLElementTagNameMap>(type: T, className?: string, value?: string): HTMLElementTagNameMap[T] => {
	const element = document.createElement(type);
	if (className) { element.className = className; }
	if (value) { element.innerHTML = value; }
	return element;
};
