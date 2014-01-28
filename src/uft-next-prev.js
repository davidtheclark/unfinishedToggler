// Register defaults.
UnfinishedToggler.prototype.registerDefault({
  // selector for elements that will turn on the next group
  'nextSelector': false,
  // selector for elements that will turn on the previous group
  'prevSelector': false
});

// What it does.
$.extend(UnfinishedToggler.prototype, {
  nextOrPrev: function(dir) {
    var uft = this,
        s = uft.settings,
        nextPrevErrorStart = 'UnfinishedToggler cannot use next() and prev() ',
        currentGroup, firstGroup, lastGroup, targetGroup;

    // First, check that next() or prev() make sense with the settings and markup.
    if (!s.onlyOneOn)
      throw new Error(nextPrevErrorStart + 'with the setting {onlyOneOn: false}.');

    currentGroup = uft.getOnItems().first().data('uft-group');
    if (typeof currentGroup === 'undefined')
      throw new Error(nextPrevErrorStart + 'unless data-uft-group values are defined.');
    else if (typeof currentGroup !== 'number')
      throw new Error(nextPrevErrorStart + 'unless data-uft-group values are integers.');

    firstGroup = Math.min.apply(Math, uft.groupIds);
    lastGroup = Math.max.apply(Math, uft.groupIds);
    if (dir === 'next')
      targetGroup = (currentGroup + 1 <= lastGroup) ? currentGroup + 1 : firstGroup;
    else
      targetGroup = (currentGroup - 1 >= firstGroup) ? currentGroup - 1 : lastGroup;
    uft.triggerGroup(targetGroup);
  },

  // next() and prev() are just public-facing methods.
  next: function() {
    this.nextOrPrev('next');
  },
  prev: function() {
    this.nextOrPrev('prev');
  }
});

// Register `init` functionality.
UnfinishedToggler.prototype.registerHook('init', function() {
  var uft = this;
  // `groupIds` will contain the IDs of all groups, so methods
  // .next() and .prev() can move in order.
  uft.groupIds = [];
  uft.groupIds = $.map(uft.$items, function(group, i) {
    var thisGroupId = $(group).data('uft-group');
    if (thisGroupId && uft.groupIds.indexOf(thisGroupId) === -1)
      return thisGroupId;
  });
});

// Register `enable` functionality.
UnfinishedToggler.prototype.registerHook('enable', function() {
  var uft = this,
      s = uft.settings;
  // Bind next- and prev-triggers, if they exist.
  if (s.nextSelector) {
    $(s.nextSelector).on(uft.namespaceEvent('click'), function(e) {
      uft.next.call(uft, this);
    });
  }
  if (s.prevSelector) {
    $(s.prevSelector).on(uft.namespaceEvent('click'), function(e) {
      uft.prev.call(uft, this);
    });
  }
});

// Register `disable` functionality.
UnfinishedToggler.prototype.registerHook('disable', function() {
  var s = this.settings;
  // Unbind next- and prev- triggers.
  if (s.nextSelector)
    $(s.nextSelector).off(this.namespaceEvent());
  if (s.prevSelector)
    $(s.prevSelector).off(this.namespaceEvent());
});