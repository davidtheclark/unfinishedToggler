function UnfinishedToggler(options) {

  var uft = this,
  s = uft.settings = $.extend({}, uft.defaults, options);
  uft.onCount = 0;
  uft.$root = $(s.root);
  uft.$triggers = uft.$root.find(s.triggerSelector);
  // $items contains the elements whose onClass will
  // be toggled. If `scattered` is false, $items only
  // include the containing items; if `scattered` is
  // true, items include triggers and contents.
  uft.$items = (!s.scattered) ? uft.$root.find(s.groupSelector)
                              : uft.$triggers.add(uft.$root.find(s.contentSelector));

  uft.init();
}

UnfinishedToggler.prototype = {

  init: function() {
    var uft = this,
        s = uft.settings;

    uft.data = {
      isDebouncing: false
    };

    // nmEvents is a namespaced version of the triggering events.
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

    // NEXT AND PREV
    // groupIds will contain the IDs of all groups, so methods
    // next() and prev() can move in order.
    uft.groupIds = [];
    uft.groupIds = $.map(uft.$items, function(group, i) {
      var thisGroupId = $(group).data('uft-group');
      if (thisGroupId && uft.groupIds.indexOf(thisGroupId) === -1)
        return thisGroupId;
    });

    // INNER FOCUS
    // Enable innerFocus, if settings say to do that.
    if (s.innerFocus) {
      uft.$root.find(s.innerFocus).on(uft.namespaceEvent('focus'), function(e) {
        if (!uft.data.isDebouncing) {
          // Firefox
          uft.data.isDebouncing = true;
          uft.innerFocus.call(uft, e);
        }
      });
    }
  },

  namespaceEvent: function(ev) {
    return ev + '.' + this.settings.eventNamespace;
  },

  enable: function() {
    var uft = this,
        s = uft.settings;

    // Bind triggers.
    uft.$triggers.on(uft.nmEvents, function(e) {
      if (!uft.data.isDebouncing) {
        uft.data.isDebouncing = true;
        e.preventDefault();
        uft.trigger.call(uft, this);
      }
    });

    // Bind next and prev, if they exist.
    if (s.nextSelector) {
      $(s.nextSelector).on(uft.namespaceEvent('click'), function(e) {
        e.preventDefault();
        uft.next.call(uft, this);
      });
    }
    if (s.prevSelector) {
      $(s.prevSelector).on(uft.namespaceEvent('click'), function(e) {
        e.preventDefault();
        uft.prev.call(uft, this);
      });
    }
  },

  trigger: function(input) {
    // `input` can be a selector or a number.

    var uft = this,
        s = uft.settings,
        $group = uft.getGroup(input),
        turningOn = !uft.isOn($group);

    console.log(turningOn, $group);

    if (turningOn)
      uft.turnOn($group);

    // If settings say so, don't allow the last turned-on
    // group to turn off.
    else if (s.allOff || (!s.allOff && uft.onCount > 1))
      uft.turnOff($group);

    // If outsideTurnsOff, enable it.
    if (s.outsideTurnsOff)
      uft.outsideTurnsOff($group, turningOn);
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
    // Get all relevant elements marked by the onClass.
    return this.$items.filter('.' + this.settings.onClass);
  },

  getGroup: function(input) {
    // Get the group related to `input`.
    // `input` can be a selector or a number.
    var uft = this,
        s = uft.settings;
    if (typeof input === 'number')
      // If input is a number, get the group with that number.
      return uft.getGroupById(input);
    // If input is a selector ...
    else if (s.scattered)
      // ... and scattered is true, get the group by its number.
      return uft.getGroupById($(input).data('uft-group'));
    else
      // ... and scattered is false, get the group-containing element.
      return $(input).closest(s.groupSelector);
  },

  debounceDone: function() {
    // Rudimentary debouncing.
    var uft = this;
    setTimeout(function() {
      uft.data.isDebouncing = false;
    }, 200);
  },

  turnOn: function($group) {
    var uft = this,
        s = uft.settings,
        $onItems;

    if (s.onlyOneOn) {
      // If we can only turn one on at a time,
      // make sure others are turned off.
      $onItems = uft.getOnItems();
      if (s.transOverlap) {
        // If overlap is allowed, turn off others
        // and turn on $group at the same time.
        uft.turnOff($onItems);
        doTheTurningOn();
      } else {
        // If overlap is not allowed, turn on $group
        // only after others are done turning off.
        uft.turnOff($onItems, doTheTurningOn);
      }
    } else {
      // If onlyOneOn is false, just turn $group on with no worries.
      doTheTurningOn();
    }

    // If freezeScroll is part of this, now is the time to
    // turn it on.
    if (s.freezeScroll)
      uft.freezeScrollOn();

    function doTheTurningOn() {
      // Remove offClass, add onClass.
      $group.removeClass(s.offClass)
        .addClass(s.onClass);
      // After specified delay, add transClass.
      uft.utils.optionalDelay(s.onTransDelay, function() {
        $group.addClass(s.transClass);
      });
      // Call user-defined callback, passing some data.
      s.onCallback({ '$group': $group, 'action': 'on'});
      // Add one to the onCount.
      uft.onCount++;
      // Open the gates again.
      uft.debounceDone();
    }
  },

  turnOff: function($group, callback) {
    var uft = this,
        s = uft.settings,
        cb = callback || function(){},
        offTransClass = s.transClass + '-off';

    if ($group.length) {

      // First, remove transClass and add
      // offTransClass.
      $group.removeClass(s.transClass)
        .addClass(offTransClass);

      uft.utils.optionalDelay(s.offTransTime, function() {
        // After the specificied delay, do the rest.
        cb();
        $group.removeClass(s.onClass)
          .removeClass(offTransClass)
          .addClass(s.offClass);
        // Call user-defined callback, passing some data.
        s.offCallback({ '$group': $group, 'action': 'off'});
        // Subtract from onCount.
        uft.onCount--;
        // Open the gates again.
        uft.debounceDone();
        // If the scroll was frozen, unfreeze.
        if (s.freezeScroll)
          uft.freezeScrollOff();
      });

    } else {
      // If $group is empty, just call the callback.
      cb();
    }
  },

  disable: function() {
    var s = this.settings;
    // Unbind triggers.
    this.$triggers.off(uft.namespaceEvent(''));
    if (s.nextSelector)
      $(s.nextSelector).off(uft.namespaceEvent(''));
    if (s.prevSelector)
      $(s.prevSelector).off(uft.namespaceEvent(''));
  },

  turnAllOn: function() {
    // If onlyOneOn is not true, turn on all items.
    if (!this.settings.onlyOneOn)
      this.turnOn(this.$items);
    else
      throw new Error('UnfinishedToggler will not turnAllOn with the setting {onlyOneOn: true}.');
  },

  turnAllOff: function() {
    // If allOff is allowed, turn off all items.
    if (this.settings.allOff)
      this.turnOff(this.$items);
    else
      throw new Error('UnfinishedToggler will not turnAllOff with the setting {allOff: true}.');
  },


  /*============================
  NEXT AND PREVIOUS
  ==============================*/

  nextOrPrev: function(dir) {
    var uft = this,
        s = uft.settings,
        nextPrevErrorStart = 'UnfinishedToggler cannot use next() and prev() ',
        currentGroup, firstGroup, lastGroup, targetGroup;

    // First, check that next() or prev() make sense with the setup.
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
    else if (dir === 'prev')
      targetGroup = (currentGroup - 1 >= firstGroup) ? currentGroup - 1 : lastGroup;
    uft.trigger(targetGroup);
  },

  next: function() {
    this.nextOrPrev('next');
  },

  prev: function() {
    this.nextOrPrev('prev');
  },


  /*============================
  FREEZE SCROLL
  ==============================*/

  freezeScrollOn: function() {
    var uft = this,
        rootStyles = { overflow: 'hidden' };
    // If there is a scrollbar
    if (uft.hasScrollbar) {
      // ... get its size
      var scrollbarSize = uft.getScrollbarSize();
      // ... and if there's any size, offset margin to account.
      if (scrollbarSize)
        rootStyles['margin-right'] = scrollbarSize;
    }
    $('html').css(rootStyles);
  },

  freezeScrollOff: function() {
    $('html').css({ 'overflow': '', 'margin-right': '' });
  },

  getScrollbarSize: function() {
    // Thanks to code from MagnificPopup
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
  },


  /*============================
  INNER FOCUS
  ==============================*/

  innerFocus: function(e) {
    // Find the focus-target's group, and trigger it.
    var uft = this,
        s = uft.settings,
        $el = $(e.target),
        $groupPart = (!s.scattered) ? $el : $el.closest(s.contentSelector),
        groupIsOn = uft.isOn(uft.getGroup($groupPart));

    if (!groupIsOn)
      uft.trigger($groupPart);
    else
      uft.data.isDebouncing = false;
  },


  /*============================
  OUTSIDE TURNS OFF
  ==============================*/

  outsideTurnsOff: function($group, turningOn) {
    var uft = this,
        s = uft.settings,
        // touchend is necessary for iOS.
        ev = uft.namespaceEvent('click') + ' ' + uft.namespaceEvent('touchend'),
        $inside = (typeof s.outsideTurnsOff === 'string') ? $(s.outsideTurnsOff) : $group;

    if (turningOn)
      outsideEnable();
    else
      outsideDisable();

    function outsideEnable() {
      // Make it so that clicking anywhere outside $inside
      // turns off $group.
      $inside.on(ev, function(e) {
        e.stopPropagation();
      });
      // Only allow the event once: it will get
      // re-assign if $group opens again.
      // Timeout ensures that assignment happens
      // after triggering event is done.
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
  }
};

UnfinishedToggler.prototype.utils = {
  // Utils are generic functions required by but not specific to UFT.
  optionalDelay: function(delay, func) {
    if (delay > 0)
      window.setTimeout(func, delay);
    else
      func();
  }
};

UnfinishedToggler.prototype.defaults = {
  // selector for a context-element containing all the others,
  // within which to find the toggler's parts
  'root': 'body',
  // class to turn groups and elements on
  'onClass': 'uft-on',
  // class to turn groups and elements off
  'offClass': 'uft-off',
  // scattered is true if the triggers and content
  // are not children of group-containing elements.
  // scattered groups are identified by data-uft-group attributes.
  'scattered': false,
  // selector for trigger elements
  'triggerSelector': '.uft-trigger',
  // selector for group-containing elements
  // (only used when {scattered: false})
  'groupSelector': '.uft-group',
  // selector for content elements
  // (only used when {scattered: true})
  'contentSelector': '.uft-content',
  // allow only one item to be on at a time
  'onlyOneOn' : true,
  // allow all items to be turned off at the same time
  'allOff' : true,
  // the events that trigger a change
  'events': ['click'],
  // a namespace for uft-related events
  'eventNamespace': 'uft',
  // a callback to perform after something is turned on
  'onCallback': function(){},
  // a callback to perform after something is turned off
  'offCallback': function(){},
  // class that is added just after turning on
  // and removed just before turning off,
  // useful for adding extra CSS transitions
  'transClass': 'uft-trans',
  // delay between turning on and adding transClass.
  // 40ms is minimum, in case turning on involves a `display` switch
  'onTransDelay': 40,
  // delay between removing transClass and turning off
  'offTransTime': 0,
  // transClasses of multiple groups can overlap,
  // so one group can be transitioning off while another
  // transitions on
  'transOverlap': true,

  // NEXT AND PREV
  'nextSelector': false,
  'prevSelector': false,

  // FREEZE SCROLL
  'freezeScroll': false,

  // INNER FOCUS
  'innerFocus': false,

  // OUTSIDE TUNRS OFF
  'outsideTurnsOff': false

};