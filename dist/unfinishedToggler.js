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
    // 40ms is minimum, in case turning on involves a `display` switch
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
/**
 * The Unfinished Toggler: Freeze Scroll
 */

// Register defaults.
UnfinishedToggler.prototype.registerDefault({
  // freeze scrolling when a group is turned on;
  // basically used only for popups/modals
  'freezeScroll': false
});

// What it does.
$.extend(UnfinishedToggler.prototype, {

  freezeScrollOn : function() {
    var uft = this,
        rootStyles = { overflow: 'hidden' };

    // If there is a scrollbar
    if (uft.hasScrollbar) {
      // ... get its size
      var scrollbarSize = uft.getScrollbarSize();
      // ... and if there's any size, offset right margin to account.
      if (scrollbarSize)
        rootStyles['margin-right'] = scrollbarSize;
    }
    $('html').css(rootStyles);
  },

  freezeScrollOff: function() {
    $('html').css({ 'overflow': '', 'margin-right': '' });
  },

  getScrollbarSize: function() {
    // Thanks to code from MagnificPopup.
    if(this.data.scrollbarSize === undefined) {
      var scrollDiv = document.createElement("div");
      scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
      document.body.appendChild(scrollDiv);
      this.data.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
    }
    return this.data.scrollbarSize;
  },

  hasScrollbar: function() {
    return document.body.scrollHeight > $(window).height();
  }
});

// Register `turnOn` functionality.
UnfinishedToggler.prototype.registerHook('turnOn', function() {
  // If `freezeScroll` is set, turn it on now.
  if (this.settings.freezeScroll)
    this.freezeScrollOn();
});

// Register `turnOff` functionality.
UnfinishedToggler.prototype.registerHook('turnOff', function() {
  // If the scroll was frozen, unfreeze it.
  if (this.settings.freezeScroll)
    this.freezeScrollOff();
});
/**
 * The Unfinished Toggler: Inner Focus
 */

// Register defaults.
UnfinishedToggler.prototype.registerDefault({
  // selector for elements within groups that if focused
  // will turn on their containing group
  'innerFocus': false
});

// What it does.
UnfinishedToggler.prototype.innerFocus = function(e) {
  // Find the focus-target's group, and trigger it.
  var uft = this,
      s = uft.settings,
      $el = $(e.target),
      $groupPart = (!s.scattered) ? $el : $el.closest(s.contentSelector),
      groupIsOn = uft.isOn(uft.getGroup($groupPart));

  if (!groupIsOn)
    uft.triggerGroup($groupPart);
  else
    uft.debounceDone();
};

// Register `init` functionality.
UnfinishedToggler.prototype.registerHook('init', function() {
  var uft = this,
      s = uft.settings;
  // Enable innerFocus functionality, if settings say to do that.
  if (s.innerFocus) {
    uft.$root.find(s.innerFocus).on(uft.namespaceEvent('focus'), function(e) {
      if (!uft.data.isDebouncing) {
        // Firefox
        uft.data.isDebouncing = true;
        uft.innerFocus.call(uft, e);
      }
    });
  }
});
/**
 * The Unfinished Toggler: Next-Prev
 */

// Register defaults.
UnfinishedToggler.prototype.registerDefault({
  // selector for elements that will turn on the next group
  'nextSelector': false,
  // selector for elements that will turn on the previous group
  'prevSelector': false
});

