UnfinishedToggler.prototype.innerFocus = function(e) {
  // Find the focus-target's group, and trigger it.
  var uft = this,
      s = uft.settings,
      $el = $(e.target),
      $groupPart = (!s.scattered) ? $el : $el.closest(s.contentSelector),
      groupIsOn = uft.isOn(uft.getGroup($groupPart));

  if (!groupIsOn)
    uft.trigger($groupPart);
};