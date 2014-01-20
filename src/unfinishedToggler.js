function UnfinishedToggler(options) {

  var uft = this;
  var s = uft.settings = $.extend({}, uft.defaults, options);
  // onCount should indicate the number of groups
  // currently turned on.
  uft.onCount = 0;
  uft.onClass = s.onClass;
  uft.offClass = s.offClass;
  uft.transOnClass = uft.onClass + '-trans';
  uft.transOffClass = uft.offClass + '-trans';
  uft.$root = $(s.root);
  uft.$triggers = uft.$root.find(s.triggerSelector);
  uft.$contents = uft.$root.find(s.contentSelector);
  // $items contains the elements whose onClass will
  // be toggled. If `scattered` is false, $items only
  // include the containing items; if `scattered` is
  // true, items include triggers and contents.
  uft.$items = (!s.scattered) ? uft.$root.find(s.groupSelector) : uft.$triggers.add(uft.$contents);

  uft.data = {
    isDebouncing: false
  };

  uft.init();

}

UnfinishedToggler.prototype = {

  init: function() {
    var uft = this,
        s = uft.settings;

    uft.enable();

    // Turn off all items, if settings say to do that.
    if (s.startOff)
      uft.turnAllOff();

    // If there is an initialTrigger to trigger, do it.
    // But if initialTrigger is 'first', pass it along.
    if (s.initialTrigger && s.initialTrigger !== 'first')
      uft.trigger(s.initialTrigger);

    // Otherwise, if no initialTrigger but allOff is not allowed
    // and nothing is turned on in the markup,
    // or initialTrigger is 'first',
    // trigger the first trigger with the first event.
    else if ((!s.allOff && !uft.getOnItems().length) || s.initialTrigger === 'first')
      uft.$triggers.first().trigger(s.event.split(' ')[0]);

    // NEXT AND PREV
    // groupIds will contain the IDs of all groups, so methods
    // next() and prev() know where to go.
    uft.groupIds = [];
    uft.groupIds = $.map(uft.$items, function(group, i) {
      var thisGroupId = $(group).data('uft-group');
      if (thisGroupId && uft.groupIds.indexOf(thisGroupId) === -1)
        return thisGroupId;
    });

    // INNER FOCUS
    // Enable innerFocus, if settings say to do that.
    if (s.innerFocus) {
      uft.$root.find(s.innerFocus).on('focus', function(e) {
        uft.innerFocus.call(uft, e);
      });
    }
  },

  enable: function() {
    var uft = this,
        s = uft.settings;
    // Bind triggers.
    // NEEDS DEBOUCE
    uft.$triggers.on(s.event, function(e) {
      if (!uft.data.isDebouncing) {
        uft.data.isDebouncing = true;
        var thisTrigger = this;
        e.preventDefault();
        uft.trigger.call(uft, thisTrigger);
      }
    });
    // Bind next and prev, if they exist.
    if (s.nextSelector) {
      $(s.nextSelector).click(function(e) {
        var thisTrigger = this;
        e.preventDefault();
        uft.next.call(uft, thisTrigger);
      });
    }
    if (s.prevSelector) {
      $(s.prevSelector).click(function(e) {
        var thisTrigger = this;
        e.preventDefault();
        uft.prev.call(uft, thisTrigger);
      });
    }
  },

  trigger: function(input) {
    var uft = this,
        s = uft.settings,
        $group = uft.getGroup(input),
        turningOn = !uft.isOn($group);

    if (turningOn)
      uft.turnOn($group);

    else if (s.allOff || (!s.allOff && uft.onCount > 1))
      uft.turnOff($group);

    // If outsideTurnsOff, enable it.
    if (s.outsideTurnsOff)
      uft.outsideTurnsOff($group, turningOn);
  },

  isOn: function($el) {
    // Check if an element is on.
    return $el.hasClass(this.onClass);
  },

  getGroupById: function(id) {
    return this.$items.filter('[data-uft-group="' + id + '"]');
  },

  getOnItems: function() {
    // Get all relevant elements marked by the onClass.
    return this.$items.filter('.' + this.onClass);
  },

  transitionDone: function() {
    var uft = this;
    setTimeout(function() {
      uft.data.isDebouncing = false;
    }, 200);
  },

  getGroup: function(input) {
    var uft = this,
        s = uft.settings;
    // Get the group related to `input`.
    // `input` can be a group number or a selector for a trigger.
    if (typeof input === 'number')
      // If input is a number, get the group with that number.
      return uft.getGroupById(input);
    // If input is a selector ...
    else if (s.scattered)
      // ... and scattered is true, get the group by its number.
      return uft.getGroupById($(input).data('uft-group'));
    else
      // ... and scattered is false, get the group element.
      return $(input).closest(s.groupSelector);
  },

  turnOn: function($group) {
    var uft = this,
        s = uft.settings;

    if (s.onlyOneOn) {
      var $onItems = uft.getOnItems();
      if (s.transOverlap) {
        // If overlap is allowed, turn off current $onItems
        // and turn on $group at the same time.
        uft.turnOff($onItems);
        doTheTurningOn();
      } else {
        // If overlap is not allowed, turn on $group
        // only after current $onItems are done turning off.
        uft.turnOff($onItems, doTheTurningOn);
      }
    } else {
      // If onlyOneOn is false, just turn $group on.
      doTheTurningOn();
    }

    if (s.freezeScroll)
      uft.freezeScrollOn();

    function doTheTurningOn() {
      $group.removeClass(uft.offClass)
        .addClass(uft.onClass);

      // After a delay (40ms by default in case the on/off switch
      // does something with `display`) add the transition class.
      uft.utils.optionalDelay(s.onTransDelay, function() {
        $group.addClass(s.transClass);
      });

      // Call user-defined callback, passing some data.
      s.onCallback({ '$group': $group, 'action': 'on'});
      uft.onCount++;

      uft.transitionDone();
    }
  },

  turnOff: function($group, callback) {
    var uft = this,
        s = uft.settings,
        cb = callback || function(){};

    if ($group.length) {
      // First, add the transition class.
      $group.removeClass(s.transClass);

      uft.utils.optionalDelay(s.offTransTime, function() {
        cb();
        // Then remove it, and toggle on/off classes,
        // after the transition delay.
        $group.removeClass(uft.onClass)
          .addClass(uft.offClass);
        // Call user-defined callback, passing some data.
        s.offCallback({ '$group': $group, 'action': 'off'});
        uft.onCount--;

        uft.transitionDone();
      });
      if (s.freezeScroll)
        uft.utils.optionalDelay(s.offTransTime, uft.freezeScrollOff);

    } else {
      // If the group is empty, just call the callback.
      cb();
    }
  },

  disable: function() {
    var s = this.settings;
    // Unbind triggers.
    this.$triggers.off();
    if (s.nextSelector)
      $(s.nextSelector).off();
    if (s.prevSelector)
      $(s.prevSelector).off();
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
      var scrollbarSize = uft.getScrollbarSize();
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
    if(this.scrollbarSize === undefined) {
      var scrollDiv = document.createElement("div");
      scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
      document.body.appendChild(scrollDiv);
      this.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
    }
    return this.scrollbarSize;
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
  },


  /*============================
  OUTSIDE TURNS OFF
  ==============================*/

  outsideTurnsOff: function($group, turningOn) {
    var uft = this,
        s = uft.settings,
        ev = 'click.uft touchend.uft',
        $inside = (typeof s.outsideTurnsOff === 'string') ? $(s.outsideTurnsOff) : $group;

    if (turningOn)
      outsideEnable();
    else
      outsideDisable();

    function outsideEnable() {
      // Make it so that clicking anywhere outside $group
      // turns off $group.
      // touchend is necessary for iOS.
      $inside.on(ev, function(e) {
        e.stopPropagation();
      });
      // Only allow the event once: it will get
      // re-delegated if $group opens again.
      setTimeout(function() {
        $('html').on(ev, outsideTriggered);
      }, 40);
    }

    function outsideDisable() {
      $('html').off('.uft');
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
  'onClass': 'uft-on',
  'offClass': 'uft-off',
  'groupSelector': '.uft-group',
  'triggerSelector': '.uft-trigger',
  'contentSelector': '.uft-content',
  // scattered is true if the triggers and content
  // are not children of group-elements. scattered groups
  // are identified by data-uft-group attributes.
  'scattered': false,
  // only allow one item to be on at a time
  'onlyOneOn' : true,
  // all items can be off at the same time
  'allOff' : true,
  // start by turning off all items
  'startOff': false,
  // a selector for a trigger to trigger right away
  'initialTrigger' : false,
  // the event(s) that triggers a change
  'event': 'click',
  // a callback to perform after instance is turned on
  'onCallback': function(){},
  // a callback to perform after instance is turned off
  'offCallback': function(){},
  // Class that is added just after tunring on and removed
  // just before turning off, useful for added transitions.
  'transClass': 'uft-trans',
  // Delay between turning on and adding transClass.
  // 40ms is minimum, in case turning on involves `display` switch.
  'onTransDelay': 40,
  // Time between removing transClass and turning off.
  'offTransTime': 0,
  // transClasses of multiple groups can overlap.
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