// What it does.
$.extend(UnfinishedToggler.prototype, {
  nextOrPrev: function(dir) {
    var uft = this,
        s = uft.settings,
        nextPrevErrorStart = 'UnfinishedToggler cannot use next() and prev() ',
        currentGroup, firstGroup, lastGroup, targetGroup;

    // First, check that next() or prev() make sense with the settings and markup.
    if (!s.onlyOneOn)
      throw new Error(nextPrevErrorStart + 'with the setting {onlyOneOn: false}.');

    currentGroup = uft.getOnItems().first().data('uft-group');
    if (typeof currentGroup === 'undefined')
      throw new Error(nextPrevErrorStart + 'unless data-uft-group values are defined.');
    else if (typeof currentGroup !== 'number')
      throw new Error(nextPrevErrorStart + 'unless data-uft-group values are integers.');

    firstGroup = Math.min.apply(Math, uft.groupIds);
    lastGroup = Math.max.apply(Math, uft.groupIds);
    if (dir === 'next')
      targetGroup = (currentGroup + 1 <= lastGroup) ? currentGroup + 1 : firstGroup;
    else
      targetGroup = (currentGroup - 1 >= firstGroup) ? currentGroup - 1 : lastGroup;
    uft.triggerGroup(targetGroup);
  },

  // next() and prev() are just public-facing methods.
  next: function() {
    this.nextOrPrev('next');
  },
  prev: function() {
    this.nextOrPrev('prev');
  }
});

// Register `init` functionality.
UnfinishedToggler.prototype.registerHook('init', function() {
  var uft = this;
  // `groupIds` will contain the IDs of all groups, so methods
  // .next() and .prev() can move in order.
  uft.groupIds = [];
  uft.groupIds = $.map(uft.$items, function(group, i) {
    var thisGroupId = $(group).data('uft-group');
    if (thisGroupId && uft.groupIds.indexOf(thisGroupId) === -1)
      return thisGroupId;
  });
});

// Register `enable` functionality.
UnfinishedToggler.prototype.registerHook('enable', function() {
  var uft = this,
      s = uft.settings;
  // Bind next- and prev-triggers, if they exist.
  if (s.nextSelector) {
    $(s.nextSelector).on(uft.namespaceEvent('click'), function(e) {
      uft.next.call(uft, this);
    });
  }
  if (s.prevSelector) {
    $(s.prevSelector).on(uft.namespaceEvent('click'), function(e) {
      uft.prev.call(uft, this);
    });
  }
});

// Register `disable` functionality.
UnfinishedToggler.prototype.registerHook('disable', function() {
  var s = this.settings;
  // Unbind next- and prev- triggers.
  if (s.nextSelector)
    $(s.nextSelector).off(this.namespaceEvent());
  if (s.prevSelector)
    $(s.prevSelector).off(this.namespaceEvent());
});
/**
 * The Unfinished Toggler: Outside Turns Off
 */

// Register defaults.
UnfinishedToggler.prototype.registerDefault({
  // either `true`, to indicate that clicking anywhere
  // outside the turned-on group should turn it off,
  // or selector for the region in which you are welcome to
  // click without turning off the group (clicks outside that
  // region will turn it off)
  'outsideTurnsOff': false
});

// What it does.
UnfinishedToggler.prototype.outsideTurnsOff = function($group, turningOn) {
  var uft = this,
      s = uft.settings,
      // `touchend` event is necessary for iOS, it seems.
      ev = uft.namespaceEvent('click') + ' ' + uft.namespaceEvent('touchend'),
      $inside = (typeof s.outsideTurnsOff === 'string') ? $(s.outsideTurnsOff) : $group;

  if (turningOn)
    outsideEnable();
  else
    outsideDisable();

  function outsideEnable() {
    // Make it so that clicking anywhere outside `$inside`
    // turns off `$group`.
    $inside.on(ev, function(e) {
      e.stopPropagation();
    });
    // Only allow the event once: it will get
    // re-assigned if `$group` turns on again.
    // Timeout ensures that assignment happens
    // after the triggering event is done.
    setTimeout(function() {
      $('html').on(ev, outsideTriggered);
    }, 40);
  }

  function outsideDisable() {
    $('html').off(uft.namespaceEvent(''));
  }

  function outsideTriggered(e) {
    if (!$inside.is($(e.target))) {
      uft.turnOff($group);
      outsideDisable();
    }
  }
};

// Register `trigger` functionality.
UnfinishedToggler.prototype.registerHook('trigger', function($group, turningOn) {
  // If outsideTurnsOff, trigger it.
  if (this.settings.outsideTurnsOff)
    this.outsideTurnsOff($group, turningOn);
});