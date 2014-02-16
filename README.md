# The UnfinishedToggler

A simple but atypical jQuery plugin to ease the process of creating custom-designed UI components.

The UnfinishedToggler is "simple" because it simply toggles elements and groups of elements between "on" and "off" states, which are represented with classes that correspond to your styling. It can perform this toggling in various ways, according to the rules you pass it. In fact, this is all that happens with most UI components (e.g. accordions, tabs, popups, modals, dropdowns): certain events make certain elements or groups of elements turn "on" or "off", according to some pattern, some set of rules. What makes an "accordion" different from a "popup" is just (a) the styling and (b) the rules that govern how the parts change state.

The UnfinishedToggler is an "atypical" UI-related plugin because it is a tool that could help you build your own stuff faster, rather than a pre-made thing that you can insert into your site with no further effort. Most of all, it assumes that you're going to want to style your own component in your own way -- so you'll have to write some CSS. The UnfinishedToggler, meanwhile, provides a little framework for the component's requisite JavaScript, into which you pass the particular rules that define your component's toggling behavior. The JS will change classes on your elements: your CSS is what makes the classes matter.

An example helps explain:

What is a UI "accordion"? A set of sub-groups, each group consisting of a trigger and a panel of content; click a trigger to reveal its related panel. Especially now that we have CSS transitions, this "revealing" is just the addition of a class. Then there are all kinds of minor variations: Some accordions have no panel open at first, while others have the first panel open. Some only allow one panel to be open at a time, so whenever you open another the rest must close; others allow you to open all panels at once. Some don't allow you to close all the panels at the same time -- at least one must be open; others allow you to close them all. Some have "next" and "previous" buttons that allow you to navigate from one panel to its neighbors; most don't. If you tab through the accordion maybe its panels will open when you focus on an anchor or button inside them. And so on.

Tabs are essentially the same, but with a different visual style and a couple of more consistent rules: With tabs, typically, only one trigger/content group can be on at a time, and one *must* always be on, so you can't turn a group off except by turning another on. Most of the other variations mentioned above for accordions also relate to tabs.

So:

With the Unfinished Toggler, you get most or all of the JavaScript you'll need for your UI component by designating (a) which elements constitute its groups, and (b) which rules and patterns define the component's behavior. Then you write some CSS to differentiate the "on" and "off" states, a little different every time.

The UnfinishedToggler is especially useful in providing code for certain common rules that are a little more complicated than `$(element).toggleClass()`. For instance:

- A transition-class is added after a group is turned on and before it is turned off, which can prove handy for adding multi-step transitions (e.g. switch `display: none` to `display: block` then fade in the inner content.)
- You can create "next" and "previous" triggers just by passing their selectors as settings and designating an order to your groups (with `data-uft-group` numbers).
- You can close groups when the user clicks outside of them (e.g. dropdowns, popups, modals).
- You can open groups when certain elements within them receive focus (e.g. as a user tabs through the page's links).
- You can freeze scrolling while a group is open (e.g. modals).

## Usage Example

Create a new instance and pass your settings.

Here's a simple example:

```js
var basicAccordion = new UnfinishedToggler();
```

Here's an example with a bunch of settings:

```js
var carousel = new UnfinishedToggler({
  root: '#carousel',
  onClass: 'is-on',
  offClass: 'is-off',
  transClass: 'is-trans',
  contentSelector: '.carousel-content',
  triggerSelector: '.carousel-tracker',
  nextSelector: '#carousel-next',
  prevSelector: '#carousel-prev',
  allOff: false,
  scattered: true,
  offTransTime: 300
});
```

And write some CSS so that the classes that get applied do the things you want done. Continuing the carousel example, above, roughly:

```css
.carousel-content {
  /* whatever you want your carousel slides to look like */
  display: none;
}
.carousel-content.is-on {
  display: block;
  /* make it fade in and out as transClass is added and removed */
  opacity: 0;
  transition: opacity 0.3s linear;
}
.carousel-content.is-trans {
  opacity: 1;
}
.carousel-tracker {
  /* style for you trackers */
}
.carousel-tracker.is-on {
  /* style for tracker that corresponds to the current slide  */
}
```

And maybe at some point, for some reason, call some of your carousel's public methods:

```js
carousel.next();
carousel.prev();
carousel.trigger('#tracker-1');
carousel.disable();
carousel.enable();
```

## Settings

```js
UnfinishedToggler.prototype.defaults = {
  // selector for a context-element containing all the others,
  // within which to find the toggler's parts
  'root': 'body',
  // class to turn groups and elements on
  'onClass': 'uft-on',
  // class to turn groups and elements off
  'offClass': 'uft-off',
  // `scattered` is true if related triggers and content
  // are not children of the same group-containing elements.
  // scattered groups are identified by data-uft-group attributes.
  'scattered': false,
  // selector for trigger elements
  'triggerSelector': '.uft-trigger',
  // selector for group-containing elements
  // (only used if `{ scattered: false }`)
  'groupSelector': '.uft-group',
  // selector for content elements
  // (only used if `{ scattered: true }`)
  'contentSelector': '.uft-content',
  // allow only one item to be on at a time
  'onlyOneOn' : true,
  // allow all items to be turned off at the same time
  'allOff' : true,
  // array of events that the triggers will listen for
  'events': ['click'],
  // namespace for uft-related events
  'eventNamespace': 'uft',
  // callback to perform after something is turned on
  'onCallback': function(){},
  // callback to perform after something is turned off
  'offCallback': function(){},
  // class that is added just after turning on
  // and removed just before turning off,
  // useful for adding extra CSS transitions
  'transClass': 'uft-trans',
  // delay between turning on and adding `transClass`;
  // 40ms is minimum, in case turning on involves a `display` switch
  'onTransDelay': 40,
  // delay between removing `transClass` and turning off
  'offTransTime': 0,
  // `transOverlap` is true if groups are allowed to
  // transition on while others are still transitioning off
  'transOverlap': true,

  // NEXT AND PREV
  // selector for elements that will turn on the next group
  'nextSelector': false,
  // selector for elements that will turn on the previous group
  'prevSelector': false,

  // FREEZE SCROLL
  // freeze scrolling when a group is turned on;
  // basically used only for popups/modals
  'freezeScroll': false,

  // INNER FOCUS
  // selector for elements within groups that if focused
  // will turn on their containing group
  'innerFocus': false,

  // OUTSIDE TURNS OFF
  // either `true`, to indicate that clicking anywhere
  // outside the turned-on group should turn it off,
  // or selector for the region in which you are welcome to
  // click without turning off the group (clicks outside that
  // region will turn it off)
  'outsideTurnsOff': false
};
```

## Usage

Coming.

## Examples

Coming.
