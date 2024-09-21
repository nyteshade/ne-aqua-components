import { StyleManager } from './stylemanager.js'
import { Toolbelt } from './toolbelt.js'

const { camelIfKebab } = Toolbelt

export class WebComponentBase extends HTMLElement {
  /**
   * The constructor for the WebComponentBase class.
   *
   * @description
   * This constructor is called when a new instance of the WebComponentBase
   * class is created. It performs several initialization tasks:
   *
   * 1. Calls the `super()` method to initialize the parent class.
   * 2. Attaches a new `ShadowRoot` to the element with the `open` mode.
   * 3. Initializes the component's attributes by calling `initializeAttributes()`.
   * 4. Patches the component's methods by calling `patchElementMethods()`.
   * 5. Builds proxies for the component's state by calling `buildProxies()`.
   * 6. Builds the component's styles by calling `buildStyles()`.
   * 7. Builds the component's DOM structure by calling `buildDOM()`.
   *
   * This constructor sets up the initial state and behavior of the
   * WebComponentBase instance, ensuring that it is ready for rendering and
   * interaction.
   *
   * @example
   * class MyComponent extends WebComponentBase {
   *   constructor() {
   *     super()
   *     // Additional initialization code for MyComponent
   *   }
   *
   *   // ...
   * }
   *
   * const myComponent = new MyComponent()
   */
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.initializeAttributes()
    this.patchElementMethods()
    this.buildProxies()
    this.buildStyles()
    this.buildDOM()
  }

  /**
   * Callback function called when the custom element is adopted into a new
   * document.
   *
   * @description
   * The `adoptedCallback` is a lifecycle method of the custom element that
   * is called when the element is moved to a new document. This method is
   * used to trigger the rendering of the component in the new document
   * context by calling the `render` method.
   *
   * @example
   * // When the custom element is moved to a new document, the
   * // `adoptedCallback` is called, and the component is rendered
   * const component = document.createElement('my-component')
   * document.body.appendChild(component) // Triggers `adoptedCallback`
   */
  adoptedCallback() {
    this.render()
  }

  /**
   * Attaches event listeners to elements within the component's shadow root.
   *
   * @description
   * This method iterates over the `#listeners` private field, which is a Map
   * containing event listeners registered for the component. For each event
   * name and its associated listeners, it checks if a selector is provided.
   * If a selector is provided, it queries the shadow root for elements
   * matching the selector and attaches the event listener to each matched
   * element. If no selector is provided, it attaches the event listener
   * directly to the component itself using the `_addEventListener` method.
   *
   * The `#listeners` Map is expected to have the following structure:
   *
   * ```js
   * #listeners = new Map([
   *   ['click', [
   *     { selector: '.button', handler: handleButtonClick, options: {} },
   *     { handler: handleComponentClick, options: { capture: true } }
   *   ]],
   *   ['input', [
   *     { selector: 'input', handler: handleInputChange, options: {} }
   *   ]]
   * ])
   * ```
   *
   * @example
   * // Assuming the component has a button and an input field
   * this.#listeners.set('click', [
   *   { selector: 'button', handler: this.handleButtonClick },
   *   { handler: this.handleComponentClick, options: { capture: true } }
   * ])
   * this.#listeners.set('input', [
   *   { selector: 'input', handler: this.handleInputChange }
   * ])
   *
   * this.attachEventListeners()
   * // Attaches click event listeners to the button and the component
   * // Attaches input event listener to the input field
   */
  attachEventListeners() {
    this.#listeners.forEach((listeners, eventName) => {
      listeners.forEach(({ selector, handler, options }) => {
        if (selector) {
          this.shadowRoot.querySelectorAll(selector).forEach(element => {
            element.addEventListener(eventName, handler, options)
          })
        }
        else {
          this._addEventListener(eventName, handler, options)
        }
      })
    })
  }

  /**
   * Callback function invoked when an observed attribute of the custom element
   * has been added, removed, updated, or replaced.
   *
   * @param {string} name - The name of the attribute that changed.
   * @param {string|null} oldValue - The previous value of the attribute.
   * @param {string|null} newValue - The new value of the attribute.
   *
   * @description
   * This method is called when an observed attribute of the custom element
   * changes. It performs the following tasks:
   *
   * 1. Updates the internal state of the component with the new attribute
   *    value using `this.#state.set(name, newValue)`.
   * 2. Determines if there is a handler method for the attribute change by
   *    checking if a method with the name `on{PropertyName}Changed` exists
   *    on the component instance or if a handler is registered in the
   *    `attributeHandlers` Map.
   * 3. If a handler is found, it calls the handler with the `oldValue` and
   *    `newValue` as arguments. If an error occurs during the handler
   *    execution, it logs the error to the console.
   * 4. Calls the `render` method to update the component's rendering.
   *
   * @example
   * // Assuming the component has an observed attribute 'color'
   * // and a handler method 'onColorChanged'
   *
   * // When the 'color' attribute changes from 'red' to 'blue'
   * attributeChangedCallback('color', 'red', 'blue')
   * // 1. Updates the internal state with the new value 'blue'
   * // 2. Finds the 'onColorChanged' method
   * // 3. Calls 'onColorChanged('red', 'blue')'
   * // 4. Calls 'render()' to update the component's rendering
   *
   * @example
   * // Subclassing WebComponentBase with a custom element that expected
   * // a `margin` attribute, on could catch such changes using a method
   * class Subclass extends WebComponentBase {
   *   ...
   *   onMarginChanged(newValue, oldValue) {
   *     // do this instead of overriding `attributeChangedCallback` to
   *     // handle margin changes specifically.
   *   }
   *   ...
   *   static get observedAttributes() {
   *     return ['margin']
   *   }
   * }
   */
  attributeChangedCallback(name, oldValue, newValue) {
    this.#state.set(name, newValue)

    const property = String(name).toLowerCase()
    const localName = `on${camelIfKebab(property, true)}Changed`
    let handler = null

    if (Reflect.has(this, localName))
      handler = this[localName].bind(this)
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

    this.render()
  }

  /**
   * Creates proxy objects for the component's state and attributes.
   *
   * @description
   * This method creates a proxy object for the component's internal state
   * (`this.#state`) and assigns it to `this.state`. The proxy object provides
   * a way to intercept and handle operations on the state object, such as
   * getting, setting, and deleting properties.
   *
   * The proxy object has the following handlers:
   *
   * - `deleteProperty`: If the property being deleted is an observed attribute,
   *   it removes the corresponding attribute from the component. Otherwise, it
   *   deletes the property from the target object (`this.#state`).
   * - `get`: Returns the value of the property from the component's state by
   *   calling the `getState` method.
   * - `has`: Checks if the property is an observed attribute by calling the
   *   `getAttributeNames` method and checking if the property is included in
   *   the list of attribute names.
   * - `set`: Sets the value of the property in the component's state by calling
   *   the `setState` method with the third argument set to `true` (to trigger
   *   attribute updates).
   *
   * By using a proxy object, the component can intercept and handle operations
   * on its state in a centralized manner, allowing for additional logic or
   * side effects to be performed when necessary.
   *
   * @example
   * // Getting a property value
   * const value = this.state.myProperty
   *
   * // Setting a property value
   * this.state.myProperty = 'new value'
   *
   * // Deleting a property
   * delete this.state.myProperty
   */
  buildProxies() {
    const self = this

    this.state = new Proxy(this.#state, {
      deleteProperty(target, property) {
        if (self.observedAttributes.includes(property)) {
          self.removeAttribute(property)
        }
        return target.delete(property)
      },
      get(target, property, receiver) { return self.getState(property) },
      has(target, property) { return self.getAttributeNames().includes(property) },
      set(target, property, value, receiver) { self.setState(property, value, true) },
    })
  }

  /**
   * Builds the styles for the web component.
   *
   * @description
   * This method creates a new `<style>` element and sets its `textContent`
   * to the result of calling the `styles()` method. It then appends this
   * `<style>` element to the component's `shadowRoot`.
   *
   * Next, it creates a new instance of the `StyleManager` class, passing in
   * the `<style>` element and `true` as arguments. The `StyleManager` is
   * responsible for managing the component's styles and applying CSS
   * variables.
   *
   * Finally, it calls the `applyVariablesTo()` method on the `styleManager`
   * instance, passing in `this` (the component instance) as an argument.
   * This applies the component's CSS variables to the component itself.
   *
   * @example
   * // Within the component's constructor or lifecycle method
   * this.buildStyles()
   *
   * // This will create a `<style>` element with the component's styles
   * // and append it to the component's `shadowRoot`. It will also create
   * // a `StyleManager` instance and apply the component's CSS variables
   * // to the component itself.
   */
  buildStyles() {
    this.stylesheet = document.createElement('style')
    this.stylesheet.textContent = this.styles()
    this.shadowRoot.append(this.stylesheet)

    this.styleManager = new StyleManager(this.stylesheet, true)
    this.styleManager.applyVariablesTo(this)
  }

  /**
   * Builds the DOM structure for the web component.
   *
   * @description
   * This method is responsible for constructing the DOM structure of the web
   * component. It first removes all existing child nodes from the component's
   * `shadowRoot`. Then, it appends the component's stylesheet (`this.stylesheet`)
   * to the `shadowRoot`.
   *
   * Next, it creates a temporary `div` element (`storage`) and sets its
   * `innerHTML` to the result of calling the `template()` method, which should
   * return the HTML template for the component. The children of this temporary
   * `div` are then appended to the `shadowRoot`.
   *
   * This method effectively clears the existing DOM structure of the component
   * and rebuilds it based on the template returned by the `template()` method.
   *
   * @example
   * // Within the component's constructor or lifecycle method
   * this.buildDOM()
   *
   * // This will remove all existing child nodes from the component's `shadowRoot`
   * // Append the component's stylesheet to the `shadowRoot`
   * // Construct the DOM structure based on the template returned by `template()`
   * // And append the resulting nodes to the `shadowRoot`
   */
  buildDOM() {
    const storage = document.createElement('div')

    for (let child of this.shadowRoot.childNodes) {
      this.shadowRoot.removeChild(child)
    }

    this.shadowRoot.append(this.stylesheet)
    storage.innerHTML = this.template()

    for (const child of storage.children) {
      this.shadowRoot.append(child)
    }
  }

  /**
   * Callback function invoked when the custom element is inserted into the
   * DOM tree. This method performs the following tasks:
   *
   * 1. Attaches event listeners to the custom element by calling the
   *    `attachEventListeners` method.
   * 2. Executes any queued commands that were added to the `queuedCommands`
   *    array before the element was connected to the DOM. If any command
   *    throws an error, it is caught and ignored.
   * 3. Renders the custom element by calling the `render` method.
   *
   * @example
   * // When the custom element is inserted into the DOM
   * customElement.connectedCallback()
   *
   * // This will:
   * // 1. Attach event listeners to the custom element
   * // 2. Execute any queued commands
   * // 3. Render the custom element
   */
  connectedCallback() {
    this.attachEventListeners()

    let command = null
    while ((command = this.queuedCommands.shift())) {
      try { command() }
      catch (ignore) { /* moving on */ }
    }

    this.render()
  }

  /**
   * Callback function invoked when the custom element is removed from the
   * DOM tree. This method calls the `removeEventListeners` method to detach
   * any event listeners that were previously attached to the custom element.
   *
   * @description
   * When a custom element is removed from the DOM, this method is called to
   * perform any necessary cleanup tasks. In this case, it calls the
   * `removeEventListeners` method to ensure that any event listeners
   * attached to the custom element are properly removed, preventing memory
   * leaks and potential issues with stale event handlers.
   *
   * @example
   * // When the custom element is removed from the DOM
   * customElement.disconnectedCallback()
   *
   * // This will:
   * // 1. Remove any attached event listeners from the custom element
   */
  disconnectedCallback() {
    this.removeEventListeners()
  }

  /**
   * Emits a custom event from the component.
   *
   * @param {string} eventName - The name of the event to emit.
   * @param {Object} [detail={}] - An object containing additional data to
   *   pass with the event.
   * @param {Object} [options={}] - Additional options to configure the event.
   *
   * @description
   * This method creates a new `CustomEvent` with the specified `eventName`,
   * `detail`, and `options`. The `bubbles` and `composed` options are set to
   * `true` by default, allowing the event to bubble up through the DOM tree
   * and cross the Shadow DOM boundary.
   *
   * The `detail` object can be used to pass additional data with the event.
   * The `options` object can be used to configure the event further, such as
   * setting the `cancelable` property.
   *
   * After creating the `CustomEvent`, the method dispatches the event from
   * the component using the `dispatchEvent` method.
   *
   * @example
   * // Emit a custom event named 'my-event' with additional data
   * this.emit('my-event', { data: 'some data' })
   *
   * // Emit a custom event with additional options
   * this.emit('my-event', {}, { cancelable: true })
   */
  emit(eventName, detail = {}, options = {}) {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail,
      ...options
    })
    this.dispatchEvent(event)
  }

  /**
   * Retrieves the value of a specific state property.
   *
   * @param {string} key - The key of the state property to retrieve.
   * @returns {*} The value of the specified state property.
   *
   * @description
   * This method retrieves the value of a specific state property from the
   * component's internal state object (`this.#state`). The state object is
   * a `Map` that stores the component's state properties and their values.
   *
   * @example
   * // Get the value of the 'count' state property
   * const count = this.getState('count')
   */
  getState(key) {
    return this.#state.get(key)
  }

  /**
   * Retrieves an array of key-value pairs representing the component's state.
   *
   * @returns {Array<[string, *]>} An array of key-value pairs representing
   *   the component's state.
   *
   * @description
   * This method returns an array of key-value pairs representing the
   * component's internal state. The state is stored in a `Map` object
   * (`this.#state`), and this method creates an array from the entries of
   * that `Map` using the spread operator.
   *
   * @example
   * // Get an array of the component's state entries
   * const stateEntries = this.getStateEntries()
   * // stateEntries = [['count', 0], ['name', 'John']]
   */
  getStateEntries() {
    return [...this.#state.entries()]
  }

  /**
   * Retrieves an array of keys representing the properties in the
   * component's state.
   *
   * @returns {Array<string>} An array of keys representing the properties
   *   in the component's state.
   *
   * @description
   * This method returns an array of keys representing the properties in the
   * component's internal state. The state is stored in a `Map` object
   * (`this.#state`), and this method creates an array from the keys of that
   * `Map` using the spread operator.
   *
   * @example
   * // Get an array of the component's state keys
   * const stateKeys = this.getStateKeys()
   * // stateKeys = ['count', 'name']
   */
  getStateKeys() {
    return [...this.#state.keys()]
  }

  /**
   * Checks if the component's state has a property with the given key.
   *
   * @param {string} key - The key to check for in the component's state.
   * @returns {boolean} `true` if the state has the given key, `false` otherwise.
   *
   * @example
   * const hasCount = this.hasState('count')
   * // hasCount = true if the state has a 'count' property, false otherwise
   */
  hasState(key) {
    return this.#state.has(key)
  }

  /**
   * Initializes the component's state with the values of its observed attributes.
   *
   * @description
   * This method iterates over the list of observed attributes defined by the
   * component's constructor. For each observed attribute, it retrieves the
   * attribute's value from the component's DOM element and sets it as the
   * corresponding property in the component's state.
   *
   * @example
   * // Assuming the component has observed attributes 'count' and 'name'
   * // with initial values '0' and 'John', respectively
   * this.initializeAttributes()
   * // this.#state = new Map([['count', '0'], ['name', 'John']])
   */
  initializeAttributes() {
    this.constructor.observedAttributes.forEach(attr => {
      this.#state.set(attr, this.getAttribute(attr))
    })
  }

  /**
   * Retrieves the unique instance ID of the component.
   *
   * @returns {string} The unique instance ID of the component.
   *
   * @description
   * This getter property returns the unique instance ID of the component,
   * which is stored in the private `#instanceId` field.
   *
   * @example
   * const instanceId = this.instanceId
   * // instanceId = '1234-5678-9012'
   */
  get instanceId() {
    return this.#instanceId
  }

  /**
   * Removes an event listener from the component or its shadow DOM elements.
   *
   * @param {string} eventName - The name of the event to remove the listener for.
   * @param {string|Function} [selector] - A CSS selector or a handler function.
   * @param {Function} [handler] - The event handler function to remove.
   * @param {Object} [options] - Optional options for the event listener.
   *
   * @description
   * This method removes an event listener from the component or its shadow DOM
   * elements. If a selector is provided, it removes the listener from all elements
   * matching the selector within the component's shadow root. If no selector is
   * provided, it removes the listener from the component itself.
   *
   * If the first argument is a function, it is treated as the handler, and the
   * second argument is treated as the options object.
   *
   * @example
   * // Remove a click event listener from the component
   * this.off('click', handleClick)
   *
   * // Remove a click event listener from elements with the class 'button'
   * this.off('click', '.button', handleButtonClick)
   *
   * // Remove an event listener with options
   * this.off('input', handleInput, { capture: true })
   */
  off(eventName, selector, handler, options) {
    if (typeof selector === 'function') {
      options = handler
      handler = selector
      selector = null
    }

    const listeners = this.#listeners.get(eventName)
    if (listeners) {
      const index = listeners.findIndex(l =>
        l.selector === selector && l.handler === handler
      )
      if (index !== -1) {
        listeners.splice(index, 1)
        if (this.isConnected) {
          if (selector) {
            this.shadowRoot.querySelectorAll(selector).forEach(element => {
              element.removeEventListener(eventName, handler, options)
            })
          }
          else {
            this._removeEventListener.call(this, eventName, handler, options)
          }
        }
      }
    }
  }

  /**
   * Adds an event listener to the component or its shadow DOM elements.
   *
   * @param {string} eventName - The name of the event to listen for.
   * @param {string|Function} [selector] - A CSS selector or a handler function.
   * @param {Function} [handler] - The event handler function to add.
   * @param {Object} [options] - Optional options for the event listener.
   *
   * @description
   * This method adds an event listener to the component or its shadow DOM
   * elements. If a selector is provided, it adds the listener to all elements
   * matching the selector within the component's shadow root. If no selector is
   * provided, it adds the listener to the component itself.
   *
   * If the first argument is a function, it is treated as the handler, and the
   * second argument is treated as the options object.
   *
   * @example
   * // Add a click event listener to the component
   * this.on('click', handleClick)
   *
   * // Add a click event listener to elements with the class 'button'
   * this.on('click', '.button', handleButtonClick)
   *
   * // Add an event listener with options
   * this.on('input', handleInput, { capture: true })
   */
  on(eventName, selector, handler, options) {
    if (typeof selector === 'function') {
      options = handler
      handler = selector
      selector = null
    }

    if (!this.#listeners.has(eventName)) {
      this.#listeners.set(eventName, [])
    }

    this.#listeners.get(eventName).push({ selector, handler, options })

    if (this.isConnected) {
      if (selector) {
        this.shadowRoot.querySelectorAll(selector).forEach(element => {
          element.addEventListener(eventName, handler, options)
        })
      }
      else {
        this._addEventListener.call(this, eventName, handler, options)
      }
    }
  }

  /**
   * Callback function invoked when the content of a `<slot>` element changes.
   *
   * @param {Node[]} elements - An array of nodes that were added or removed
   *   from the `<slot>` element.
   *
   * @description
   * This method is called when the content of a `<slot>` element within the
   * component's shadow DOM changes. It receives an array of nodes that were
   * added or removed from the `<slot>` element.
   *
   * By default, this method does nothing. Subclasses can override this method
   * to perform custom logic when the content of a `<slot>` element changes.
   *
   * @example
   * // Override the `onSlotChange` method in a subclass
   * class MyComponent extends WebComponentBase {
   *   onSlotChange(elements) {
   *     // Perform custom logic here
   *     console.log('Slot content changed:', elements)
   *   }
   * }
   */
  onSlotChange(elements) {
  }

  /**
   * Patches the `addEventListener` and `removeEventListener` methods of the
   * component to use custom implementations.
   *
   * @description
   * This method remaps the `addEventListener` and `removeEventListener` methods
   * of the component to use custom implementations named `on` and `off`,
   * respectively. It does this by:
   *
   * 1. Storing the original `addEventListener` and `removeEventListener`
   *    methods in the `#patches` private field.
   * 2. Creating bound versions of the original methods using `bind(this)` and
   *    storing them as `_addEventListener` and `_removeEventListener`.
   * 3. Overriding the `addEventListener` and `removeEventListener` methods with
   *    the custom `on` and `off` implementations.
   *
   * This patching allows the component to use a more concise syntax for adding
   * and removing event listeners, while still having access to the original
   * methods if needed.
   *
   * @example
   * // Before patching
   * component.addEventListener('click', handleClick)
   * component.removeEventListener('click', handleClick)
   *
   * // After patching
   * component.on('click', handleClick)
   * component.off('click', handleClick)
   */
  patchElementMethods() {
    for (let [original, remapped] of [
      ['addEventListener', 'on'],
      ['removeEventListener', 'off']
    ]) {
      this.#patches.set(original, this[original])
      this[`_${original}`] = this[original].bind(this)
      this[original] = this[remapped]
    }
  }

  /**
   * Queues a command for execution.
   *
   * @param {Function} command - The command function to queue.
   *
   * @description
   * This method adds a command function to the `queuedCommands` array. The
   * queued commands can be executed later, potentially in a specific order or
   * under certain conditions.
   *
   * If the provided `command` argument is not a function, it is ignored and
   * not added to the queue.
   *
   * @example
   * // Queue a command
   * this.queueCommand(() => {
   *   console.log('Command executed')
   * })
   */
  queueCommand(command) {
    if (typeof command === 'function' || command instanceof Function) {
      this.queuedCommands.push(command)
    }
  }

  /**
   * Removes all event listeners attached to the component and its shadow DOM
   * elements.
   *
   * @description
   * This method iterates over the `#listeners` private field, which is a Map
   * containing event listeners registered for the component. For each event
   * name and its associated listeners, it checks if a selector is provided.
   * If a selector is provided, it queries the shadow root for elements
   * matching the selector and removes the event listener from each matched
   * element. If no selector is provided, it removes the event listener
   * directly from the component itself using the `_removeEventListener` method.
   *
   * This method effectively cleans up all event listeners attached to the
   * component and its shadow DOM elements, allowing for proper memory
   * management and preventing potential memory leaks.
   *
   * @example
   * // Attach event listeners
   * this.on('click', handleClick)
   * this.on('click', '.button', handleButtonClick)
   *
   * // Remove all event listeners
   * this.removeEventListeners()
   */
  removeEventListeners() {
    this.#listeners.forEach((listeners, eventName) => {
      listeners.forEach(({ selector, handler, options }) => {
        if (selector) {
          this.shadowRoot.querySelectorAll(selector).forEach(element => {
            element.removeEventListener(eventName, handler, options)
          })
        }
        else {
          this._removeEventListener(eventName, handler, options)
        }
      })
    })
  }

  /**
   * Renders the component by updating its shadow DOM.
   *
   * @description
   * This method is responsible for rendering the component by updating its
   * shadow DOM. It is called whenever the component's state or attributes
   * change, or when the component is initially connected to the DOM.
   *
   * By default, this method does nothing. Subclasses should override this
   * method to implement their own rendering logic, such as creating or
   * updating the shadow DOM, applying styles, and updating the component's
   * content.
   *
   * @example
   * // Override the `render` method in a subclass
   * class MyComponent extends WebComponentBase {
   *   render() {
   *     // Rendering logic here
   *     this.shadowRoot.innerHTML = this.template()
   *     this.applyStyles()
   *   }
   * }
   */
  render() {
  }

  /**
   * Sets multiple state properties at once and optionally updates the
   * corresponding attributes.
   *
   * @param {Object} stateUpdates - An object containing the state properties
   *   and their new values.
   * @param {boolean} [skipAttrSet=false] - Whether to skip updating the
   *   corresponding attributes for observed attributes.
   *
   * @description
   * This method allows setting multiple state properties at once by providing
   * an object with key-value pairs representing the state properties and their
   * new values. It iterates over the entries of the `stateUpdates` object and
   * updates the corresponding state properties using `this.#state.set(key, value)`.
   *
   * If the state property being updated is an observed attribute and
   * `skipAttrSet` is falsy (default), it also updates the corresponding
   * attribute on the component using `this.setAttribute(key, value)`.
   *
   * After updating the state and attributes, it calls the `render` method to
   * trigger a re-render of the component.
   *
   * @example
   * // Set multiple state properties and update attributes
   * this.setMultipleState({
   *   color: 'red',
   *   disabled: true,
   *   size: 'large'
   * })
   *
   * // Set multiple state properties without updating attributes
   * this.setMultipleState({ count: 42 }, true)
   */
  setMultipleState(stateUpdates, skipAttrSet = false) {
    for (const [key, value] of Object.entries(stateUpdates)) {
      this.#state.set(key, value)

      if (this.observedAttributes.includes(key) && !skipAttrSet) {
        this.setAttribute(key, value)
      }
    }

    this.render()
  }

  /**
   * Sets the value of a state property and optionally updates the
   * corresponding attribute.
   *
   * @param {string} key - The name of the state property to set.
   * @param {*} value - The new value for the state property.
   * @param {boolean} [skipAttrSet=false] - Whether to skip updating the
   *   corresponding attribute for observed attributes.
   *
   * @description
   * This method sets the value of a state property using the provided `key`
   * and `value`. It updates the internal state map (`this.#state`) with the
   * new value.
   *
   * If the `key` corresponds to an observed attribute and `skipAttrSet` is
   * falsy (default), it also updates the corresponding attribute on the
   * component using `this.setAttribute(key, value)`.
   *
   * After updating the state and attribute (if applicable), it calls the
   * `render` method to trigger a re-render of the component.
   *
   * @example
   * // Set the 'color' state property and update the 'color' attribute
   * this.setState('color', 'red')
   *
   * // Set the 'count' state property without updating any attribute
   * this.setState('count', 42, true)
   */
  setState(key, value, skipAttrSet = false) {
    this.#state.set(key, value)

    if (this.observedAttributes.includes(key) && !skipAttrSet)
      this.setAttribute(key, value)

    this.render()
  }

  /**
   * Returns the CSS styles for the component.
   *
   * @returns {string} The CSS styles for the component.
   *
   * @description
   * This method should be overridden in subclasses to provide the CSS styles
   * for the component. By default, it returns an empty string.
   *
   * @example
   * // Override the styles method in a subclass
   * styles() {
   *   return `
   *     :host {
   *       display: block;
   *       color: red;
   *     }
   *   `
   * }
   */
  styles() {
    return ''
  }

  /**
   * Returns the HTML template for the component.
   *
   * @returns {string} The HTML template for the component.
   *
   * @description
   * This method should be overridden in subclasses to provide the HTML
   * template for the component. By default, it returns an empty string.
   *
   * @example
   * // Override the template method in a subclass
   * template() {
   *   return `
   *     <div>
   *       <h1>Hello, World!</h1>
   *       <slot></slot>
   *     </div>
   *   `
   * }
   */
  template() {
    return ''
  }

  /**
   * Returns the string representation of the component instance.
   *
   * @returns {string} The string representation of the component instance.
   *
   * @description
   * This getter returns the string representation of the component instance,
   * which is the name of the component's constructor function.
   *
   * @example
   * const component = new MyComponent()
   * console.log(component.toString()) // Output: 'MyComponent'
   */
  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /**
   * Returns the list of observed attributes for the component.
   *
   * @returns {string[]} The list of observed attributes.
   *
   * @description
   * This getter returns the list of observed attributes for the component.
   * It delegates to the `observedAttributes` static getter defined on the
   * component's constructor function.
   *
   * @example
   * // Define observed attributes in a subclass
   * static get observedAttributes() {
   *   return ['color', 'disabled']
   * }
   *
   * const component = new MyComponent()
   * console.log(component.observedAttributes) // Output: ['color', 'disabled']
   */
  get observedAttributes() {
    return this.constructor.observedAttributes
  }

  /**
   * A Map object that stores attribute handlers for the component.
   *
   * @type {Map<string, Function>}
   *
   * @description
   * This Map object associates attribute names (keys) with handler functions
   * (values). When an observed attribute changes, the corresponding handler
   * function is called with the old and new values as arguments.
   *
   * @example
   * // Define an attribute handler for the 'color' attribute
   * this.attributeHandlers.set('color', (oldValue, newValue) => {
   *   // Handle color attribute changes
   * })
   */
  attributeHandlers = new Map()

  /**
   * An array that stores commands to be executed later.
   *
   * @type {Array}
   *
   * @description
   * This array is used to queue up commands or operations that need to be
   * executed at a later time. It can be useful for batching updates or
   * performing asynchronous operations.
   *
   * @example
   * // Queue a command to update the component's state
   * this.queuedCommands.push(() => {
   *   this.state.someProperty = 'new value'
   * })
   *
   * // Execute all queued commands
   * this.queuedCommands.forEach(command => command())
   * this.queuedCommands = []
   */
  queuedCommands = []

  /**
   * A reference to the component's shadow root.
   *
   * @type {ShadowRoot|null}
   *
   * @description
   * This property holds a reference to the component's shadow root, which
   * encapsulates the component's DOM tree and styles. It is initially set to
   * `null` and is assigned a value when the component is rendered.
   *
   * @example
   * // Access the shadow root
   * const shadowRoot = this.shadow
   *
   * // Render the component and create the shadow root
   * this.render()
   * console.log(this.shadow) // Output: ShadowRoot { ... }
   */
  shadow = null

  /**
   * A reference to the component's stylesheet.
   *
   * @type {HTMLStyleElement|null}
   *
   * @description
   * This property holds a reference to the component's stylesheet, which
   * contains the CSS styles for the component. It is initially set to `null`
   * and is assigned a value when the component is rendered.
   *
   * @example
   * // Access the stylesheet
   * const stylesheet = this.stylesheet
   *
   * // Render the component and create the stylesheet
   * this.render()
   * console.log(this.stylesheet) // Output: <style> ... </style>
   */
  stylesheet = null

  /**
   * A unique identifier for the component instance.
   *
   * @type {string}
   * @private
   *
   * @description
   * This private property holds a unique identifier for the component
   * instance, generated using `Math.random().toString(36).slice(2)`. It can
   * be useful for identifying and tracking individual component instances.
   *
   * @example
   * // Access the instance ID (not recommended)
   * const instanceId = this.#instanceId
   * console.log(instanceId) // Output: 'abcd1234'
   */
  #instanceId = Math.random().toString(36).slice(2)

  /**
   * A Map object that stores event listeners for the component.
   *
   * @type {Map<string, Array<{ selector?: string, handler: Function, options?: Object }>>}
   * @private
   *
   * @description
   * This private Map object associates event names (keys) with arrays of
   * event listener objects (values). Each event listener object can have the
   * following properties:
   *
   * - `selector` (optional): A CSS selector string to target specific
   *   elements within the component's shadow root.
   * - `handler`: The event handler function to be called when the event
   *   occurs.
   * - `options` (optional): An object containing options for the event
   *   listener, such as `capture` or `once`.
   *
   * @example
   * // Register a click event listener on the component itself
   * this.#listeners.set('click', [{ handler: this.handleClick }])
   *
   * // Register an input event listener on input elements within the component
   * this.#listeners.set('input', [{ selector: 'input', handler: this.handleInput }])
   */
  #listeners = new Map()

  /**
   * A Map object that stores patches for the component's state.
   *
   * @type {Map<string, Function>}
   * @private
   *
   * @description
   * This private Map object associates property names (keys) with patch
   * functions (values). Patch functions are used to modify the component's
   * state in a specific way, such as updating a nested object or performing
   * complex transformations.
   *
   * @example
   * // Define a patch function for the 'user' property
   * this.#patches.set('user', (state, newValue) => {
   *   return { ...state.user, ...newValue }
   * })
   *
   * // Apply the patch when updating the 'user' property
   * const patchFn = this.#patches.get('user')
   * if (patchFn) {
   *   this.state.user = patchFn(this.state, newUserData)
   * }
   */
  #patches = new Map()

  /**
   * A Map object that stores the component's state.
   *
   * @type {Map}
   * @private
   *
   * @description
   * This private Map object holds the component's state, which can include
   * properties, data, and other values that determine the component's
   * behavior and rendering.
   *
   * @example
   * // Access the component's state
   * const state = this.#state
   *
   * // Update the component's state
   * this.#state.set('count', 42)
   */
  #state = new Map()

  /**
   * Returns the list of observed attributes for the component.
   *
   * @returns {string[]} An empty array.
   *
   * @description
   * This static getter method returns an empty array, indicating that the
   * component does not observe any attributes by default. Subclasses can
   * override this method to specify the list of attributes to observe.
   *
   * @example
   * // Define observed attributes in a subclass
   * static get observedAttributes() {
   *   return ['color', 'disabled']
   * }
   */
  static get observedAttributes() {
    return []
  }
}

export default { WebComponentBase }