import { WebComponentBase } from "./webcomponentbase.js";

export class AquaTrafficLight extends WebComponentBase {
  /**
   * Gets the div element representing the traffic light bulb.
   *
   * @returns {HTMLDivElement} The div element representing the traffic light
   *   bulb.
   */
  get bulb() {
    return this.shadowRoot.querySelector('div.aqua')
  }

  /**
   * Gets the current background color of the traffic light bulb.
   *
   * @returns {string|undefined} The current background color of the traffic
   *   light bulb, or undefined if no color is set.
   */
  get color() {
    return this.bulb.style.backgroundColor || undefined
  }

  /**
   * Sets the background color of the traffic light bulb.
   *
   * @param {string} value - The new background color for the traffic light
   *   bulb.
   */
  set color(value) {
    this.bulb.style.backgroundColor = value
  }

  /**
   * Gets the credit information for the traffic light code.
   *
   * @returns {string} The credit information for the traffic light code.
   */
  get credit() {
    return `
      Traffic light code taken and modified from the code pen by Massimo Selvi,
      found here: https://codepen.io/massimoselvi/details/YGrqNg. The gorgeous
      use of radial gradients really makes this shine. Added toggle and color
      capabilities to allow the stop lights to be easily used as leds to
      indicate status as well as to have thier sizes scaled easily.
    `
  }

  /**
   * Handles changes to the color attribute.
   *
   * @param {string} _ - The old value of the color attribute (not used).
   * @param {string} newValue - The new value of the color attribute.
   */
  onColorChanged(_, newValue) {
    const nVal = String(newValue)

    if (newValue !== null) {
      switch (nVal) {
        case 'red':
          this.color = '#f24443'
          return
        case 'yellow':
          this.color = '#f0aa5a'
          return
        case 'green':
          this.color = '#88be72'
          return
        default:
          this.color = newValue
      }
    }
    else {
      this.bulb.removeAttribute('id')
      this.bulb.style.backgroundColor = ''
    }
  }

  /**
   * Handles changes to the size attribute.
   *
   * @param {string} _ - The old value of the size attribute (not used).
   * @param {string} newValue - The new value of the size attribute.
   */
  onSizeChanged(_, newValue) {
    this.variables.size = newValue ?? '12px'
  }

  /**
   * Returns the HTML template for the traffic light component.
   *
   * @returns {string} The HTML template for the traffic light component.
   */
  template() {
    return `
      <!--html-->
      <div id="traffic-light">
        <div class="aqua"></div>
      </div>
      <!--!html-->
    `
  }

  /**
   * Toggles the traffic light bulb color.
   *
   * @param {string} [color] - The color to toggle the traffic light bulb to.
   *   If not provided, the color will toggle between the current color and
   *   the last color.
   * @returns {Function} A function that can be called to toggle the traffic
   *   light bulb color again.
   *
   * @example
   * // Toggle the traffic light bulb to green
   * const toggleGreen = trafficLight.toggle('green')
   *
   * // Toggle the traffic light bulb to the previous color
   * toggleGreen()
   */
  toggle(color) {
    switch (color) {
      case 'red':
        color = '#f24443'
        break
      case 'yellow':
        color = '#f0aa5a'
        break
      case 'green':
        color = '#88be72'
        break
    }

    let newColor = color ?? this.variables.lastColor ?? '#88be72'

    if (this.color) {
      this.variables.lastColor = this.color

      if (this.color === newColor || !color || newColor === this.variables.lastColor)
        this.color = ''
      else
        this.color = newColor
    }
    else {
      this.color = newColor
      this.variables.lastColor = newColor
    }

    return () => { this.toggle(newColor) }
  }

  /**
   * Returns the CSS styles for the traffic light component.
   *
   * @returns {string} The CSS styles for the traffic light component.
   */
  styles() {
    return `
      /*css*/
      @property --last-color {
        syntax: "<color>";
        inherits: true;
        initial-value: #88be72;
      }

      :host {
        --last-color: #88be72;
        --size: 12px;
      }

			#traffic-light {
				display: inline-flex;
			}

			#traffic-light .aqua {
				width: var(--size);
				height: var(--size);
				display: inline-block;
				background: #000;
				background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY3g9IjZweCIgY3k9IjE4cHgiIHI9IjUlIj48c3RvcCBvZmZzZXQ9IjQwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIgc3RvcC1vcGFjaXR5PSIwLjciLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZmZmZmYiIHN0b3Atb3BhY2l0eT0iMC4wIi8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkKSIgLz48L3N2Zz4g'), url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY3g9IjZweCIgY3k9Ii0xcHgiIHI9IjMlIj48c3RvcCBvZmZzZXQ9IjMzLjMzMzMzJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIgc3RvcC1vcGFjaXR5PSIwLjAiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPjwvc3ZnPiA=');
				background-image:
					radial-gradient(calc(var(--size) / 2) calc(var(--size) * 1.5), rgba(255, 255, 255, 0.7) calc(var(--size) / 6), rgba(255, 255, 255, 0) calc(var(--size) * (5 / 12))),
					radial-gradient(calc(var(--size) / 2) calc(var(--size) * (-1 / 12)), #ffffff calc(var(--size) * (1 / 12)), rgba(255, 255, 255, 0) calc(var(--size) / 4));
				background-image:
					-webkit-radial-gradient(calc(var(--size) / 2) calc(var(--size) * 1.5), rgba(255, 255, 255, 0.7) calc(var(--size) / 6), rgba(255, 255, 255, 0) calc(var(--size) * (5 / 12))),
					-webkit-radial-gradient(calc(var(--size) / 2) calc(var(--size) * (-1 / 12)), #ffffff calc(var(--size) * (1 / 12)), rgba(255, 255, 255, 0) calc(var(--size) / 4));
				box-shadow: rgba(0, 0, 0, .9) 0 calc(var(--size) * (1 / 12)) calc(var(--size) / 3) inset, rgba(255, 255, 255, .5) 0 calc(var(--size) * (1 / 12));
				border-radius: 100px;
			}
      /*!css*/
    `
  }

  /**
   * Returns the list of observed attributes for the traffic light component.
   *
   * @returns {string[]} The list of observed attributes.
   */
  static get observedAttributes() {
    return ['color', 'size']
  }

  static {
    customElements.define('aqua-trafficlight', AquaTrafficLight);
  }
}