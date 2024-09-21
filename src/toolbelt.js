export class Toolbelt {
  /**
   * Provides the name of the Aqua Web Components Toolbelt.
   *
   * @returns {string} The name of the Aqua Web Components Toolbelt.
   */
  get name() {
    return 'Aqua Web Components Toolbelt'
  }

  /**
   * Provides a description of the Aqua Web Components Toolbelt.
   *
   * @returns {string} A description of the Aqua Web Components Toolbelt.
   */
  get description() {
    return `Commonly used functions in this library`
  }

  /**
   * Returns the string representation of the Toolbelt object.
   *
   * This getter method overrides the default `toString` behavior by returning
   * the string 'Toolbelt' when the object is coerced to a string. This can be
   * useful for debugging or logging purposes, as it provides a more
   * descriptive representation of the object.
   *
   * @returns {string} The string 'Toolbelt'.
   *
   * @example
   * const toolbelt = new Toolbelt();
   * console.log(`Object: ${toolbelt}`); // Output: Object: Toolbelt
   */
  get [Symbol.toStringTag]() {
    return 'Toolbelt'
  }

  /**
   * Converts a string from kebab-case to camelCase if it is in kebab-case,
   * otherwise returns the original string.
   *
   * @param {string} str - The string to convert.
   * @returns {string} The converted string in camelCase if the input was in
   *   kebab-case, otherwise the original string.
   *
   * @example
   * const kebabStr = 'hello-world';
   * const camelStr = Toolbelt.camelIfKebab(kebabStr);
   * console.log(camelStr); // Output: 'helloWorld'
   *
   * @example
   * const alreadyCamelStr = 'helloWorld';
   * const stillCamelStr = Toolbelt.camelIfKebab(alreadyCamelStr);
   * console.log(stillCamelStr); // Output: 'helloWorld'
   */
  static camelIfKebab(str, upperCaseFirst = false) {
    let string = Toolbelt.isKebabCase(str)
      ? Toolbelt.kebabToCamelCase(str)
      : str;

    if (upperCaseFirst) {
      string = `${string.charAt(0).toUpperCase()}${string.slice(1)}`
    }

    return string
  }

  /**
   * Converts a string from camelCase to kebab-case.
   *
   * @param {string} str - The string to convert.
   * @returns {string} The converted string in kebab-case.
   *
   * @example
   * const camelStr = 'helloWorld';
   * const kebabStr = Toolbelt.camelToKebabCase(camelStr);
   * console.log(kebabStr); // Output: 'hello-world'
   */
  static camelToKebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  }

  /**
   * Checks if a given string is in camelCase format.
   *
   * @param {string} str - The string to check.
   * @returns {boolean} True if the string is in camelCase, false otherwise.
   *
   * @example
   * const camelStr = 'helloWorld';
   * const isValidCamel = Toolbelt.isCamelCase(camelStr);
   * console.log(isValidCamel); // Output: true
   */
  static isCamelCase(str) {
    if (!str || str.length === 0)
      return false

    if (str[0] !== str[0].toLowerCase())
      return false

    if (str.includes(' '))
      return false

    if (!/[A-Z]/.test(str.slice(1)))
      return false

    if (!/^[a-zA-Z]+$/.test(str))
      return false

    return true
  }

  /**
   * Checks if a given string is in kebab-case format.
   *
   * @param {string} str - The string to check.
   * @returns {boolean} True if the string is in kebab-case, false otherwise.
   *
   * @example
   * const kebabStr = 'hello-world';
   * const isValidKebab = Toolbelt.isKebabCase(kebabStr);
   * console.log(isValidKebab); // Output: true
   */
  static isKebabCase(str) {
    const kebabCaseRegex = /^[a-z]+(-[a-z]+)*$/
    return kebabCaseRegex.test(str)
  }

  /**
   * Converts a string to kebab-case if it is in camelCase format.
   *
   * @param {string} str - The string to convert.
   * @returns {string} The converted string in kebab-case if it was in
   *   camelCase, or the original string if it was not in camelCase.
   *
   * @example
   * const camelStr = 'helloWorld';
   * const kebabStr = Toolbelt.kebabIfCamel(camelStr);
   * console.log(kebabStr); // Output: 'hello-world'
   *
   * const alreadyKebab = 'hello-world';
   * const stillKebab = Toolbelt.kebabIfCamel(alreadyKebab);
   * console.log(stillKebab); // Output: 'hello-world'
   */
  static kebabIfCamel(str) {
    return Toolbelt.isCamelCase(str) ? Toolbelt.camelToKebabCase(str) : str
  }

  /**
   * Converts a kebab-case string to camelCase.
   *
   * @param {string} str - The kebab-case string to convert.
   * @returns {string} The converted camelCase string.
   *
   * @example
   * const kebabStr = 'hello-world'
   * const camelStr = Toolbelt.kebabToCamelCase(kebabStr)
   * console.log(camelStr) // Output: 'helloWorld'
   *
   * @description
   * This function first converts the input string to lowercase. It then
   * removes any leading and trailing hyphens using regular expressions.
   * Finally, it replaces each hyphen followed by a lowercase letter with
   * the uppercase version of that letter, effectively converting the
   * kebab-case string to camelCase.
   */
  static kebabToCamelCase(str) {
    return (str
      .toLowerCase()
      .replace(/^-+/, '')
      .replace(/-+$/, '')
      .replace(/-([a-z])/g, function (g) { return g[1].toUpperCase() })
    );
  }

  /**
   * Measures the dimensions of a given text string with optional styles.
   *
   * This function creates a temporary DOM element, applies the provided styles,
   * renders the text, measures its dimensions, and then removes the temporary
   * element. This allows for accurate measurement of text dimensions without
   * affecting the visible DOM.
   *
   * @param {string} text - The text string to measure.
   * @param {Object} [options={}] - An object containing optional styles to
   *   apply to the text.
   * @param {HTMLElement} [options.parent] - The parent element to append the
   *   temporary measurement element to. If not provided, the document.body is
   *   used.
   * @returns {Object} An object with `width` and `height` properties
   *   representing the measured dimensions of the text.
   *
   * @example
   * const dimensions = Toolbelt.measureText('Hello, World!');
   * console.log(dimensions.width); // Outputs the width of 'Hello, World!'
   *
   * @example
   * const dimensions = Toolbelt.measureText('Bold Text', {
   *   fontWeight: 'bold',
   *   fontSize: '16px'
   * });
   * console.log(dimensions.height); // Outputs the height of 'Bold Text'
   */
  static measureText(text, options = {}) {
    const container = document.createElement('div')
    container.style.visibility = 'hidden'
    container.style.overflow = 'hidden'
    container.style.position = 'absolute'
    container.style.width = '0'
    container.style.height = '0'

    const span = document.createElement('span')
    span.style.whiteSpace = 'pre'
    span.style.color = 'transparent'

    Object.assign(span.style, options)

    span.textContent = text
    container.appendChild(span)

    const parentElement = (
      options?.parent?.isConnected &&
      options?.parent?.appendChild &&
      options?.parent?.removeChild
    ) ? options.parent : document.body

    parentElement.appendChild(container)

    const { width, height } = span.getBoundingClientRect()

    parentElement.removeChild(container)

    return { width, height }
  }
}