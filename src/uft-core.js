/**
 * The Unfinished Toggler: Core
 */

function UnfinishedToggler(options) {
  // Upon instantiation,
  // establish settings and initialize.
  this.settings = $.extend({}, this.defaults, options);
  this.init();
}


/**
 * Default Settings
 */

UnfinishedToggler.prototype = {

  defaults: {
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
    // 40ms is minimum if turning on involves a `display` switch
    'onTransDelay': 40,
    // delay between removing `transClass` and turning off
    'offTransTime': 0,
    // `transOverlap` is true if groups are allowed to
    // transition on while others are still transitioning off
    'transOverlap': true
  },

  registerDefault: function(newDefaults) {
    // `newDefaults` is an object containing new
    // defaults from a plugin.
    $.extend(this.defaults, newDefaults);
  },

  /**
   * HOOKS
   * For UFT, "hooks" are points at which a plugin can
   * insert a function. When `execHook()` is called,
   * it will loop through and call all the functions
   * that plugins have registered for that particular hook.
   */

  hooks: {
    // `init` functions run once on instantiation.
    init: [],
    // `enable` functions bind triggers that enable
    // the instance to toggle.
    enable: [],
    // `disable` funcntions unbind those triggers,
    // so the instance won't toggle until re-enabled.
    disable: [],
    // `trigger` functions run when a trigger is ... triggered.
    // They will be passed
    // (1) the `$group` that is triggered
    // (2) a boolean value for whether the group is `turningOn`
    trigger: [],
    // `turnOn` functions run when a group is turned on.
    // They will be passed
    // (1) the `$group` that is turning on.
    turnOn: [],
    // `turnOff` functions run when a group is turned off.
    // They will be passed
    // (1) the `$group` that is turning off.
    turnOff: []
  },

  registerHook: function(hook, fn) {
    this.hooks[hook].push(fn);
  },

  execHook: function(hook, args) {
    var fns = this.hooks[hook];
    args = args || [];
    for (var i=0,l=fns.length;i<l;i++) {
      // Hook functions receive the UFT instance as `this`.
      fns[i].apply(this, args);
    }
  },


  /**
   * Core Utility Functions
   */

  namespaceEvent: function(eventName) {
    // Just add a namespace to an event.
    eventName = eventName || '';
    return eventName + '.' + this.settings.eventNamespace;
  },

  isOn: function($el) {
    // Check if an element is on.
    return $el.hasClass(this.settings.onClass);
  },

  getGroupById: function(id) {
    // `id` is a number.
    // Get all items idenfitified in the group of that number.
    return this.$items.filter('[data-uft-group="' + id + '"]');
  },

  getOnItems: function() {
    // Get all relevant elements marked by the `onClass`.
    return this.$items.filter('.' + this.settings.onClass);
  },

  getGroup: function(input) {
    // `input` can be a selector or a number.
    // Get the group related to `input`.
    var uft = this,
        s = uft.settings;
    if (typeof input === 'number')
      // If `input` is a number, get the group with that number.
      return uft.getGroupById(input);
    // If `input` is a selector ...
    else if (s.scattered)
      // ... and `scattered` is true, get the group by its number.
      return uft.getGroupById($(input).data('uft-group'));
    else
      // ... and `scattered` is false, get the group-containing element.
      return $(input).closest(s.groupSelector);
  },

  debounceDone: function() {
    // Rudimentary debouncing. 200ms should be sufficient.
    var uft = this;
    setTimeout(function() {
      uft.data.isDebouncing = false;
    }, 200);
  },

  optionalDelay: function(delay, func) {
    // Don't bother creating a setTimeout if there's no delay.
    if (delay)
      window.setTimeout(func, delay);
    else
      func();
  },


  /**
   * Initialization
   */

  init: function() {
    // Core functionality.
    // ---------------------------
    var uft = this,
        s = uft.settings;

    uft.onCount = 0;
    uft.$root = $(s.root);
    uft.$triggers = uft.$root.find(s.triggerSelector);
    // `$items` contains the elements whose on and off state will
    // be toggled. If `scattered` is false, `$items` only
    // includes the group-container items; if `scattered` is
    // true, `$items` includes triggers and contents.
    uft.$items = (!s.scattered) ? uft.$root.find(s.groupSelector)
                                : uft.$triggers.add(uft.$root.find(s.contentSelector));

    uft.data = {
      // `isDebouncing` is used to ensure that toggling
      // doesn't overlap already-toggling-toggling.
      isDebouncing: false
    };

    // `nmEvents` is a namespaced version of the triggering event(s).
    uft.nmEvents = $.map(s.events, function(ev) {
      return uft.namespaceEvent(ev);
    }).join(' ');

    // Enable!
    uft.enable();

    // If nothing is turned on in the markup,
    // but settings say all cannot be off,
    // trigger the first trigger with the first event.
    if ((!s.allOff && !uft.getOnItems().length))
      uft.$triggers.first().trigger(uft.nmEvents.split(' ')[0]);

    // ---------------------------
    // Execute hook.
    // ---------------------------
    uft.execHook('init');
  },


  /**
   * Core Functionality
   */

  enable: function() {
    // Core functionality.
    // ---------------------------
    var uft = this;
    uft.$triggers.on(uft.nmEvents, function(e) {
      if (!uft.data.isDebouncing) {
        uft.data.isDebouncing = true;
        uft.triggerGroup.call(uft, this);
      }
    });

    // ---------------------------
    // Execute hook.
    // ---------------------------
    this.execHook('enable');
  },

  disable: function() {
    // Core functionality.
    // ---------------------------
    this.$triggers.off(this.namespaceEvent());

    // ---------------------------
    // Execute hook.
    // ---------------------------
    this.execHook('disable');
  },

  triggerGroup: function(input) {
    // `input` can be a selector or a number.

    // Core functionality.
    // ---------------------------
    var uft = this,
        s = uft.settings,
        $group = uft.getGroup(input),
        // If the group does not already have the `onClass`,
        // we'll assumed it needs to be turned on.
        turningOn = !uft.isOn($group);

    if (turningOn)
      uft.turnOn($group);

    // If settings don't permit all to be off,
    // don't allow the last remaining turned-on group to turn off.
    else if (s.allOff || (!s.allOff && uft.onCount > 1))
      uft.turnOff($group);

    // ---------------------------
    // Execute hook.
    // ---------------------------
    uft.execHook('trigger', [$group, turningOn]);
  },

  turnOn: function($group) {
    // Core functionaliy
    // ---------------------------
    var uft = this,
        s = uft.settings,
        $onItems;

    // If we can only turn one on at a time,
    // make sure others are turned off.
    if (s.onlyOneOn) {
      $onItems = uft.getOnItems();
      if (s.transOverlap) {
        // If overlap is allowed, turn off others
        // and turn on `$group` at the same time.
        uft.turnOff($onItems);
        doTheTurningOn();
      } else {
        // If overlap is not allowed, turn on `$group`
        // only after others are done turning off.
        uft.turnOff($onItems, doTheTurningOn);
      }
    // If `onlyOneOn` is false, just turn on `$group` with no worries.
    } else {
      doTheTurningOn();
    }

    function doTheTurningOn() {
      // Remove `offClass`, add `onClass`.
      $group.removeClass(s.offClass)
        .addClass(s.onClass);
      // After specified delay, add `transClass`.
      uft.optionalDelay(s.onTransDelay, function() {
        $group.addClass(s.transClass);
      });
      // Call user-defined callback, passing some data.
      s.onCallback({ '$group': $group, 'action': 'on'});
      // Add one to the `onCount`.
      uft.onCount++;
      // Open the gates again.
      uft.debounceDone();

      // ---------------------------
      // Execute hook
      // ---------------------------
      uft.execHook('turnOn', [$group]);
    }
  },

  turnOff: function($group, callback) {
    // Core functionality
    // ---------------------------
    var uft = this,
        s = uft.settings,
        offTransClass = s.transClass + '-off';

    callback = callback || function(){};

    if ($group.length) {

      // First, remove `transClass`
      // and add `offTransClass`.
      $group.removeClass(s.transClass)
        .addClass(offTransClass);

      uft.optionalDelay(s.offTransTime, function() {
        // After the specificied delay, finish switching up classes.
        $group.removeClass(s.onClass)
          .removeClass(offTransClass)
          .addClass(s.offClass);
        // Call user-defined callback, passing some data.
        s.offCallback({ '$group': $group, 'action': 'off'});
        // Subtract from `onCount`.
        uft.onCount--;
        // Open the gates again.
        uft.debounceDone();

        callback();

        // ---------------------------
        // Execute hook
        // ---------------------------
        uft.execHook('turnOff', [$group]);
      });

    // If `$group` is empty, just call the callback.
    } else {
      callback();
    }
  },

  turnAllOn: function() {
    // If `onlyOneOn` is not true, turn on all items.
    if (!this.settings.onlyOneOn)
      this.turnOn(this.$items);
    else
      throw new Error('UnfinishedToggler will not turnAllOn with the setting {onlyOneOn: true}.');
  },

  turnAllOff: function() {
    // If `allOff` is allowed, turn off all items.
    if (this.settings.allOff)
      this.turnOff(this.$items);
    else
      throw new Error('UnfinishedToggler will not turnAllOff with the setting {allOff: true}.');
  }

};