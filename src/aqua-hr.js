import { WebComponentBase } from './webcomponentbase.js';

export class AquaHorizontalRule extends WebComponentBase {
  connectedCallback() {
    super.connectedCallback();

    this.variables.hrRadius = 'calc((var(--hr-height) / 2) + 2px)';
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    const name = attrName.toLowerCase();

    if (name === 'width') {
      this.variables.hrWidth = newValue !== null ? newValue : '100%';
    }

    if (name === 'height') {
      this.variables.hrHeight = newValue !== null ? newValue : '6px';
    }

    if (name === 'margin') {
      if (String(newValue).toLowerCase() === "none") {
        this.variables.hrMargin = '0';
      }
      else if (newValue !== null && newValue !== undefined) {
        this.variables.hrMargin = newValue;
      }
      else {
        this.variables.hrMargin = '0.3em 0 0.5em';
      }
    }
  }

  template() {
    return `<div class="aqua-hr"></div>`
  }

  styles() {
    return `
      /*css*/
      * {
				box-sizing: border-box;
				scroll-behavior: smooth;
				text-rendering: optimizeLegibility;
				-webkit-font-smoothing: antialiased;
			}

      @property --hr-width {
        syntax: "<length>";
        inherits: true;
        initial-value: "100%";
      }

      @property --hr-height {
        syntax: "<length>";
        inherits: true;
        initial-value: "0.2em";
      }

      @property --hr-radius {
        syntax: "<length>";
        inherits: true;
        initial-value: "5px";
      }

      @property --hr-margin {
        syntax: "<length> | <length> <length> | <length> <length> <length> | <length> <length> <length> <length> | none";
        inherits: true;
        initial-value: "0.3em 0 0.5em";
      }

      :host {
        --hr-width: 100%;
        --hr-height: 6px;
        --hr-radius: 5px;
        --hr-margin: 0.1em 0 0.4em;
      }

      .aqua-hr {
        display: flex;
        position: relative;
        width: var(--hr-width);
        height: var(--hr-height);
        border-radius: var(--hr-radius);
        border: 1px solid rgb(38,85,169);
        background-image: linear-gradient(
          rgb(170,193,225),
          rgb(190,211,237),
          rgb(133,174,233),
          rgb(167,205,251),
          rgb(198,237,252)
        );
        box-shadow: 0px 1px 2px 0px rgba(111,111,111,0.33);
        margin: var(--hr-margin);
        transition: all 0.1s ease;
      }
      /*!css*/
    `
  }

  static get observedAttributes() {
    return ['width', 'height', 'margin'];
  }

  static {
    customElements.define('aqua-hr', AquaHorizontalRule);
  }
}
