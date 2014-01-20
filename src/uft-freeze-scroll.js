UnfinishedToggler.prototype.freezeScrollOn = function() {
  var uft = this,
      rootStyles = { overflow: 'hidden' };
  // If there is a scrollbar
  if (uft.hasScrollbar) {
    var scrollbarSize = uft.getScrollbarSize();
    if (scrollbarSize)
      rootStyles['margin-right'] = scrollbarSize;
  }
  $('html').css(rootStyles);
};

UnfinishedToggler.prototype.freezeScrollOff = function() {
  $('html').css({ 'overflow': '', 'margin-right': '' });
};

UnfinishedToggler.prototype.getScrollbarSize = function() {
  // Thanks to code from MagnificPopup
  if(this.scrollbarSize === undefined) {
    var scrollDiv = document.createElement("div");
    scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(scrollDiv);
    this.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
  }
  return this.scrollbarSize;
};

UnfinishedToggler.prototype.hasScrollbar = function() {
  return document.body.scrollHeight > $(window).height();
};