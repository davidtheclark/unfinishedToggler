function UnfinishedToggler(options) {

  // Establish variables and run init.
  var settings = $.extend({}, this.defaults, options),
      $root = $(settings.root),
      onClass = settings.onClass,
      offClass = settings.offClass,
      transOnClass = onClass + '-trans',
      transOffClass = offClass + '-trans',
      $triggers = $root.find(settings.triggerSelector),
      groupIds = [],
      utils = this.utils,
      // onCount should indicate the number of groups
      // currently turned on.
      onCount = 0,
      // $items contains the elements whose onClass will
      // be toggled. If `scattered` is false, $items only
      // include the containing items; if `scattered` is
      // true, items include triggers and contents.
      $items = (!settings.scattered) ? $root.find(settings.groupSelector) : $triggers.add(settings.contentSelector);

  init();

  // Return public methods.
  return {
    trigger: trigger,
    disable: disable,
    enable: enable,
    turnAllOn: turnAllOn,
    turnAllOff: turnAllOff,
    next: next,
    prev: prev
  };

  function init() {

    enable();

    if (settings.initial) {
      // If there is an initial to turn on, do it.
      trigger(settings.initial);

    } else if (!settings.allOff && getOnItems().length === 0) {
      // Otherwise, if no initial but allOff is not allowed
      // and nothing is turned on in the markup ...
      // trigger the first trigger with the first event.
      $triggers.first()
        .trigger(settings.event.split(' ')[0]);
    }

    // Create an array of relevant groups,
    // used for next() and prev().
    $items.each(function() {
      var thisGroupId = $(this).data('uft-group');
      if (thisGroupId && groupIds.indexOf(thisGroupId) === -1) {
        groupIds.push(thisGroupId);
      }
    });

    // Enabling innerFocus
    if (settings.innerFocus) {
      $root.find(settings.innerFocus).focus(innerFocus);
    }

  }

  function enable() {
    // Bind triggers.
    $triggers.on(settings.event, utils.simpleDebounce(function(e) {
      trigger(this);
    }));
    // Bind next and prev, if they exist.
    $(settings.nextSelector).click(next);
    $(settings.prevSelector).click(prev);
  }

  function disable() {
    // Unbind triggers.
    $triggers.off();
  }

  function getOnItems() {
    // Get all relevant elements marked by the onClass.
    return $items.filter('.' + onClass);
  }

  function isOn($el) {
    // Check if an element is on.
    return $el.hasClass(onClass);
  }

  function innerFocus(e) {
    var $el = $(e.target),
        $groupPart = (!settings.scattered) ? $el : $el.closest(settings.contentSelector),
        groupIsOn = isOn(getGroup($groupPart));
    if (!groupIsOn) {
      trigger($groupPart);
    }
  }

  function getGroupById(id) {
    return $items.filter('[data-uft-group="' + id + '"]');
  }

  function getGroup(input) {
    // Get the group related to input.
    // input can be a group number or a jQuery selector for a trigger.
    if (typeof input === 'number') {
      // If input is a number, get the group with that number.
      return getGroupById(input);
    // If input is a jQuery selector ...
    } else if (settings.scattered) {
      // ... and scattered is true, get the group by its number.
      return getGroupById($(input).data('uft-group'));
    } else {
      // ... and scattered is false, get the group element.
      return $(input).closest(settings.groupSelector);
    }
  }

  function trigger(input) {
    var $group = getGroup(input),
        turningOn = !$group.hasClass(onClass);
    if (turningOn) {
      turnOn($group);
    } else if (settings.allOff || (!settings.allOff && onCount > 1)) {
      turnOff($group);
    }
    // If outsideTurnsOff, make it happen.
    if (settings.outsideTurnsOff) {
      outsideTurnsOff($group, turningOn);
    }
  }

  function freezeScrollOn() {
    $('html').css({
      overflow: 'hidden',
      marginRight: '15px'
    });
  }
  function freezeScrollOff() {
    $('html').removeAttr('style');
  }

  function turnOn($group) {
    var trans = (settings.onTrans) ? settings.onTrans : settings.trans;

    if (settings.onlyOneOn) {
      var $onItems = getOnItems();
      if (settings.overlap) {
        // If overlap is allowed, turn off current $onItems
        // and turn on $group at the same time.
        turnOff($onItems);
        actuallyTurnOn();
      } else {
        // If overlap is not allowed, turn on $group
        // only after current $onItems are done turning off.
        turnOff($onItems, actuallyTurnOn);
      }
    } else {
      actuallyTurnOn();
    }

    if (settings.freezeScroll) {
      freezeScrollOn();
    }

    function actuallyTurnOn() {
      $group.addClass(transOnClass)
        .removeClass(offClass)
        .addClass(onClass);
      settings.onCallback({ '$group': $group, 'action': 'on'});
      utils.optionalDelay(trans, function() {
        $group.removeClass(transOnClass);
      });
      onCount++;
    }
  }

  function turnOff($group, callback) {
    var cb = callback || function(){},
        trans = (settings.offTrans) ? settings.offTrans : settings.trans;
    if ($group.length > 0) {
      $group.addClass(transOffClass);
      utils.optionalDelay(trans, function() {
        cb();
        $group.removeClass(transOffClass)
          .removeClass(onClass)
          .addClass(offClass);
        settings.offCallback({ '$group': $group, 'action': 'off'});
        onCount--;
      });
      if (settings.freezeScroll) {
        utils.optionalDelay(trans, freezeScrollOff);
      }
    }
  }

  function outsideTurnsOff($group, turningOn) {
    if (turningOn) {
      outsideEnable();
    } else {
      outsideDisable();
    }

    function outsideEnable() {
      // Make it so that clicking anywhere outside $group
      // turns off $group.
      // touchend is necessary for iOS.
      var ev = 'click touchend',
          $inside = (settings.outsideTurnsOff === true) ? $group : $(settings.outsideTurnsOff);
      $inside.on(ev, function(e) {
        e.stopPropagation();
      });
      // Only allow the event once: it will get
      // re-delegated if $group opens again.
      $(document).one(ev, function(e) {
        if (!$inside.is($(ev.target))) {
          turnOff($group);
          outsideDisable();
        }
      });
    }

    function outsideDisable() {
      $(document).off();
    }
  }

  function nextOrPrev(dir) {
    if (!settings.onlyOneOn) {
      throw new Error('UnfinishedToggler cannot use next() and prev() without the setting {onlyOneOn: true}.');
    }
    var currentGroup = getOnItems().first().data('uft-group'),
        firstGroup = Math.min.apply(Math, groupIds),
        lastGroup = Math.max.apply(Math, groupIds),
        targetGroup;
    if (dir === 'next') {
      targetGroup = (currentGroup + 1 <= lastGroup) ? currentGroup + 1 : firstGroup;
    } else if (dir === 'prev') {
      targetGroup = (currentGroup - 1 >= firstGroup) ? currentGroup - 1 : lastGroup;
    }
    trigger(targetGroup);
  }
  function next() {
    nextOrPrev('next');
  }
  function prev() {
    nextOrPrev('prev');
  }

  function turnAllOn() {
    // If onlyOneOn is not true, turn on all items.
    if (!settings.onlyOneOn) {
      turnOn($items);
    } else {
      throw new Error('UnfinishedToggler will not turnAllOn with the setting {onlyOneOn: true}.');
    }
  }
  function turnAllOff() {
    // If allOff is allowed, turn off all items.
    if (settings.allOff) {
      turnOff($items);
    } else {
      throw new Error('UnfinishedToggler will not turnAllOff with the setting {allOff: true}.');
    }
  }
}

