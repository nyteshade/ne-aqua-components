import { WebComponentBase } from './webcomponentbase.js';
import { Toolbelt } from './toolbelt.js';

const { measureText } = Toolbelt;

/**
 * The AquaButton class extends the WebComponentBase class and represents a
 * custom button element with an aqua-themed appearance.
 *
 * @extends WebComponentBase
 *
 * @example
 * const button = new AquaButton()
 * document.body.appendChild(button)
 *
 * @description
 * The AquaButton class is a custom web component that provides a button with
 * an aqua-themed appearance. It inherits from the WebComponentBase class and
 * adds additional functionality and styling specific to the AquaButton
 * component.
 *
 * The button's appearance can be customized through various CSS variables,
 * and its behavior can be modified by setting attributes or overriding
 * methods. The component also includes event handling for click events and
 * attribute changes.
 */
export class AquaButton extends WebComponentBase {
  /**
   * @private
   * @type {Function|null}
   * @description Holds a reference to the function that handles attribute
   *   changes. This is used internally to manage the lifecycle of the
   *   component and should not be accessed or modified directly.
   *
   * @example
   * // This property is managed internally by the component
   * this.#attributeFunction = (name, oldValue, newValue) => {
   *   // Handle attribute changes
   * }
   */
  #attributeFunction = null;

  /**
   * The constructor for the AquaButton class. This is called when a new
   * instance of the class is created.
   *
   * @example
   * const button = new AquaButton()
   *
   * @description
   * The constructor sets up the initial state of the button component. It
   * attaches a click event listener to the button that calls the
   * `defaultHandler` method. It also initializes the `variables` object with
   * various color values for the button's appearance in different states
   * (normal, hover, disabled, etc.). The `variables` object also includes
   * properties for the button's radius and hover transition.
   *
   * After setting up the `variables` object, the constructor calls the
   * `setColor` method with the result of `normalizedColorAttribute(true)` to
   * set the initial color of the button based on the `color` attribute.
   */
  constructor() {
    super()

    this.on('click', this.defaultHandler)

    this.variables = {
      aquaBlueTextColor: 'rgb(255,255,255)',
      aquaBlueTextShadow: '0px 1px 3px rgb(0 0 0/ 50%)',
      aquaBlueTop: 'rgb(75,95,146)',
      aquaBlueTopBorder: 'rgb(42, 61, 121)',
      aquaBlueBottomBorder: 'rgb(176, 212, 246)',
      aquaBlueBottom: 'rgb(189,226,252)',
      aquaBlueVerticalGradient: 'var(--aqua-blue-top), var(--aqua-blue-bottom)',
      aquaBlueTopBright: 'rgb(88,111,171)',
      aquaBlueBottomBright: 'rgb(191,229,255)',
      aquaBlueVerticalGradientBright:
        'var(--aqua-blue-top-bright), var(--aqua-blue-bottom-bright)',

      aquaGrayTextColor: 'rgb(98,98,98)',
      aquaGrayTextShadow: '0px 1px 3px rgb(255 255 255/ 50%)',
      aquaGrayTop: 'rgb(124,124,124)',
      aquaGrayBorderTop: 'rgb(124,124,124)',
      aquaGrayBorderBottom: 'rgb(126,125,124)',
      aquaGrayBottom: 'rgb(249,249,249)',
      aquaGrayVerticalGradient: 'var(--aqua-gray-top), var(--aqua-gray-bottom)',
      aquaGrayTopBright: 'rgb(148,148,148)',
      aquaGrayBottomBright: 'rgb(255,255,255)',
      aquaGrayVerticalGradientBright:
        'var(--aqua-gray-top-bright), var(--aqua-gray-bottom-bright)',

      buttonRadius: 'calc(var(--button-height) / 2)',
      buttonHoverTransition: 'none',
    }

    this.setColor(this.normalizedColorAttribute(true))
  }

  /**
   * Normalizes the `color` attribute value for the button.
   *
   * @param {boolean} [overrideOriginal=false] - If true, the normalized color
   *   value will also be set as the `color.original` state.
   * @returns {string} The normalized color value.
   *
   * @description
   * This method retrieves the `color` attribute value from the component and
   * normalizes it to a capitalized string. If no `color` attribute is set, it
   * defaults to 'Blue'. The normalized color value is then set as the `color`
   * state. If `overrideOriginal` is true, the normalized color value is also
   * set as the `color.original` state.
   *
   * @example
   * // Set the initial color state to 'Blue'
   * const initialColor = this.normalizedColorAttribute()
   *
   * // Set the initial color state to 'Red' and override the `color.original`
   * const initialColor = this.normalizedColorAttribute(true)
   */
  normalizedColorAttribute(overrideOriginal = false) {
    let base = this.getAttribute("color")
    let attr = base

    if (!base) {
      base = 'Blue'
    }

    base = base.charAt(0).toUpperCase() + base.toLowerCase().slice(1)

    if (attr)
      this.setState('color', base)

    if (overrideOriginal)
      this.setState('color.original', base)

    return base
  }

