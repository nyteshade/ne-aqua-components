import { applyGlobalExports, removeGlobalExports } from './global.exports.js'
import { Toolbelt } from './toolbelt.js'
import { StyleManager } from './stylemanager.js'
import { WebComponentBase } from './webcomponentbase.js'

import { AquaButton } from './aqua-button.js'
import { AquaButton2 } from './aqua-button2.js'
import { AquaHorizontalRule } from './aqua-hr.js'
import { AquaTrafficLight } from './aqua-trafficlight.js'

import { GlowText } from './glow-text.js'

applyGlobalExports();

globalThis.exports = {
  AquaButton,
  AquaButton2,
  AquaHorizontalRule,
  AquaTrafficLight,
  GlowText,
  StyleManager,
  Toolbelt,
  WebComponentBase,

  removeGlobalExports,
}
