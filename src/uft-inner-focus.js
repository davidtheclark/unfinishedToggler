// Register defaults.
UnfinishedToggler.prototype.registerDefault({
  // selector for elements within groups that if focused
  // will turn on their containing group
  'innerFocus': false
});

// Register init.
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