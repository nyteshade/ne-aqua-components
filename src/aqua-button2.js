import { WebComponentBase } from "./webcomponentbase.js";

export class AquaButton2 extends WebComponentBase {
  styles() {
    return `
      /*css*/

      :host {
        --hue: 190deg;
        --sat: 50%;
        --blur: 0px;  /* 0-10 increments of 0.2 */
        --hue2: calc(var(--hue) + 60deg);
        --sat2: calc(var(--sat) + 10%);
        --clr: hsl(var(--hue) var(--sat) 90%);
        --clr2: hsl(var(--hue2) var(--sat2) 85%);
        --text: hsla(var(--hue), 70%, 10%, .9);
        --gradoffset: 45%;
        --gradgap: 30%;
      }


      button {
        background-color: var(--clr);
        background-image: linear-gradient(180deg,
          var(--clr2) var(--gradgap),
          transparent calc(100% - var(--gradgap))
        );
        background-position: center var(--gradoffset);
        background-repeat: no-repeat;
        background-size: 100% 200%;
        border-radius: 2em;
        border: none;
        box-shadow:
          0 -0.5em 0.5em transparent,
          0 0.5em 0.5em transparent,
          0 0.25em 0.3em -0.2em hsla(var(--hue), var(--sat), 50%, 0.46),
          0 0.25em 0.75em hsla(var(--hue), calc(var(--sat) - 10%), 40%, 0.3);
        color: var(--text);
        font-size: 3vw;
        font-weight: 500;
        letter-spacing: -0.025em;
        outline: none;
        padding: 1.1em 1.5em;
        position: relative;
        transition: all 0.33s ease;
        transition: all 0.5s ease;

        &:active, &:focus {
          span,
          svg:not(.spinner) {
            transform: translateY(-1em);
            /* opacity: 0; */
            filter: blur(5px);
          }
        }

        &::before, &::after {
          content: "";
          inset: 0;
          position: absolute;
          border-radius: 5em;
        }

        // darkening
        &::before {
          background-image:
            radial-gradient(ellipse,
              hsla(var(--hue), 100%, 90%, .8) 20%,
              transparent 50%,
              transparent 200%
            ),
            linear-gradient(90deg,
              hsl(0deg, 0%, 25%) -10%,
              transparent 30%,
              transparent 70%,
              hsl(0deg, 0%, 25%) 110%
            );
          box-shadow:
            inset 0 .25em .75em hsla(0deg, 0%, 0%, 0.8),
            inset 0 -.05em .2em rgba(255, 255, 255, 0.4),
            inset 0 -1px 3px hsla(var(--hue), 80%, 50%, .75);
          background-blend-mode: overlay;
          background-repeat: no-repeat;
          background-size: 200% 80%, cover;
          background-position: center 220%;
          mix-blend-mode: overlay;
          filter: blur(calc(var(--blur) * 0.5));
        }

        // reflection
        &::after {
          background: linear-gradient(
            180deg,
            hsla(var(--hue2),100%,90%,.9),
            hsla(var(--hue2),calc(var(--sat2)*0.7),50%,.75) 40%,
            transparent 80%
          );
          top: 0.075em;
          left: 0.75em;
          right: 0.75em;
          bottom: 1.4em;
          filter: blur(var(--blur));
          mix-blend-mode: screen;
        }

        &:hover,
        &:active,
        &:focus {
          outline: none;
          box-shadow:
            0 -0.2em 1em hsla(var(--hue2), 70%, 80%, 0.3),
            0 0.5em 1.5em hsla(var(--hue), 70%, 80%, 0.5),
            0 0.25em 0.3em -0.2em hsl(var(--hue) 90% 70%),
            0 0.25em 0.5em hsla(var(--hue),20%,30%, 0.2),
            inset 0 -2px 2px rgba(255,255,255,0.2);
          background-position: center calc( var(--gradoffset) - 0.75em );
        }

      }

      /*!css*/
    `
  }

  template() {
    return `
      <!--html-->
      <button>
        <span>
          Aqua button
        </span>
      </button>
      <!--!html-->
    `
  }

  static {
    customElements.define('aqua-button2', AquaButton2);
  }
}