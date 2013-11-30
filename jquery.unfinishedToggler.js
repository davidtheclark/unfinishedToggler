;(function($) {

  function optionalDelay(fn, delay) {
    if (delay) {
      window.setTimeout(fn, delay);
    } else {
      fn();
    }
  }

  function UnfinishedToggler(element, options) {

    // Initialization.
    var $root = $(element),
        settings = $.extend({}, $.fn.unfinishedToggler.defaults, options),
        onClass = settings.onClass,
        $triggers = $root.find(settings.triggerSelector),
        // $items contains the elements whose onClass will
        // be toggled. If `scattered` is false, $items only
        // include the containing items; if `scattered` is
        // true, items include triggers and contents.
        $items = (!settings.scattered) ? $root.find(settings.groupSelector) : $triggers.add(settings.contentSelector),
        onCount = 0,
        changeFn = (!settings.scattered) ? changeGathered : changeScattered;

    // Return public methods.
    return {
      uftTrigger: uftTrigger,
      init: init,
      disable: disable,
      enable: enable
    };

    function init() {

      enable();

      if (settings.initial) {
        // If there is an initial to turn on, do it.
        uftTrigger(settings.initial);

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
        uftTrigger(this);
      });
    }

    function disable() {
      $triggers.off();
    }

    function uftTrigger(el) {
      changeFn($(el));
    }

    function getOnItems() {
      return $items.filter('.' + onClass);
    }

    function changeGathered($el) {
      effectChange($el.closest(settings.groupSelector));
    }

    function changeScattered($el) {
      effectChange($items.filter('[data-uft-group="' + $el.data('uft-group') + '"]'));
    }

    function turnOn($el) {
      toggleOnOff($el, 'on', settings.onDelay, settings.onCallback);
      onCount++;
    }

    function turnOff($el) {
      toggleOnOff($el, 'off', settings.offDelay, settings.offCallback);
      onCount--;
    }

    function toggleOnOff($el, action, delay, callback) {
      function doTheToggling() {
        if (action === 'on') {
          $el.addClass(onClass);
        } else {
          $el.removeClass(onClass);
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
      if (action === 'on') {
        outsideEnable();
      } else {
        outsideDisable();
      }
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
    }
  }

  $.fn.unfinishedToggler = function(options) {
    var args = Array.prototype.slice.call(arguments, 1);
    return this.each(function() {
      var item = $(this),
          instance = item.data('uft');
      if (!instance) {
        // Create plugin instance and save it in data.
        var uft = new UnfinishedToggler(this, options);
        item.data('uft', uft);
        // Then initialize.
        uft.init();
      } else if (typeof options === 'string') {
        // Allow the calling of methods.
        if (instance[options]) {
          instance[options].apply(instance, args);
        } else {
          throw new Error('UnfinishedToggler does not have a method "' + options + '".');
        }
      }
    });
  };

  $.fn.unfinishedToggler.defaults = {
    'onClass': 'uft-on',
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
    'clickOutsideCloses': false
  };

})(jQuery);