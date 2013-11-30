function UnfinishedToggler(options) {

  // Initialization.
  var settings = $.extend({}, this.defaults, options),
      $root = $(settings.root),
      onClass = settings.onClass,
      offClass = settings.offClass,
      $triggers = $root.find(settings.triggerSelector),
      // $items contains the elements whose onClass will
      // be toggled. If `scattered` is false, $items only
      // include the containing items; if `scattered` is
      // true, items include triggers and contents.
      $items = (!settings.scattered) ? $root.find(settings.groupSelector) : $triggers.add(settings.contentSelector),
      onCount = 0;

  init();

  // Return public methods.
  return {
    trigger: trigger,
    disable: disable,
    enable: enable,
    turnAllOn: turnAllOn,
    turnAllOff: turnAllOff
  };

  function init() {

    enable();

    if (settings.focusOpens) {
      focusOpens();
    }

    if (settings.initial) {
      // If there is an initial to turn on, do it.
      trigger(settings.initial);

    } else if (!settings.allOff && getOnItems().length === 0) {
      // Otherwise, if no initial, but allOff is not allowed
      // and nothing is turned on in the markup ...
      // trigger the first trigger.
      $triggers.first()
        .trigger(settings.event);
    }
  }

  function enable() {
    $triggers.on(settings.event, function() {
      trigger(this);
    });
  }

  function simpleDebounce(func) {
    // basically from underscore
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
  }

  function focusOpens() {
    var $focusableElements = (settings.scattered) ? $root.find(settings.contentSelector) : $items;
    $focusableElements.on('focusin', simpleDebounce(function() {
      var $group = getElGroup($(this));
      if (!isOn($group)) {
        changeTo($(this));
      }
    }));
  }

  function disable() {
    $triggers.off();
  }

  function trigger(el) {
    changeTo($(el));
  }

  function getOnItems() {
    return $items.filter('.' + onClass);
  }

  function isOn($el) {
    return $el.is(getOnItems());
  }

  function getElGroup($el) {
    if (settings.scattered) {
      return $items.filter('[data-uft-group="' + $el.data('uft-group') + '"]');
    } else {
      return $el.closest(settings.groupSelector);
    }
  }

  function changeTo($el) {
    effectChange(getElGroup($el));
  }

  function turnOn($el) {
    toggleOnOff($el, 'on', settings.onDelay, settings.onCallback);
    onCount++;
  }

  function turnAllOn() {
    if (!settings.onlyOneOn) {
      turnOn($items);
    } else {
      throw new Error('UnfinishedToggler will not turnAllOn with the setting {onlyOneOn: true}.');
    }
  }

  function turnOff($el) {
    toggleOnOff($el, 'off', settings.offDelay, settings.offCallback);
    onCount--;
  }

  function turnAllOff() {
    if (settings.allOff) {
      turnOff($items);
    } else {
      throw new Error('UnfinishedToggler will not turnAllOff with the setting {allOff: true}.');
    }
  }

  function optionalDelay(fn, delay) {
    if (delay) {
      window.setTimeout(fn, delay);
    } else {
      fn();
    }
  }

  function toggleOnOff($el, action, delay, callback) {
    function doTheToggling() {
      if (action === 'on') {
        $el.addClass(onClass);
        $el.removeClass(offClass);
      } else {
        $el.removeClass(onClass);
        $el.addClass(offClass);
      }
      if (settings.clickOutsideCloses) {
        clickOutsideCloses($el, action);
      }
    }
    optionalDelay(doTheToggling, delay);
    callback({
      'action': action,
      '$el': $el
    });
  }

  function effectChange($el) {
    var onItems = getOnItems();
    if (!$el.hasClass(onClass)) {
      // If $el is being turned on ...
      if (settings.onlyOneOn) {
        // ... and onlyOneOn is true, turn off any
        // already-on items before you ...
        turnOff(onItems);
      }
      // ... turn $clickedItem on.
      turnOn($el);
    } else if (settings.allOff || (!settings.allOff && onCount > 1)) {
      // If $el is being turned off only turn it off if allOff is true
      // or allOff is false but at least one other item is on.
      turnOff($el);
    }
  }

  function clickOutsideCloses($el, action) {
    function outsideEnable() {
      var ev = 'click touchend';
      $el.on(ev, function(e) {
        e.stopPropagation();
      });
      $(document).one(ev, function(e) {
        if (!$el.is($(ev.target))) {
          turnOff($el);
          outsideDisable();
        }
      });
    }
    function outsideDisable() {
      $(document).off();
    }
    if (action === 'on') {
      outsideEnable();
    } else {
      outsideDisable();
    }
  }
}

UnfinishedToggler.prototype.defaults = {
  'root': 'body',
  'onClass': 'uft-on',
  'offClass': 'uft-off',
  'groupSelector': '.uft-group',
  'triggerSelector': '.uft-trigger',
  'contentSelector': '.uft-content',
  // scattered is true if the triggers and content
  // are not children of the items. scattered groups
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
  // delay before changing class when turning on
  'onDelay': 0,
  // delay before changing class when turning off
  'offDelay': 0,
  // a click outside of the group closes it
  'clickOutsideCloses': false,
  // focusing inside a group turns it on
  'focusOpens': true
};