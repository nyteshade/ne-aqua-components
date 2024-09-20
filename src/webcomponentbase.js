import { StyleManager } from './stylemanager.js';

export class WebComponentBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.initializeAttributes();
    this.patchElementMethods();
    this.buildProxies();
    this.buildStyles();
    this.buildDOM();
  }

  adoptedCallback() {
    this.render();
  }

  attachEventListeners() {
    this.#listeners.forEach((listeners, eventName) => {
      listeners.forEach(({ selector, handler, options }) => {
        if (selector) {
          this.shadowRoot.querySelectorAll(selector).forEach(element => {
            element.addEventListener(eventName, handler, options);
          });
        }
        else {
          this._addEventListener.call(this, eventName, handler, options);
        }
      });
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.#state.set(name, newValue);
    this.render();
  }

  buildProxies() {
    const self = this;

    Object.defineProperty(this, 'css', {
      get() { return self.styleManager.variables },
      set(value) {
        if (value && typeof value === 'object') {
          for (const [key, val] of Object.entries(value)) {
            if (key in self.styleManager.variables && val === undefined) {
              delete self.styleManager.variables[key]
            }
            else {
              self.styleManager.variables[key] = val;
            }
          }
        }
        return;
      },
      enumerable: true,
      configurable: true,
    })

    this.state = new Proxy(this.#state, {
      deleteProperty(target, property) {
        if (self.observedAttributes.includes(property)) {
          self.removeAttribute(property);
        }
        return target.delete(property);
      },
      get(target, property, receiver) { return self.getState(property) },
      has(target, property) { return self.getAttributeNames().includes(property) },
      set(target, property, value, receiver) { self.setState(property, value, true) },
    });
  }

  buildStyles() {
    this.stylesheet = document.createElement('style');
    this.stylesheet.textContent = this.styles();
    this.shadowRoot.append(this.stylesheet);

    this.styleManager = new StyleManager(this.stylesheet, true);
    this.variables = this.styleManager.variables;
  }

  buildDOM() {
    for (let child of this.shadowRoot.childNodes) {
      this.shadowRoot.removeChild(child)
    }

    this.shadowRoot.append(this.stylesheet);
    const storage = document.createElement('div');
    storage.innerHTML = this.template();
    [...storage.children].forEach(child => this.shadowRoot.append(child));
  }

  connectedCallback() {
    this.attachEventListeners();
    this.render();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  emit(eventName, detail = {}, options = {}) {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail,
      ...options
    });
    this.dispatchEvent(event);
  }

  getState(key) {
    return this.#state.get(key);
  }

  getStateEntries() {
    return [...this.#state.entries()];
  }

  getStateKeys() {
    return [...this.#state.keys()];
  }

  hasState(key) {
    return this.#state.has(key);
  }

  initializeAttributes() {
    this.constructor.observedAttributes.forEach(attr => {
      this.#state.set(attr, this.getAttribute(attr));
    });
  }

  measureText(text, options = {}) {
    // Create a wrapper container
    const container = document.createElement('div');
    container.style.visibility = 'hidden';
    container.style.overflow = 'hidden';
    container.style.position = 'absolute';
    container.style.width = '0';
    container.style.height = '0';

    // Create the measuring element
    const span = document.createElement('span');
    span.style.whiteSpace = 'pre'; // Preserve whitespace and prevent text wrapping
    span.style.color = 'transparent'; // Prevent any visual text rendering

    // Apply user-defined styles
    Object.assign(span.style, options);

    // Insert the text
    span.textContent = text;

    // Nest the span inside the container
    container.appendChild(span);

    // Capture the intended parentElement
    const parentElement = (
      options?.parent?.isConnected &&
      options?.parent?.appendChild
    ) ? options.parent : document.body;

    // Append the container to the body
    parentElement.appendChild(container);

    // Measure the dimensions
    const { width, height } = span.getBoundingClientRect();

    // Clean up by removing the container
    parentElement.removeChild(container);

    // Return the dimensions
    return { width, height };
  }

  off(eventName, selector, handler, options) {
    if (typeof selector === 'function') {
      options = handler;
      handler = selector;
      selector = null;
    }

    const listeners = this.#listeners.get(eventName);
    if (listeners) {
      const index = listeners.findIndex(l =>
        l.selector === selector && l.handler === handler
      );
      if (index !== -1) {
        listeners.splice(index, 1);
        if (this.isConnected) {
          if (selector) {
            this.shadowRoot.querySelectorAll(selector).forEach(element => {
              element.removeEventListener(eventName, handler, options);
            });
          }
          else {
            this._removeEventListener.call(this, eventName, handler, options);
          }
        }
      }
    }
  }

  on(eventName, selector, handler, options) {
    if (typeof selector === 'function') {
      options = handler;
      handler = selector;
      selector = null;
    }

    if (!this.#listeners.has(eventName)) {
      this.#listeners.set(eventName, []);
    }

    this.#listeners.get(eventName).push({ selector, handler, options });

    if (this.isConnected) {
      if (selector) {
        this.shadowRoot.querySelectorAll(selector).forEach(element => {
          element.addEventListener(eventName, handler, options);
        });
      }
      else {
        this._addEventListener.call(this, eventName, handler, options);
      }
    }
  }

  onSlotChange(elements) {
    console.log('Slotted elements: ', elements);
  }

  patchElementMethods() {
    for (let [original, remapped] of [
      ['addEventListener', 'on'],
      ['removeEventListener', 'off']
    ]) {
      this.#patches.set(original, this[original])
      this[`_${original}`] = this[original].bind(this);
      this[original] = this[remapped]
    }
  }

  removeEventListeners() {
    this.#listeners.forEach((listeners, eventName) => {
      listeners.forEach(({ selector, handler, options }) => {
        if (selector) {
          this.shadowRoot.querySelectorAll(selector).forEach(element => {
            element.removeEventListener(eventName, handler, options);
          });
        }
        else {
          this._removeEventListener.call(this, eventName, handler, options);
        }
      });
    });
  }

  render() {
  }

  setMultipleState(stateUpdates, skipAttrSet = false) {
    for (const [key, value] of Object.entries(stateUpdates)) {
      this.#state.set(key, value);

      if (this.observedAttributes.includes(key) && !skipAttrSet) {
        this.setAttribute(key, value);
      }
    }

    this.render();
  }

  setState(key, value, skipAttrSet = false) {
    this.#state.set(key, value);

    if (this.observedAttributes.includes(key) && !skipAttrSet) {
      this.setAttribute(key, value);
    }

    this.render();
  }

  styles() {
    return '';
  }

  template() {
    return '';
  }

  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }

  get observedAttributes() {
    return this.constructor.observedAttributes;
  }

  shadow = null;
  stylesheet = null;

  #listeners = new Map()
  #patches = new Map()
  #state = new Map()

  static get customElementName() {
    return 'web-component-base';
  }

  static get observedAttributes() {
    return [];
  }

  static camelToKebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  static isCamelCase(str) {
    // Check if the string is empty or null
    if (!str || str.length === 0) {
      return false;
    }

    // Check if the first character is lowercase
    if (str[0] !== str[0].toLowerCase()) {
      return false;
    }

    // Check if the string contains any spaces
    if (str.includes(' ')) {
      return false;
    }

    // Check if the string contains any uppercase letters (except the first character)
    if (!/[A-Z]/.test(str.slice(1))) {
      return false;
    }

    // Check if the string contains any characters other than letters
    if (!/^[a-zA-Z]+$/.test(str)) {
      return false;
    }

    // If all checks pass, the string is in camelCase
    return true;
  }

  static isKebabCase(str) {
    // Regular expression to match kebab case
    const kebabCaseRegex = /^[a-z]+(-[a-z]+)*$/;

    // Test the string against the regex
    return kebabCaseRegex.test(str);
  }

  static kebabIfCamel(str) {
    return this.isCamelCase(str) ? this.camelToKebabCase(str) : str;
  }

  static {
    const name = this.customElementName;
    if (name !== 'web-component-base' && !customElements.get(name)) {
      console.log(`registering ${this.customElementName}`)
      customElements.define(name, this);
    }
  }
}

export default { WebComponentBase }