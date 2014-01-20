UnfinishedToggler.prototype.outsideTurnsOff = function($group, turningOn) {
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
    $('html').on(ev, outsideTriggered);
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
};