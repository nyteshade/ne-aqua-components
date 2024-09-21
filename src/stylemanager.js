export class StyleManager {
  /**
   * Creates a new StyleManager instance.
   *
   * @param {HTMLElement} styleElement - The style element to manage.
   * @param {boolean} [useHost=false] - Whether to use the :host selector
   *   instead of :root. The :host selector is used to target the host
   *   element of a web component.
   *
   * @example
   * const styleElement = document.createElement('style')
   * const styleManager = new StyleManager(styleElement)
   *
   * @example
   * const styleElement = document.createElement('style')
   * const styleManager = new StyleManager(styleElement, true)
   */
  constructor(styleElement, useHost = false) {
    this.styleElement = styleElement

    this.selector = useHost ? ':host' : ':root'
    this.variables = this.buildVariablesProxy()
  }

  /**
   * Applies the StyleManager's variables to the given object.
   *
   * @param {Object} object - The object to apply the variables to.
   * @param {string} [as='variables'] - The property name to use for the
   *   variables on the object.
   * @returns {boolean} True if the variables were applied successfully,
   *   false otherwise.
   *
   * @example
   * const styleManager = new StyleManager(styleElement)
   * const myObject = {}
   * styleManager.applyVariablesTo(myObject)
   * console.log(myObject.variables) // Logs the StyleManager's variables
   *
   * @example
   * const styleManager = new StyleManager(styleElement)
   * const myObject = {}
   * styleManager.applyVariablesTo(myObject, 'css')
   * console.log(myObject.css) // Logs the StyleManager's variables
   */
  applyVariablesTo(object, as = 'variables') {
    if (!object || (typeof object !== 'object' && typeof object !== 'function'))
      return false

    const { variables } = this

    Object.defineProperty(object, as, {
      get() { return variables },
      set(value) {
        if (value && typeof value === 'object') {
          for (const [key, val] of Object.entries(value)) {
            if (key in variables && val === undefined)
              delete variables[key]
            else
              variables[key] = val
          }
        }
        return
      },
      enumerable: true,
      configurable: true,
    })

    return true
  }

  /**
   * Creates a proxy object that allows getting, setting, and checking for
   * the existence of CSS variables.
   *
   * @returns {Proxy} A proxy object that provides access to CSS variables.
   *
   * @example
   * const styleManager = new StyleManager(styleElement)
   * const primaryColor = styleManager.variables['--primary-color']
   * styleManager.variables['--primary-color'] = '#ff0000'
   * const hasPrimaryColor = '--primary-color' in styleManager.variables
   */
  buildVariablesProxy() {
    return Object.setPrototypeOf({}, new Proxy({}, {
      /**
       * Proxy handler for defining a new CSS property on the style element.
       *
       * @param {Object} target - The target object (not used).
       * @param {string} property - The name of the CSS property to define.
       * @param {Object} attributes - The property descriptor object.
       * @returns {Object} The result of calling Object.defineProperty().
       *
       * @example
       * const styleManager = new StyleManager(styleElement)
       * styleManager.variables.defineProperty(
       *   '--primary-color', { value: '#ff0000' }
       * )
       */
      defineProperty: (target, property, attributes) => {
        return Object.defineProperty(
          this.styleElement.style,
          property,
          attributes
        )
      },

      /**
       * Proxy handler for deleting a CSS variable.
       *
       * @param {Object} _ - The target object (not used).
       * @param {string} prop - The property key (CSS variable name) to delete.
       * @returns {boolean} True if the CSS variable was deleted, false
       * otherwise.
       *
       * @example
       * const styleManager = new StyleManager(styleElement);
       * const deleted = delete styleManager.variables['--primary-color'];
       */
      deleteProperty: (_, prop) => {
        return this.removeVariable(this.normalizeProp(prop))
      },

      /**
       * Proxy handler for getting a CSS variable value.
       *
       * @param {Object} _ - The target object (not used).
       * @param {string|Symbol} prop - The property key to get.
       * @returns {string|'StyleManager'} The CSS variable value or
       * 'StyleManager' if the property is Symbol.toStringTag.
       *
       * @example
       * const styleManager = new StyleManager(styleElement);
       * const primaryColor = styleManager.variables['--primary-color'];
       */
      get: (_, prop) => {
        if (prop === Symbol.toStringTag) {
          return 'StyleManager'
        }

        return this.getVariable(this.normalizeProp(prop))
      },

      /**
       * Proxy handler for getting the property descriptor of a CSS variable.
       *
       * @param {Object} _ - The target object (not used).
       * @param {string} prop - The property key to get the descriptor for.
       * @returns {Object|undefined} The property descriptor if the CSS
       * variable exists, undefined otherwise.
       *
       * @example
       * const styleManager = new StyleManager(styleElement);
       * const primaryColorDesc = Object.getOwnPropertyDescriptor(
       *   styleManager.variables, '--primary-color'
       * );
       */
      getOwnPropertyDescriptor: (_, prop) => {
        if (this.hasVariable(this.normalizeProp(prop))) {
          return {
            value: this.getVariable(this.normalizeProp(prop)),
            writable: true,
            enumerable: true,
            configurable: true
          }
        }
      },

      /**
       * Proxy handler for checking if a CSS variable exists.
       *
       * @param {Object} _ - The target object (not used).
       * @param {string} prop - The property key to check.
       * @returns {boolean} True if the CSS variable exists, false otherwise.
       *
       * @example
       * const styleManager = new StyleManager(styleElement);
       * const hasPrimaryColor = '--primary-color' in styleManager.variables;
       */
      has: (_, prop) => this.hasVariable(this.normalizeProp(prop)),

      /**
       * Proxy handler for getting the keys (CSS variable names) of the object.
       *
       * @returns {string[]} An array of CSS variable names.
       *
       * @example
       * const styleManager = new StyleManager(styleElement);
       * const variableNames = Object.keys(styleManager.variables);
       */
      ownKeys: () => this.getVariableNames(),

      /**
       * Proxy handler for setting a CSS variable value.
       *
       * @param {Object} _ - The target object (not used).
       * @param {string} prop - The property key to set.
       * @param {string} value - The value to set for the CSS variable.
       * @returns {boolean} Always returns true.
       *
       * @example
       * const styleManager = new StyleManager(styleElement);
       * styleManager.variables['--primary-color'] = '#ff0000';
       */
      set: (target, prop, value, receiver) => {
        this.setVariable(this.normalizeProp(prop), value)

        return true
      },
    }));
  }

  /**
   * Creates a new CSSStyleRule with the given selector in the associated
   * CSSStyleSheet and returns the created rule.
   *
   * @param {string} selector - The CSS selector for the new rule.
   * @returns {CSSStyleRule} The newly created CSSStyleRule object.
   *
   * @example
   * const newRule = styleManager.createRuleSet(':host')
   * newRule.style.setProperty('--host-color', '#000')
   */
  createRuleSet(selector) {
    const index = this.styleElement.sheet.cssRules.length
    this.styleElement.sheet.insertRule(`${selector} {}`, index)
    return this.styleElement.sheet.cssRules[index]
  }

  /**
   * Denormalizes a CSS property name from kebab-case to camelCase.
   *
   * @param {string} prop - The CSS property name to denormalize.
   * @returns {string} The denormalized CSS property name in camelCase.
   *
   * @example
   * const styleManager = new StyleManager(styleElement)
   * const denormalizedProp = styleManager.denormalizeProp('background-color')
   * console.log(denormalizedProp) // 'backgroundColor'
   */
  denormalizeProp(prop) {
    // Convert kebab-case to camelCase
    return prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
  }

  /**
   * Retrieves the CSSStyleRule object for the given selector from the
   * associated CSSStyleSheet.
   *
   * @param {string} selector - The CSS selector to search for.
   * @returns {CSSStyleRule|null} The CSSStyleRule object for the given
   * selector, or null if not found.
   *
   * @example
   * const ruleSet = styleManager.getRuleSet(':root')
   * if (ruleSet) {
   *   console.log(ruleSet.style.getPropertyValue('--primary-color'))
   * }
   */
  getRuleSet(selector) {
    if (!this.styleElement.isConnected)
      return null

    for (let i = 0; i < this.styleElement.sheet.cssRules.length; i++) {
      const rule = this.styleElement.sheet.cssRules[i]
      if (rule.selectorText === selector) {
        return rule
      }
    }
    return null
  }

  /**
   * Retrieves the value of a CSS variable from the associated style element.
   *
   * @param {string} name - The name of the CSS variable to retrieve, without
   *   the leading '--'.
   * @returns {string|null} The value of the CSS variable, or null if the
   *   variable is not defined.
   *
   * @example
   * const styleManager = new StyleManager(styleElement)
   * const primaryColor = styleManager.getVariable('primary-color')
   * console.log(primaryColor) // '#ff0000'
   */
  getVariable(name) {
    const ruleSet = this.getRuleSet(this.selector)
    return ruleSet
      ? ruleSet.style.getPropertyValue(`--${name}`).trim()
      : null
  }

  /**
   * Returns an array of all CSS variable names defined in the associated
   * style element.
   *
   * @returns {string[]} An array of CSS variable names, without the
   * leading '--' and converted from kebab-case to camelCase.
   *
   * @example
   * const styleManager = new StyleManager(styleElement)
   * const variableNames = styleManager.getVariableNames()
   * console.log(variableNames) // ['primaryColor', 'secondaryColor', ...]
   */
  getVariableNames() {
    const ruleSet = this.getRuleSet(this.selector)
    if (!ruleSet) return []

    return Array.from(ruleSet.style)
      .filter(prop => prop.startsWith('--'))
      .map(prop => this.denormalizeProp(prop.slice(2)))
  }

  /**
   * Checks if a CSS variable is defined in the associated style element.
   *
   * @param {string} name - The name of the CSS variable to check, without
   *   the leading '--'.
   * @returns {boolean} True if the CSS variable is defined, false otherwise.
   *
   * @example
   * const styleManager = new StyleManager(styleElement)
   * const hasPrimaryColor = styleManager.hasVariable('primary-color')
   * console.log(hasPrimaryColor) // true
   */
  hasVariable(name) {
    const ruleSet = this.getRuleSet(this.selector)
    return ruleSet
      ? ruleSet.style.getPropertyValue(`--${name}`) !== ''
      : false
  }

  /**
   * Normalizes a CSS property name to kebab-case.
   *
   * @param {string} prop - The CSS property name to normalize.
   * @returns {string} The normalized CSS property name in kebab-case.
   *
   * @example
   * const styleManager = new StyleManager(styleElement)
   * const normalizedProp = styleManager.normalizeProp('backgroundColor')
   * console.log(normalizedProp) // 'background-color'
   */
  normalizeProp(prop) {
    // Remove leading '--' if present
    prop = prop.startsWith('--') ? prop.slice(2) : prop

    // Convert camelCase to kebab-case
    return prop.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
  }

  /**
   * Removes a CSS variable from the associated style element.
   *
   * @param {string} name - The name of the CSS variable to remove, without
   * the leading '--'.
   * @returns {boolean} True if the variable was removed, false otherwise.
   *
   * @example
   * const styleManager = new StyleManager(styleElement)
   * const removed = styleManager.removeVariable('primary-color')
   */
  removeVariable(name) {
    const ruleSet = this.getRuleSet(this.selector)
    if (ruleSet) {
      ruleSet.style.removeProperty(`--${name}`)
      this.updateStyleElement()
      return true
    }
    return false
  }

  /**
   * Sets a CSS variable in the associated style element.
   *
   * @param {string} name - The name of the CSS variable to set, without the
   *   leading '--'.
   * @param {string} value - The value to set for the CSS variable.
   *
   * @example
   * const styleManager = new StyleManager(styleElement)
   * styleManager.setVariable('primary-color', '#ff0000')
   */
  setVariable(name, value) {
    const ruleSet = (
      this.getRuleSet(this.selector) ||
      this.createRuleSet(this.selector)
    )
    ruleSet.style.setProperty(`--${name}`, value)
    this.updateStyleElement()
  }

  /**
   * Returns an iterator over the key-value pairs of the CSS variables.
   *
   * This generator function uses the Symbol.iterator well-known symbol to
   * create an iterator that yields key-value pairs of the CSS variables
   * stored in the `variables` object. This allows you to iterate over the
   * variables using a `for...of` loop or other iteration constructs.
   *
   * @yields {[string, string]} A key-value pair representing a CSS variable
   * and its value.
   *
   * @example
   * const styleManager = new StyleManager(styleElement)
   * for (const [variable, value] of styleManager) {
   *   console.log(`${variable}: ${value}`)
   * }
   */
  *[Symbol.iterator]() {
    return Object.entries(this.variables)
  }

  /**
   * Returns the class name of the StyleManager instance.
   *
   * This getter uses the Symbol.toStringTag well-known symbol to return the
   * class name of the StyleManager instance. This can be useful for debugging
   * or logging purposes.
   *
   * @returns {string} The class name of the StyleManager instance.
   *
   * @example
   * const styleManager = new StyleManager(styleElement)
   * console.log(styleManager[Symbol.toStringTag]) // Outputs 'StyleManager'
   */
  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /**
   * Returns a string representation of the CSS rules in the style element.
   *
   * This method iterates over the CSS rules in the style element and
   * concatenates their cssText property values into a single string, with
   * each rule separated by a newline character.
   *
   * @returns {string} A string containing the CSS rules in the style element.
   *
   * @example
   * const styleManager = new StyleManager(styleElement)
   * const cssText = styleManager.toString()
   * console.log(cssText) // Outputs the CSS rules as a string
   */
  toString() {
    let cssText = ''
    for (let i = 0; i < this.styleElement.sheet.cssRules.length; i++) {
      cssText += this.styleElement.sheet.cssRules[i].cssText + '\n'
    }
    return cssText
  }

  /**
   * Updates the textContent of the associated style element with the
   * current CSS rules.
   *
   * @example
   * styleManager.setVariable('--primary-color', '#ff0000')
   * styleManager.updateStyleElement()
   */
  updateStyleElement() {
    this.styleElement.textContent = this.toString()
  }
}