export class StyleManager {
  constructor(styleElement, useHost = false) {
    this.styleElement = styleElement;
    this.selector = useHost ? ':host' : ':root';
    this.variables = new Proxy({}, {
      get: (target, prop) => this.getVariable(this.normalizeProp(prop)),
      set: (target, prop, value) => {
        this.setVariable(this.normalizeProp(prop), value);
        return true;
      },
      has: (target, prop) => this.hasVariable(this.normalizeProp(prop)),
      ownKeys: () => this.getVariableNames(),
      getOwnPropertyDescriptor: (target, prop) => {
        if (this.hasVariable(this.normalizeProp(prop))) {
          return {
            value: this.getVariable(this.normalizeProp(prop)),
            writable: true,
            enumerable: true,
            configurable: true
          };
        }
      },
      deleteProperty: (target, prop) => {
        return this.removeVariable(this.normalizeProp(prop));
      }
    });
  }

  normalizeProp(prop) {
    // Remove leading '--' if present
    prop = prop.startsWith('--') ? prop.slice(2) : prop;
    // Convert camelCase to kebab-case
    return prop.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }

  denormalizeProp(prop) {
    // Convert kebab-case to camelCase
    return prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  setVariable(name, value) {
    const ruleSet = this.getRuleSet(this.selector) || this.createRuleSet(this.selector);
    ruleSet.style.setProperty(`--${name}`, value);
    this.updateStyleElement();
  }

  getVariable(name) {
    const ruleSet = this.getRuleSet(this.selector);
    return ruleSet ? ruleSet.style.getPropertyValue(`--${name}`).trim() : null;
  }

  hasVariable(name) {
    const ruleSet = this.getRuleSet(this.selector);
    return ruleSet ? ruleSet.style.getPropertyValue(`--${name}`) !== '' : false;
  }

  removeVariable(name) {
    const ruleSet = this.getRuleSet(this.selector);
    if (ruleSet) {
      ruleSet.style.removeProperty(`--${name}`);
      this.updateStyleElement();
      return true;
    }
    return false;
  }

  getVariableNames() {
    const ruleSet = this.getRuleSet(this.selector);
    if (!ruleSet) return [];

    return Array.from(ruleSet.style)
      .filter(prop => prop.startsWith('--'))
      .map(prop => this.denormalizeProp(prop.slice(2)));
  }

  getRuleSet(selector) {
    for (let i = 0; i < this.styleElement.sheet.cssRules.length; i++) {
      const rule = this.styleElement.sheet.cssRules[i];
      if (rule.selectorText === selector) {
        return rule;
      }
    }
    return null;
  }

  createRuleSet(selector) {
    const index = this.styleElement.sheet.cssRules.length;
    this.styleElement.sheet.insertRule(`${selector} {}`, index);
    return this.styleElement.sheet.cssRules[index];
  }

  updateStyleElement() {
    this.styleElement.textContent = this.toString();
  }

  toString() {
    let cssText = '';
    for (let i = 0; i < this.styleElement.sheet.cssRules.length; i++) {
      cssText += this.styleElement.sheet.cssRules[i].cssText + '\n';
    }
    return cssText;
  }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  *[Symbol.iterator]() {
    return Object.entries(this.variables)
  }
}