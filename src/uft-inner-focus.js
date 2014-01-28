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