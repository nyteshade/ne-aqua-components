import { StyleManager } from './stylemanager.js'
import { WebComponentBase } from './webcomponentbase.js'

import { AquaButton } from './aqua-button.js'
import { AquaButton2 } from './aqua-button2.js'
import { AquaHorizontalRule } from './aqua-hr.js'
import { AquaTrafficLight } from './aqua-trafficlight.js'

import { GlowText } from './glow-text.js'

if (!Reflect.has(globalThis, 'exports')) {
  const exportsMap = new Map();

  Object.defineProperty(globalThis, 'exports', {
    /**
     * Accessing the `exports` property defined on the `globalThis`, `window`
     * in the case of a webpage, you will receive a proxy that maps
     * functionality onto an instance of `Map`; i.e. calling delete when a
     * delete action is excuted on the value, getting the dot notation property
     * from the map using the get function and so on.
     *
     * However, when assigning a new value to this property, if the assigned
     * value is an object, then its entries get dutifully set on the map, one
     * by one.
     *
     * @note this will not do what you expect if your object has accessors
     * defined; a snapshot of that current value will be copied into the map
     */
    get() {
      return new Proxy(Object.create(null), {
        get(target, property, receiver) {
          if (property === Symbol.iterator) {
            return exportsMap[Symbol.iterator]
          }
          else if (property === Symbol.toStringTag) {
            return 'GlobalExports'
          }
          else if (property === Symbol.for('exportsMap')) {
            return exportsMap
          }

          return exportsMap.get(property)
        },

        has(target, property) {
          return exportsMap.has(property)
        },

        set(target, property, newValue, receiver) {
          exportsMap.set(property, newValue)
          globalThis[property] = newValue
        },

        deleteProperty(target, property) {
          const descriptor = Object.getOwnPropertyDescriptor(globalThis, property)

          if (descriptor.configurable && exportsMap.has(property)) {
            exportsMap.delete(property)
            return delete globalThis[property]
          }

          return false
        },

        ownKeys(target) {
          return [...exportsMap.keys()]
        },
      })
    },

    set(newValue) {
      if (newValue && typeof newValue === 'object' || newValue instanceof Object) {
        for (const [key, value] of Object.entries(newValue)) {
          exportsMap.set(key, value);
          globalThis[key] = value;
        }
      }
    },

    configurable: true,
    enumerable: true,
  })
}

globalThis.exports = {
  AquaButton,
  AquaButton2,
  AquaHorizontalRule,
  AquaTrafficLight,
  GlowText,
  StyleManager,
  WebComponentBase,
}
