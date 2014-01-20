UnfinishedToggler.prototype.nextOrPrev = function(dir) {
  var uft = this,
      s = uft.settings,
      nextPrevErrorStart = 'UnfinishedToggler cannot use next() and prev() ',
      currentGroup, firstGroup, lastGroup, targetGroup;

  // First, check that next() or prev() make sense with the setup.
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
  else if (dir === 'prev')
    targetGroup = (currentGroup - 1 >= firstGroup) ? currentGroup - 1 : lastGroup;
  uft.trigger(targetGroup);
};

UnfinishedToggler.prototype.next = function() {
  this.nextOrPrev('next');
};

UnfinishedToggler.prototype.prev = function() {
  this.nextOrPrev('prev');
};