  /**
   * Handles changes to the `disabled` attribute.
   *
   * @param {*} _ - The previous value of the `disabled` attribute (unused).
   * @param {boolean|null} newValue - The new value of the `disabled` attribute.
   *
   * @description
   * This method is called whenever the `disabled` attribute changes. If the
   * new value is truthy, it sets the `disabled` state to true, sets the button
   * color to 'Gray', and adds the 'disabled' class to the button element. If
   * the new value is falsy, it sets the `disabled` state to false, restores
   * the button color to the `color.original` state, and removes the 'disabled'
   * class from the button element.
   *
   * If the component is not yet connected to the DOM, the corresponding
   * commands are queued and executed when the component is connected.
   */
  onDisabledChanged(_, newValue) {
    if (newValue !== null) {
      const command = () => this.elements.button.classList.add('disabled')
      this.setState("disabled", true, true)
      this.setColor('Gray')
      if (this.isConnected)
        command()
      else
        this.queueCommand(command)
    }
    else {
      const command = () => this.elements.button.classList.remove('disabled')
      this.setState("disabled", false, true)
      this.setColor(this.getState('color.original'))
      if (this.isConnected)
        command()
      else
        this.queueCommand(command)
    }
  }

  /**
   * Handles changes to the `handler` attribute.
   *
   * @param {*} _ - The previous value of the `handler` attribute (unused).
   * @param {string|null} newValue - The new value of the `handler` attribute.
   *
   * @description
   * This method is called whenever the `handler` attribute changes. If the new
   * value is not null, it creates a new function from the provided string and
   * assigns it to the `#attributeFunction` private property. If the new value
   * is null, it sets the `#attributeFunction` to null.
   *
   * The `#attributeFunction` is called when the button is clicked, unless it
   * is disabled.
   */
  onHandlerChanged(_, newValue) {
    if (newValue !== null)
      this.#attributeFunction = new Function('event', newValue)
    else
      this.#attributeFunction = null
  }

  /**
   * Handles changes to the `size` attribute.
   *
   * @param {*} _ - The previous value of the `size` attribute (unused).
   * @param {string|null} newValue - The new value of the `size` attribute.
   *
   * @description
   * This method is called whenever the `size` attribute changes. It calls the
   * `setSize` method with the new value to update the button's size.
   */
  onSizeChanged(_, newValue) {
    this.setSize(newValue)
  }

  /**
   * Handles the component being connected to the DOM.
   *
   * @description
   * This method is called when the component is connected to the DOM. It
   * performs the following tasks:
   *
   * 1. Calls the `connectedCallback` method of the parent class.
   * 2. Moves any content added to the component's body to the shadowRoot's
   *    content span.
   * 3. Measures the text content and sets various CSS variables based on the
   *    measured dimensions.
   * 4. Calls the `setSize` and `setColor` methods to apply the initial size
   *    and color styles.
   */
  connectedCallback() {
    // Handle any queued commands and render() once
    super.connectedCallback()

    // Move any content added to the component's body to the
    // shadowRoot's content span.
    this.childNodes.forEach(child => this.elements.content.append(child))

    const parent = this.elements.content
    const contentText = parent.innerText
    const { width, height } = measureText(contentText)
    const { variables } = this.styleManager

    variables.buttonTextWidth = `${width}px`
    variables.buttonTextHeight = `${height * 1.2}px`
    variables.buttonTextOrigHeight = variables.buttonTextHeight
    variables.buttonHeight = 'var(--button-text-height)'
    variables.buttonWidth = `calc(var(--button-height)) + ${width}px)`
    variables.buttonHoverTransition = 'all 0.1s ease-in-out'

    this.setSize(this.state.size)
    this.setColor(this.state.color)
  }

