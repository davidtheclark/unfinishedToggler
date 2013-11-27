;(function($) {

  var defaults = {
    'onClass': 'uft-on',
    'itemSelector': '.uft-item',
    'triggerSelector': '.uft-trigger',
    'contentSelector': '.uft-content',
    // scattered is true if the triggers and content
    // are not children of the items
    'scattered': false,
    // only allow one item to be "on" at a time
    'onlyOneOn' : true,
    // all items can be "off" at the same time
    'allOff' : true,
    // a selector for an initially-on item
    'initial' : false,
    // the event(s) that triggers a change
    'event' : 'click',
    // a callback to perform when turning an item "on"
    'onCallback': false,
    // a callback to perform when turning an item "off"
    'offCallback': false
  };

  function UnfinishedToggler(element, options) {

    // initialization
    var $root = $(element),
        settings = $.extend({}, defaults, options),
        onClass = settings.onClass,
        $triggers = $root.find(settings.triggerSelector),
        // $items contains the elements whose onClass will
        // be toggled. If `scattered` is false, $items only
        // include the containing items; if `scattered` is
        // true, items include triggers and contents.
        $items = (!settings.scattered) ? $root.find(settings.itemSelector) : $triggers.add(settings.contentSelector),
        changeFn = (!settings.scattered) ? changeGathered : changeScattered;

    $triggers.on(settings.event, changeFn);

    if (settings.initial) {
      $(settings.initial).addClass(onClass);
    }

    function getOnItems() {
      return $items.filter('.' + onClass);
    }

    function turnOn($el) {
      $el.addClass(onClass);
      if (settings.onCallback) {
        settings.onCallback($el);
      }
    }

    function turnOff($el) {
      $el.removeClass(onClass);
      if (settings.offCallback) {
        settings.offCallback($el);
      }
    }

    function changeGathered() {
      // Receives the clicked trigger as "this".
      effectChange($(this).closest(settings.itemSelector));
    }

    function changeScattered() {
      // Receives the clicked trigger as "this".
      var groupId = $(this).data('uft-group'),
          groupSelector = '[data-uft-group="' + groupId + '"]',
          $group = $items.filter(groupSelector);
      effectChange($group);
    }

    function effectChange($el) {
      // If $el is being turned on ...
      if (!$el.hasClass(onClass)) {
        // ... and onlyOneOn is true, turn off any
        // already-on items before you ...
        if (settings.onlyOneOn) {
          turnOff(getOnItems());
        }
        // ... turn $clickedItem on.
        turnOn($el);

      // If $el is being turned off ...
      } else {
        // ... only turn it off if allOff is true
        // or allOff is false but at least one other item is on.
        if (settings.allOff || (!settings.allOff && getOnItems().length > 1)) {
          turnOff($el);
        }
      }
    }

  }

  $.fn.unfinishedToggler = function(options) {
    return this.each(function () {
      new UnfinishedToggler(this, options);
    });
  };

})(jQuery);