import { StyleManager } from './stylemanager.js'
import { Toolbelt } from './toolbelt.js'

const { camelIfKebab } = Toolbelt

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
    this.#state.set(name, newValue)

    const property = String(name).toLowerCase()
    const localName = `on${camelIfKebab(property, true)}Changed`
    let handler = null

    if (Reflect.has(this, localName))
      handler = this[localName].bind(this);
    else if (this.attributeHandlers.has(property))
      handler = this.attributeHandlers.get(property).bind(this)

    if (handler) {
      try {
        handler(oldValue, newValue)
      }
      catch (ignore) {
        console.error(ignore)
      }
    }

    this.render();
  }

  buildProxies() {
    const self = this;

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
    this.styleManager.applyVariablesTo(this);
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

    let command = null
    while ((command = this.queuedCommands.shift())) {
      try { command() } catch (ignore) { /* moving on */ }
    }

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

  get instanceId() {
    return this.#instanceId;
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

  queueCommand(command) {
    if (typeof command === 'function' || command instanceof Function) {
      this.queuedCommands.push()
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

  attributeHandlers = new Map()
  queuedCommands = [];
  shadow = null;
  stylesheet = null;

  #instanceId = Math.random().toString(36).slice(2);
  #listeners = new Map()
  #patches = new Map()
  #state = new Map()

  static get observedAttributes() {
    return [];
  }
}

export default { WebComponentBase }