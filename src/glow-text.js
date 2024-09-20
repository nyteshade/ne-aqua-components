import { WebComponentBase } from "./webcomponentbase.js";

export class GlowText extends WebComponentBase {
  connectedCallback() {
    super.connectedCallback()

    const span = this.shadowRoot.querySelector('span');
    span.dataset.text = this.textContent;
    [...this.childNodes].forEach(child => span.append(child))
  }

  get credits() {
    return `
      The code for this web component was lifted, only somewhat successfully,
      from the code pen: https://codepen.io/RAFA3L/pen/YzomKrR?editors=1100

      All credit is due to that author for creating the effect. I just put it
      into a web component.
    `
  }

  template() {
    return `
      <!--html-->
      <span class="glow-filter"></span>
      <svg class="filters" width='1440px' height='300px' viewBox='0 0 1440 300' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <filter id="glow-4" color-interpolation-filters="sRGB" x="-50%" y="-200%" width="400%" Height="1000%">
            <feGaussianBlur in="SourceGraphic" data-target-blur="4" stdDeviation="4" result="blur4"/>
            <feGaussianBlur in="SourceGraphic" data-target-blur="19" stdDeviation="19" result="blur19"/>
            <feGaussianBlur in="SourceGraphic" data-target-blur="9" stdDeviation="9" result="blur9"/>
            <feGaussianBlur in="SourceGraphic" data-target-blur="30" stdDeviation="30" result="blur30"/>
            <feColorMatrix in="blur4" result="color-0-blur" type="matrix" values="
              1 0 0 0 0
              0 0.9803921568627451 0 0 0
              0 0 0.9647058823529412 0 0
              0 0 0 0.8 0"/>
            <feOffset in="color-0-blur" result="layer-0-offsetted" dx="0" dy="0" data-target-offset-y="0"/>
            <feColorMatrix in="blur19" result="color-1-blur" type="matrix" values="0.8156862745098039 0 0 0 0
              0 0.49411764705882355 0 0 0
              0 0 0.2627450980392157 0 0
              0 0 0 1 0"/>
            <feOffset in="color-1-blur" result="layer-1-offsetted" dx="0" dy="2" data-target-offset-y="2"/>
            <feColorMatrix in="blur9" result="color-2-blur" type="matrix" values="1 0 0 0 0
              0 0.6666666666666666 0 0 0
              0 0 0.36470588235294116 0 0
              0 0 0 0.65 0"/>
            <feOffset in="color-2-blur" result="layer-2-offsetted" dx="0" dy="2" data-target-offset-y="2"/>
            <feColorMatrix in="blur30" result="color-3-blur" type="matrix" values="1 0 0 0 0
              0 0.611764705882353 0 0 0
              0 0 0.39215686274509803 0 0
              0 0 0 1 0"/>
            <feOffset in="color-3-blur" result="layer-3-offsetted" dx="0" dy="2" data-target-offset-y="2"/>
            <feColorMatrix in="blur30" result="color-4-blur" type="matrix" values="0.4549019607843137 0 0 0 0
              0 0.16470588235294117 0 0 0
              0 0 0 0 0
              0 0 0 1 0"/>
            <feOffset in="color-4-blur" result="layer-4-offsetted" dx="0" dy="16" data-target-offset-y="16"/>
            <feColorMatrix in="blur30" result="color-5-blur" type="matrix" values="0.4235294117647059 0 0 0 0
              0 0.19607843137254902 0 0 0
              0 0 0.11372549019607843 0 0
              0 0 0 1 0"/>
            <feOffset in="color-5-blur" result="layer-5-offsetted" dx="0" dy="64" data-target-offset-y="64"/>
            <feColorMatrix in="blur30" result="color-6-blur" type="matrix" values="0.21176470588235294 0 0 0 0
              0 0.10980392156862745 0 0 0
              0 0 0.07450980392156863 0 0
              0 0 0 1 0"/>
            <feOffset in="color-6-blur" result="layer-6-offsetted" dx="0" dy="64" data-target-offset-y="64"/>
            <feColorMatrix in="blur30" result="color-7-blur" type="matrix" values="0 0 0 0 0
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 0.68 0"/>
            <feOffset in="color-7-blur" result="layer-7-offsetted" dx="0" dy="64" data-target-offset-y="64"/>
            <feMerge>
              <feMergeNode in="layer-0-offsetted"/>
              <feMergeNode in="layer-1-offsetted"/>
              <feMergeNode in="layer-2-offsetted"/>
              <feMergeNode in="layer-3-offsetted"/>
              <feMergeNode in="layer-4-offsetted"/>
              <feMergeNode in="layer-5-offsetted"/>
              <feMergeNode in="layer-6-offsetted"/>
              <feMergeNode in="layer-7-offsetted"/>
              <feMergeNode in="layer-0-offsetted"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    <!--!html-->
    `
  }

  styles() {
    return `
      /*css*/
      :host {
        --from-color: #dfe5ee;
        --to-color: #fffaf6;
        --base-color: #fffaf6;

        font-size: calc(var(--_size) * 0.032);
        --_factor: min(1000px, 100vh);
        --_size: min(var(--_factor), 100vw);


        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      svg.filters {
        display: none;
      }

      * {
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
        scroll-behavior: smooth;
      }

      .glow-filter{
          position: relative;
          display: inline-block;
          scale: 1;

          animation: onloadscale 1s ease-out forwards;
      }

      .glow-filter::before{
          content: attr(data-text);
          position: absolute;
          pointer-events: none;
          color:  #fffaf6;
          background: linear-gradient(0deg, var(--from-color) 0%, var(--to-color) 50%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: url(#glow-4);

          opacity: 0;
          animation: onloadopacity 1s ease-out forwards;
      }

      @keyframes onloadscale {
          24% { scale: 1; }
          100% { scale: 1.02; }
      }
      @keyframes onloadopacity {
          24% { opacity: 0; }
          100% { opacity: 1; }
      }
      /*!css*/
    `
  }

  static get observedAttributes() {
    return ['from', 'to', 'font-size']
  }

  static {
    customElements.define('glow-text', GlowText);
  }
}