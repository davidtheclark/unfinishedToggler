// Register defaults.
UnfinishedToggler.prototype.registerDefault({
  // freeze scrolling when a group is turned on;
  // basically used only for popups/modals
  'freezeScroll': false
});

// What it does.
$.extend(UnfinishedToggler.prototype, {

  freezeScrollOn : function() {
    var uft = this,
        rootStyles = { overflow: 'hidden' };

    // If there is a scrollbar
    if (uft.hasScrollbar) {
      // ... get its size
      var scrollbarSize = uft.getScrollbarSize();
      // ... and if there's any size, offset right margin to account.
      if (scrollbarSize)
        rootStyles['margin-right'] = scrollbarSize;
    }
    $('html').css(rootStyles);
  },

  freezeScrollOff: function() {
    $('html').css({ 'overflow': '', 'margin-right': '' });
  },

  getScrollbarSize: function() {
    // Thanks to code from MagnificPopup.
    if(this.data.scrollbarSize === undefined) {
      var scrollDiv = document.createElement("div");
      scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
      document.body.appendChild(scrollDiv);
      this.data.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
    }
    return this.data.scrollbarSize;
  },

  hasScrollbar: function() {
    return document.body.scrollHeight > $(window).height();
  }
});

// Register `turnOn` functionality.
UnfinishedToggler.prototype.registerHook('turnOn', function($group, turningOn) {
  // If `freezeScroll` is set, turn it on now.
  if (this.settings.freezeScroll)
    this.freezeScrollOn();
});

// Register `turnOff` functionality.
UnfinishedToggler.prototype.registerHook('turnOff', function($group, turningOn) {
  // If the scroll was frozen, unfreeze it.
  if (this.settings.freezeScroll)
    this.freezeScrollOff();
});