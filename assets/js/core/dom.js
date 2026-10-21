/**
 * Safe DOM Builder: Prevents all Cross-Site Scripting (XSS) vectors
 * by strictly avoiding raw innerHTML interpolation of user-controlled inputs.
 */
export const DOM = {
  create(tag, attributes = {}, ...children) {
    const element = document.createElement(tag);

    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'className') {
        element.className = value;
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else if (key === 'dataset' && typeof value === 'object') {
        for (const [dataKey, dataValue] of Object.entries(value)) {
          element.dataset[dataKey] = dataValue;
        }
      } else {
        element.setAttribute(key, value);
      }
    }

    for (const child of children) {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement || child instanceof DocumentFragment) {
        element.appendChild(child);
      } else if (Array.isArray(child)) {
        child.forEach(c => c && element.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
      }
    }

    return element;
  },

  clear(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
};