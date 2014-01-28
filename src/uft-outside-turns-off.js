// Register defaults.
UnfinishedToggler.prototype.registerDefault({
  // either `true`, to indicate that clicking anywhere
  // outside the turned-on group should turn it off,
  // or selector for the region in which you are welcome to
  // click without turning off the group (clicks outside that
  // region will turn it off)
  'outsideTurnsOff': false
});

// What it does.
UnfinishedToggler.prototype.outsideTurnsOff = function($group, turningOn) {
  var uft = this,
      s = uft.settings,
      // `touchend` event is necessary for iOS, it seems.
      ev = uft.namespaceEvent('click') + ' ' + uft.namespaceEvent('touchend'),
      $inside = (typeof s.outsideTurnsOff === 'string') ? $(s.outsideTurnsOff) : $group;

  if (turningOn)
    outsideEnable();
  else
    outsideDisable();

  function outsideEnable() {
    // Make it so that clicking anywhere outside `$inside`
    // turns off `$group`.
    $inside.on(ev, function(e) {
      e.stopPropagation();
    });
    // Only allow the event once: it will get
    // re-assigned if `$group` turns on again.
    // Timeout ensures that assignment happens
    // after the triggering event is done.
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
};

// Register `trigger` functionality.
UnfinishedToggler.prototype.registerHook('trigger', function($group, turningOn) {
  // If outsideTurnsOff, trigger it.
  if (this.settings.outsideTurnsOff)
    this.outsideTurnsOff($group, turningOn);
});