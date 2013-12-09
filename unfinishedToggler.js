function UnfinishedToggler(options) {

  var defaults = {
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
    // start by turning off all items
    'startOff': true,
    // a selector for an initially-triggered trigger
    'initialTrigger' : false,
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
    // (used INSTEAD OF onTrans and offTrans)
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

  // Establish variables and run init.
  var settings = $.extend({}, defaults, options),
      $root = $(settings.root),
      onClass = settings.onClass,
      offClass = settings.offClass,
      transOnClass = onClass + '-trans',
      transOffClass = offClass + '-trans',
      $triggers = $root.find(settings.triggerSelector),
      $contents = $root.find(settings.contentSelector),
      groupIds = [],
      // onCount should indicate the number of groups
      // currently turned on.
      onCount = 0,
      // $items contains the elements whose onClass will
      // be toggled. If `scattered` is false, $items only
      // include the containing items; if `scattered` is
      // true, items include triggers and contents.
      $items = (!settings.scattered) ? $root.find(settings.groupSelector) : $triggers.add($contents);

  // Utils are generic functions required by but not
  // specific to UFT.
  var utils = {
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
        if (!timeout)
          timeout = setTimeout(later, wait);
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

  init();

  // Return public methods.
  return {
    trigger: trigger,
    disable: disable,
    enable: enable,
    getOnItems: getOnItems,
    turnAllOn: turnAllOn,
    turnAllOff: turnAllOff,
    next: next,
    prev: prev
  };

  function init() {

    enable();

    // Turn off all items.
    if (settings.startOff)
      turnOff($items);

    if (settings.initialTrigger && settings.initialTrigger !== 'first') {
      // If there is an initialTrigger to trigger, do it.
      // But if initialTrigger is 'first', pass it along.
      trigger(settings.initialTrigger);
    } else if ((!settings.allOff && getOnItems().length === 0) || settings.initialTrigger === 'first') {
      // Otherwise, if no initialTrigger but allOff is not allowed
      // and nothing is turned on in the markup,
      // or initialTrigger is 'first',
      // trigger the first trigger with the first event.
      $triggers.first().trigger(settings.event.split(' ')[0]);
    }

    // Create an array of relevant groups,
    // used for next() and prev().
    $items.each(function() {
      var thisGroupId = $(this).data('uft-group');
      if (thisGroupId && groupIds.indexOf(thisGroupId) === -1) {
        groupIds.push(thisGroupId);
      }
    });

    // Enable innerFocus.
    if (settings.innerFocus)
      $root.find(settings.innerFocus).focus(innerFocus);

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
    // Unbind triggers and next and prev.
    $triggers.off();
    $(settings.nextSelector).off();
    $(settings.prevSelector).off();
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
    // Find the focus-target's group, and trigger it.
    var $el = $(e.target),
        $groupPart = (!settings.scattered) ? $el : $el.closest(settings.contentSelector),
        groupIsOn = isOn(getGroup($groupPart));
    if (!groupIsOn)
      trigger($groupPart);
  }

  function freezeScrollOn() {
    $('html').css({ overflow: 'hidden' });
  }

  function freezeScrollOff() {
    $('html').removeAttr('style');
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
    // If outsideTurnsOff, enable it.
    if (settings.outsideTurnsOff)
      outsideTurnsOff($group, turningOn);
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
      // If onlyOneOn is false, just turn $group on.
      actuallyTurnOn();
    }

    if (settings.freezeScroll)
      freezeScrollOn();

    function actuallyTurnOn() {
      $group.addClass(transOnClass)
        .removeClass(offClass)
        .addClass(onClass);
      // Call user-defined callback, passing some data.
      settings.onCallback({ '$group': $group, 'action': 'on'});
      utils.optionalDelay(trans, function() {
        // After the transition delay, remove the transition class.
        $group.removeClass(transOnClass);
      });
      onCount++;
    }
  }

  function turnOff($group, callback) {
    var cb = callback || function(){},
        trans = (settings.offTrans) ? settings.offTrans : settings.trans;
    if ($group.length > 0) {
      // First, add the transition class.
      $group.addClass(transOffClass);
      utils.optionalDelay(trans, function() {
        cb();
        // Then remove it, and toggle on/off classes,
        // after the transition delay.
        $group.removeClass(transOffClass)
          .removeClass(onClass)
          .addClass(offClass);
        // Call user-defined callback, passing some data.
        settings.offCallback({ '$group': $group, 'action': 'off'});
        onCount--;
      });
      if (settings.freezeScroll)
        utils.optionalDelay(trans, freezeScrollOff);
    } else {
      // If the group is empty, just call the callback.
      cb();
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
    // First, check that next() or prev() make sense with the setup.
    if (!settings.onlyOneOn)
      throw new Error('UnfinishedToggler cannot use next() and prev() with the setting {onlyOneOn: false}.');
    var currentGroup = getOnItems().first().data('uft-group');
    if (typeof currentGroup === 'undefined') {
      throw new Error('UnfinishedToggler cannot use next() and prev() unless data-uft-group values are defined.');
    } else if (typeof currentGroup !== 'number') {
      throw new Error('UnfinishedToggler cannot use next() and prev() unless data-uft-group values are integers.');
    }

    var firstGroup = Math.min.apply(Math, groupIds),
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