  /**
   * The default click handler for the button.
   *
   * @param {Event} event - The click event object.
   *
   * @description
   * This method is called when the button is clicked. If the button is not
   * disabled and the `#attributeFunction` is set, it calls the function with
   * the click event object. If an error occurs while executing the function,
   * it logs the error to the console.
   */
  defaultHandler(event) {
    const isDisabled = !!this.getState("disabled")

    if (this.#attributeFunction && !isDisabled) {
      try { this.#attributeFunction(event) }
      catch (error) { console.error('<aqua-button:error> %o', error) }
    }
  }

  /**
   * Returns an object containing references to various elements within the
   * component's shadowRoot.
   *
   * @returns {Object} An object with properties representing the various
   *   elements within the component's shadowRoot.
   *
   * @property {HTMLDivElement} button - The main button element.
   * @property {HTMLSpanElement} content - The span element containing the
   *   button's text content.
   * @property {HTMLDivElement} chrome - The inner chrome element.
   * @property {HTMLStyleElement} stylesheet - The style element containing
   *   the component's styles.
   */
  get elements() {
    const query = this.shadowRoot.querySelector.bind(this.shadowRoot)

    return {
      get button() { return query('div.aqua-button') },
      get content() { return query('div.aqua-button span.content') },
      get chrome() { return query('div.aqua-button div.inner-chrome') },
      get stylesheet() { return query('style') },
    }
  }

  /**
   * Sets the color of the button.
   *
   * @param {string} [color="Blue"] - The color to set the button to. Must be
   *   either 'Blue' or 'Gray'.
   *
   * @description
   * This method sets the color of the button by updating the `variables`
   * object with the appropriate color values for the specified color. If the
   * provided `color` is not 'Blue' or 'Gray', the method does nothing.
   */
  setColor(color = "Blue") {
    if (!['Blue', 'Gray'].includes(color)) {
      return
    }

    const { variables } = this

    this.variables = {
      buttonTextColor: variables[`aqua${color}TextColor`],
      buttonTextShadow: variables[`aqua${color}TextShadow`],
      buttonTop: variables[`aqua${color}Top`],
      buttonTopBorder: variables[`aqua${color}TopBorder`],
      buttonBottom: variables[`aqua${color}Bottom`],
      buttonBottomBorder: variables[`aqua${color}BottomBorder`],
      buttonVerticalGradient: variables[`aqua${color}VerticalGradient`],
      buttonVerticalGradientBright: variables[`aqua${color}VerticalGradientBright`],
    }
  }

  /**
   * Sets the size of the button.
   *
   * @param {string|null} [newValue=null] - The new size value for the button.
   *   Accepted values are 's', 'small', 'm', 'medium', 'l', 'large', 'xl',
   *   'x-large', 'extra-large', 'xxl', 'xx-large', 'extra-extra-large'.
   *
   * @description
   * This method sets the size of the button by updating the
   * `--button-text-height` CSS variable based on the provided `newValue`. If
   * `newValue` is null or undefined, the `--button-text-height` is reset to
   * its original value.
   */
  setSize(newValue = null) {
    let { variables } = this

    if (newValue !== null && newValue !== undefined) {
      switch (newValue.toLowerCase()) {
        case 's':
        case 'small':
          variables.buttonTextHeight = 'calc(var(--button-text-orig-height) * 0.7)'
          return
        case  'm':
        case 'medium':
        default:
          variables.buttonTextHeight = 'var(--button-text-orig-height)'
          return
        case  'l':
        case 'large':
          variables.buttonTextHeight = 'calc(var(--button-text-orig-height) * 1.5)'
          return
        case 'xl':
        case 'x-large':
        case 'extra-large':
          variables.buttonTextHeight = 'calc(var(--button-text-orig-height) * 2)'
          return
        case 'xxl':
        case 'xx-large':
        case 'extra-extra-large':
          variables.buttonTextHeight = 'calc(var(--button-text-orig-height) * 3)'
          return
      }
    }
    else
      variables.buttonTextHeight = 'var(--button-text-orig-height)';
  }

  /**
   * Returns the CSS styles for the AquaButton component.
   *
   * @returns {string} The CSS styles for the AquaButton component.
   *
   * @description
   * This method returns a template literal containing the CSS styles for the
   * AquaButton component. The styles include various CSS properties and
   * animations that define the appearance and behavior of the button.
   *
   * The CSS styles are defined using CSS variables, which allow for easy
   * customization of the button's appearance. The variables include properties
   * for the button's radius, text color, text shadow, top and bottom colors,
   * and vertical gradients.
   *
   * The styles also include an animation keyframe called 'throb', which
   * creates a pulsating effect on the button by transitioning between two
   * different vertical gradients.
   */
  styles() {
    return `
      /* css */

      * {
				box-sizing: border-box;
				scroll-behavior: smooth;
				text-rendering: optimizeLegibility;
				-webkit-font-smoothing: antialiased;
			}

      @property --button-radius {
        syntax: "<length>";
        inherits: true;
        initial-value: "10px"
      }

      @property --button-text-color {
        syntax: "<color>";
        inherits: true;
        initial-value: "transparent";
      }

      @property --button-text-shadow {
        syntax: "<length> <length> <length> <color>";
        inherits: false;
        initial-value: "0px 0px 0px transparent";
      }

      @property --button-top {
        syntax: "<color>";
        inherits: true;
        initial-value: "transparent";
      }

      @property --button-top-border {
        syntax: "<color>";
        inherits: true;
        initial-value: "transparent";
      }

      @property --button-bottom {
        syntax: "<color>";
        inherits: true;
        initial-value: "transparent";
      }

      @property --button-vertical-gradient {
        syntax: "<color>#";
        inherits: false;
        initial-value: "transparent";
      }

      @property --button-vertical-gradient-bright {
        syntax: "<color>#";
        inherits: false;
        initial-value: "transparent"
      }

      @property --button-text-width {
        syntax: "<length>";
        inherits: false;
        initial-value: "40px";
      }

      @property --button-text-height {
        syntax: "<length>";
        inherits: false;
        initial-value: "20px";
      }

      @property --button-height {
        syntax: "<length>";
        inherits: false;
        initial-value: "30px";
      }

      @property --button-width {
        syntax: "<length>";
        inherits: false;
        initial-value: "60px";
      }

      .aqua-button {
        background-image: linear-gradient(180deg, var(--button-vertical-gradient));
        border-bottom: 1px solid var(--button-bottom-border);
        border-radius: var(--button-radius);
        border-top: 1px solid var(--button-top-border);
        box-shadow: 0px 0px 3px rgb(0 0 0 / 50%);
        box-sizing: border-box;
        cursor: pointer;
        display: inline-flex;
        height: var(--button-height);
        justify-content: center;
        margin: 2px 2px;
        overflow: hidden;
        padding: 9px var(--button-radius) 11px;
        position: relative;
        transition: var(--button-hover-transition);
        user-select: none;
        width: calc(var(--button-text-width) + (var(--buttonRadius) * 2));

        &.disabled {
          cursor: not-allowed;
          opacity: 0.4;

          &:active {
            box-shadow: 0px 0px 3px rgb(0 0 0 / 50%);
            transition: none;
            animation: none;

            &:hover {
              background-image: linear-gradient(180deg, var(--button-vertical-gradient));
              border-top-color: var(--button-top-border);
              border-bottom-color: var(--button-bottom-border);
              animation: none;
              transition: none;

              .inner-chrome {
                box-shadow: none;
                transition: none;
              }

              &::before, &::after {
                background-image: linear-gradient(180deg, var(--button-vertical-gradient));
                transition: none;
                animation: none;
              }
            }
          }
        }

        &.primary {
          transition: all 1s ease;
          animation: throb 2s infinite alternate-reverse;

          &::before, &::after {
            animation: throb 2s infinite alternate-reverse;
          }
        }

        &::before {
          content: " ";
          position: absolute;
          background-image: linear-gradient(180deg, var(--button-vertical-gradient));
          left: 0px;
          top: 0px;
          height: 100%;
          border-radius: var(--button-radius);
          width: var(--button-height);
          clip-path: rect(0px var(--button-radius) 100% 0px);
          transition: var(--button-hover-transition);
        }

        &::after {
          content: " ";
          position: absolute;
          background-image: linear-gradient(180deg, var(--button-vertical-gradient));
          right: 0px;
          top: 0px;
          height: 100%;
          border-radius: var(--button-radius);
          width: var(--button-height);
          clip-path: rect(0px var(--button-height) 100% var(--button-radius));
          transition: var(--button-hover-transition);
        }

        & .content {
          color: var(--button-text-color);
          font-family: 'Tenorite Display', 'Grandview Display', 'Aptos Display';
          font-size: calc(var(--button-height) * 0.6 + 4pt);
          text-shadow: var(--button-text-shadow);
          display: inline-flex;
          align-self: center;
          position: relative;
          z-index: 2;
          transition: var(--button-hover-transition);
        }

        & .inner-chrome {
          display: flex;
          align-self: flex-start;
          justify-self: flex-start;
          position: absolute;
          left: 0px;
          top: -1px;
          width: 100%;
          height: calc(100% + 2px);
          box-sizing: border-box;
          border-radius: var(--button-radius);
          z-index: 1;
          transition: var(--button-hover-transition);

          &::before {
            content: "";
            position: absolute;
            width: 100%;
            height: 50%;
            left: 0;
            top: 0px;
            background: linear-gradient(180deg, rgb(255 255 255 / 50%), rgb(255 255 255 / 10%));
            clip-path: rect(0px calc(100% - 2px) var(--button-radius) 2px round calc(var(--button-radius)));
            transition: var(--button-hover-transition);
          }
        }

        &:active {
          box-shadow: 0px 0px 4px 1px rgb(255 255 255 / 30%), 0px 0px 4px 4px rgb(255 255 255 / 13%);
          transition: var(--button-hover-transition);
          animation: none;

          & .content {
            color: var(--button-text-color);
          }

          &:hover {
            background-image: linear-gradient(180deg, var(--button-vertical-gradient-bright));
            border-top-color: var(--button-top-border);
            border-bottom-color: var(--button-bottom-border);
            animation: none;
            transition: var(--button-hover-transition);

            .inner-chrome {
              box-shadow: 0px 3px 10px rgb(0 0 0 / 75%) inset;
              transition: var(--button-hover-transition);
            }

            &::before, &::after {
              background-image: linear-gradient(180deg, var(--button-vertical-gradient-bright));
              transition: var(--button-hover-transition);
              animation: none;
            }
          }
        }

        &:hover {
          background-image: linear-gradient(180deg, var(--button-vertical-gradient-bright));
          border-top-color: var(--button-top-border);
          border-bottom-color: var(--button-bottom-border);
          transition: var(--button-hover-transition);


          &::before, &::after {
            animation: none;
            background-image: linear-gradient(180deg, var(--button-vertical-gradient-bright));
            transition: var(--button-hover-transition);
          }
        }
      }

      @keyframes throb {
        0% {
          background-image: linear-gradient(180deg, var(--button-vertical-gradient));
          border-top-color: var(--button-top-border);
          border-bottom-color: var(--button-bottom-border);
          transition: all 2s ease;
        }
        100% {
          background-image: linear-gradient(180deg, var(--button-vertical-gradient-bright));
          border-top-color: var(--button-top-border);
          border-bottom-color: var(--button-bottom-border);
          transition: all 2s ease;
        }
      }

      /* !css */
    `
  }

  /**
   * Returns the HTML template for the AquaButton component.
   *
   * @returns {string} The HTML template for the AquaButton component.
   *
   * @description
   * The template consists of a div element with the class 'aqua-button',
   * which contains another div element with the class 'inner-chrome' and a
   * span element with the class 'content'. The 'inner-chrome' div is used
   * for creating a shaded effect on the button, while the 'content' span is
   * used to display the button's text content.
   *
   * @example
   * const template = button.template()
   * // template = '<div class="aqua-button"><div class="inner-chrome"></div><span class="content"></span></div>'
   */
  template() {
    return `
      <div class="aqua-button">
        <div class="inner-chrome"></div>
        <span class="content"></span>
      </div>
    `
  }

  /**
   * Returns the custom element name for the AquaButton component.
   *
   * @returns {string} The custom element name 'aqua-button'.
   *
   * @description
   * This static getter method returns the string 'aqua-button', which is
   * the name used to define and instantiate the AquaButton custom element.
   *
   * @example
   * const elementName = AquaButton.customElementName
   * // elementName = 'aqua-button'
   */
  static get customElementName() {
    return 'aqua-button'
  }

  /**
   * Returns an array of attribute names to observe for the AquaButton.
   *
   * @returns {string[]} An array of attribute names to observe.
   *
   * @description
   * This static getter method returns an array of attribute names that the
   * AquaButton component should observe for changes. The observed attributes
   * are 'color', 'disabled', 'handler', and 'size'.
   *
   * @example
   * const observedAttributes = AquaButton.observedAttributes
   * // observedAttributes = ['color', 'disabled', 'handler', 'size']
   */
  static get observedAttributes() {
    return ['color', 'disabled', 'handler', 'size']
  }

  /**
   * Defines the AquaButton custom element.
   *
   * @description
   * This static block defines the AquaButton custom element by calling the
   * `customElements.define` method with the custom element name and the
   * AquaButton class. This ensures that the AquaButton component can be used
   * as a custom HTML element in the web page.
   *
   * @example
   * // The AquaButton custom element is now defined and can be used like:
   * // <aqua-button>Click me</aqua-button>
   */
  static {
    customElements.define('aqua-button', AquaButton)
  }
}

export default { AquaButton }