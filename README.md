# Aqua Web Components

## Overview

This repository contains a number of custom web components that I was putting together when I saw the beauty of early Mac OS X PowerPC builds that still were making our eyes bleed with the beauty they offered. 

I will endeavor to get these things a bit more polished (e.g. using  sematic elements instead of <div> when what I want is a <button> for example, adding more documentation and so on) before I bump the version on this to anything of note.

## Getting Started

Point your browser using script modules at this cdn: https://cdn.jsdelivr.net/gh/nyteshade/ne-aqua-components/src/all.js.

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/gh/nyteshade/ne-aqua-components/src/all.js"
></script>
```

This will place all the components in your global space on the webpage to which it was imported. It will also expose a variable on `globalThis`, basically the same as `window` in a browser page, that tracks all the exports.

Any `object` assigned to it will add it's contents to the internal map of known exports as well as add them to `globalThis`. For example:

```html
<script type="module">
  class Person {
    constructor(name) {
      this.name = name
    }

    sayHi() {
      console.log("Hello, " + this.name)
    }
  }

  exports = {
    Person,
  }
</script>

<script>
  // Normally there would be no export from the previous
  // script block, but exports being on globalThis fixes
  // and addresses the issue.
  let p = new Person('Brielle Harrison')
  
  p.sayHi()
  // console receives "Hello, Brielle Harrison"
</script>
```

## Current Components

### `<aqua-button>`

As you might expect, this 'attempts' to replicate the early Mac OS X
operating system versions' aqua cocoa buttons using a web component. 
As it stands currently, these aren't perfect by any stretch.

![aqua-button](https://raw.githubusercontent.com/nyteshade/ne-aqua-components/refs/heads/main/images/aqua-button.png)

### `<aqua-hr>`

Used as the underbar for tab groups and sometimes just to simply 
separate elements vertically, the horizontal rule is a step up in
my opinion as compared to the typical `<hr>` element the browser
supplies.

![aqua-hr](https://raw.githubusercontent.com/nyteshade/ne-aqua-components/refs/heads/main/images/aqua-hr.png)

### `<aqua-trafficlights>`

The traffic lights represent the close, minimize and maximize buttons 
found in some of the later operating systems. Still very jewel like.
Basic rendering was lifted from (Massimo Selvi's 
CodePen)[https://codepen.io/massimoselvi/details/YGrqNg]. Credit goes to
him to get the glassy reflections right.

Additional capabilities provided by this component beyond rendering
add the ability to toggle the light and change its base colors to something
that better befits your site as well as the ability to adjust the size
proportionally from the smaller values used by Massimo on their site.

![aqua-trafficlight](https://raw.githubusercontent.com/nyteshade/ne-aqua-components/refs/heads/main/images/aqua-trafficlights.png)

## Contribution

If you'd like to update or fix an error I've made on this repo, please
submit a PR. The only guidelines are to keep the code as JavaScript. I
do not care to pollute this space with TypeScript. TS is saved for large
teams in my opinion right now and tends to lead to engineering designed
to accommodate TypeScript rather than the purpose at hand.

