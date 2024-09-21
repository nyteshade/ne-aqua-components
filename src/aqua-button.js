import { WebComponentBase } from './webcomponentbase.js';
import { Toolbelt } from './toolbelt.js';

const { measureText } = Toolbelt;

export class AquaButton extends WebComponentBase {
  #attributeFunction = null;

  constructor() {
    super();

    this.on('click', this.defaultHandler);

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
      aquaBlueVerticalGradientBright: 'var(--aqua-blue-top-bright), var(--aqua-blue-bottom-bright)',

      aquaGrayTextColor: 'rgb(98,98,98)',
      aquaGrayTextShadow: '0px 1px 3px rgb(255 255 255/ 50%)',
      aquaGrayTop: 'rgb(124,124,124)',
      aquaGrayBorderTop: 'rgb(124,124,124)',
      aquaGrayBorderBottom: 'rgb(126,125,124)',
      aquaGrayBottom: 'rgb(249,249,249)',
      aquaGrayVerticalGradient: 'var(--aqua-gray-top), var(--aqua-gray-bottom)',
      aquaGrayTopBright: 'rgb(148,148,148)',
      aquaGrayBottomBright: 'rgb(255,255,255)',
      aquaGrayVerticalGradientBright: 'var(--aqua-gray-top-bright), var(--aqua-gray-bottom-bright)',

      buttonRadius: 'calc(var(--button-height) / 2)',
      buttonHoverTransition: 'none',
    }

    this.setColor(this.normalizedColorAttribute(true));
  }

  normalizedColorAttribute(overrideOriginal = false)  {
    let base = this.getAttribute("color")
    let attr = base;

    if (!base) {
      base = 'Blue';
    }

    base = base.charAt(0).toUpperCase() + base.toLowerCase().slice(1)

    if (attr)
      this.setState('color', base);

    if (overrideOriginal)
      this.setState('color.original', base);

    return base
  }

  onDisabledChanged(_, newValue) {
    if (newValue !== null) {
      const command = () => this.elements.button.classList.add('disabled');
      this.setState("disabled", true, true);
      this.setColor('Gray');
      if (this.isConnected)
        command();
      else
        this.queueCommand(command);
    }
    else {
      const command = () => this.elements.button.classList.remove('disabled');
      this.setState("disabled", false, true);
      this.setColor(this.getState('color.original'));
      if (this.isConnected)
        command();
      else
        this.queueCommand(command);
    }
  }

  onHandlerChanged(_, newValue) {
    if (newValue !== null)
      this.#attributeFunction = new Function('event', newValue);
    else
      this.#attributeFunction = null;
  }

  onSizeChanged(_, newValue) {
    this.setSize(newValue);
  }

  connectedCallback() {
    // Handle any queued commands and render() once
    super.connectedCallback();

    // Move any content added to the component's body to the
    // shadowRoot's content span.
    this.childNodes.forEach(child => this.elements.content.append(child));

    const parent = this.elements.content;
    const contentText = parent.innerText;
    const { width, height } = measureText(contentText);
    const { variables } = this.styleManager;

    variables.buttonTextWidth = `${width}px`;
    variables.buttonTextHeight = `${height * 1.2}px`;
    variables.buttonTextOrigHeight = variables.buttonTextHeight;
    variables.buttonHeight = 'var(--button-text-height)';
    variables.buttonWidth = `calc(var(--button-height)) + ${width}px)`;
    variables.buttonHoverTransition = 'all 0.1s ease-in-out';

    this.setSize(this.state.size);
    this.setColor(this.state.color);
  }

  defaultHandler(event) {
    const isDisabled = !!this.getState("disabled")

    if (this.#attributeFunction && !isDisabled) {
      try { this.#attributeFunction(event) }
      catch (error) { console.error('<aqua-button:error> %o', error) }
    }
  }

  get elements() {
    const query = this.shadowRoot.querySelector.bind(this.shadowRoot);

    return {
      get button() { return query('div.aqua-button') },
      get content() { return query('div.aqua-button span.content') },
      get chrome() { return query('div.aqua-button div.inner-chrome') },
      get stylesheet() { return query('style') },
    }
  }

  setColor(color = "Blue") {
    if (!['Blue', 'Gray'].includes(color)) {
      return;
    }

    const { variables } = this;

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

  setSize(newValue = null) {
    let { variables } = this;

    if (newValue !== null && newValue !== undefined) {
      switch (newValue.toLowerCase()) {
        case 's':
        case 'small':
          variables.buttonTextHeight = 'calc(var(--button-text-orig-height) * 0.7)'
          return;
        case  'm':
        case 'medium':
        default:
          variables.buttonTextHeight = 'var(--button-text-orig-height)'
          return;
        case  'l':
        case 'large':
          variables.buttonTextHeight = 'calc(var(--button-text-orig-height) * 1.5)';
          return;
        case 'xl':
        case 'x-large':
        case 'extra-large':
          variables.buttonTextHeight = 'calc(var(--button-text-orig-height) * 2)';
          return;
        case 'xxl':
        case 'xx-large':
        case 'extra-extra-large':
          variables.buttonTextHeight = 'calc(var(--button-text-orig-height) * 3)';
          return;
      }
    }
    else
      variables.buttonTextHeight = 'var(--button-text-orig-height)';
  }

  styles() {
    return `/*css*/
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
    /*!css*/`
  }

  template() {
    return `
      <div class="aqua-button">
			  <div class="inner-chrome"></div>
			  <span class="content"></span>
		  </div>
    `;
  }

  static get customElementName() {
    return 'aqua-button'
  }

  static get observedAttributes() {
    return ['color', 'disabled', 'handler', 'size'];
  }

  static {
    console.log('Defining <aqua-button>')
    customElements.define('aqua-button', AquaButton)
  }
}

export default { AquaButton }