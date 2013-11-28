;(function($) {

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
        $items = (!settings.scattered) ? $root.find(settings.groupSelector) : $triggers.add(settings.contentSelector);

    // Return public methods.
    return {
      turnOn: turnOn,
      init: init
    };

    function init() {
      var changeFn = (!settings.scattered) ? changeGathered : changeScattered;
      $triggers.on(settings.event, function() {
        changeFn($(this));
      });

      // If there is an initial to turn on, do it.
      if (settings.initial) {
        $(settings.initial).addClass(onClass);

      // Otherwise, if no initial, but allOff is not allowed
      // and nothing is turned on in the markup ...
      // trigger the first trigger.
      } else if (!settings.allOff && getOnItems().length === 0) {
        $triggers.first().trigger(settings.event);
      }
    }

    function getOnItems() {
      return $items.filter('.' + onClass);
    }

    function changeGathered($el) {
      effectChange($el.closest(settings.groupSelector));
    }

    function changeScattered($el) {
      var groupId = $el.data('uft-group'),
          groupSelector = '[data-uft-group="' + groupId + '"]',
          $group = $items.filter(groupSelector);
      effectChange($group);
    }

    function turnOn($el) {
      toggleOnOff($el, 'on', settings.onDelay, settings.onCallback);
    }

    function turnOff($el) {
      toggleOnOff($el, 'off', settings.offDelay, settings.offCallback);
    }

    function toggleOnOff($el, action, delay, callback) {
      function doIt() {
        if (action === 'on') {
          $el.addClass(onClass);
        } else {
          $el.removeClass(onClass);
        }
        if (settings.clickOutsideCloses) {
          clickOutsideCloses($el, action);
        }
      }
      if (delay) {
        setTimeout(doIt, delay);
      } else {
        doIt();
      }
      callback({
        'action': action,
        '$el': $el
      });
    }

    function effectChange($el) {
      var onItems = getOnItems();
      // If $el is being turned on ...
      if (!$el.hasClass(onClass)) {
        // ... and onlyOneOn is true, turn off any
        // already-on items before you ...
        if (settings.onlyOneOn) {
          turnOff(onItems);
        }
        // ... turn $clickedItem on.
        turnOn($el);

      // If $el is being turned off ...
      } else {
        // ... only turn it off if allOff is true
        // or allOff is false but at least one other item is on.
        if (settings.allOff || (!settings.allOff && onItems.length > 1)) {
          turnOff($el);
        }
      }
    }

    function clickOutsideCloses($el, action) {
      if (action === 'on') {
        enable();
      } else {
        disable();
      }
      function enable() {
        var ev = 'click touchstart';
        $el.on(ev, function(e) {
          e.stopPropagation();
        });
        $('html').one(ev, function(e) {
          e.preventDefault();
          turnOff($el);
          disable();
        });
      }
      function disable() {
        $('html').off();
      }
    }
  }

  $.fn.unfinishedToggler = function(options) {
    // slice arguments to leave only arguments after function name
    var args = Array.prototype.slice.call(arguments, 1);
    return this.each(function() {
      var item = $(this),
          instance = item.data('uft');
      if (!instance) {
        // create plugin instance and save it in data
        var uft = new UnfinishedToggler(this, options);
        item.data('uft', uft);
        uft.init();
      } else if (typeof options === 'string') {
        instance[options].apply(instance, args);
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
    // a selector for an initially-on item
    'initial' : false,
    // the event(s) that triggers a change
    'event' : 'click',
    // a callback to perform when turning on
    'onCallback': function() {},
    // a callback to perform when turning off
    'offCallback': function() {},
    // delay before changing class when turning on
    onDelay: 0,
    // delay before changing class when turning off
    offDelay: 0,
    // a click outside of the group closes it
    clickOutsideCloses: false
  };

})(jQuery);