// Generic utilities needed by the plugin
UnfinishedToggler.prototype.utils = {

  simpleDebounce: function(func) {
    // Basically taken from Underscore and simplified.
    var timeout, args, context, timestamp, result;
    var wait = 200;
    return function() {
      context = this;
      args = arguments;
      timestamp = new Date();
      var later = function() {
        var last = (new Date()) - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          result = func.apply(context, args);
        }
      };
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      return result;
    };
  },

  optionalDelay: function(delay, func) {
    if (delay > 0)
      window.setTimeout(func, delay);
    else
      func();
  }

};

UnfinishedToggler.prototype.defaults = {
  // an context-element containing all the others,
  // within which to find the toggler's parts
  'root': 'body',
  'onClass': 'uft-on',
  'offClass': 'uft-off',
  'groupSelector': '.uft-group',
  'triggerSelector': '.uft-trigger',
  'contentSelector': '.uft-content',
  // selector for a "next" trigger
  'nextSelector': false,
  // selector for a "prev" trigger
  'prevSelector': false,
  // scattered is true if the triggers and content
  // are not children of group-elements. scattered groups
  // are identified by data-uft-group attributes.
  'scattered': false,
  // only allow one item to be on at a time
  'onlyOneOn' : true,
  // all items can be off at the same time
  'allOff' : true,
  // a selector for an initially-triggered trigger
  'initial' : false,
  // the event(s) that triggers a change
  'event' : 'click',
  // a callback to perform when turning on
  'onCallback': function(){},
  // a callback to perform when turning off
  'offCallback': function(){},
  // transition time when turning on
  'onTrans': 0,
  // transition time when turning off
  'offTrans': 0,
  // transition time when turning both on and off
  'trans': 0,
  // transition on and off state overlap
  'overlap': true,
  // a click outside of the group turns it off
  'outsideTurnsOff': false,
  // selectors for inner elements that will turn
  // on the group when they receive focus
  'innerFocus': false,
  // freeze scrolling when a group is open
  // (useful for modals)
  'freezeScroll': false
};