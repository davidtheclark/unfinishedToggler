(function($) {

  function animateHeight(element, action) {
    var $el = $(element);

    if (action === 'open') {
      _animateHeightOpen($el);
    } else if (action === 'close') {
      _animateHeightClose($el);
    }

    function _animateHeightOpen($el) {
      var $parent = $el.parent();
      var $clone = $el.clone()
        .css({
          'width': $el.width(),
          'position': 'absolute',
          'z-index': '-10',
          'visibility': 'hidden'
        })
        .appendTo($parent);
      var cloneContentHeight = $clone
        .height('auto')
        .height();
      $clone.remove();
      $el.height(cloneContentHeight);
    }

    function _animateHeightClose($el) {
      $el.height(0);
    }
  }

  $.fn.animateHeight = function(action) {
    return this.each(function () {
      animateHeight(this, action);
    });
  };
})(jQuery);


$('#accordion').unfinishedToggler({
  onlyOneOn: false,
  onCallback: function($el) {
    $el.find('.accordion-content').animateHeight('open');
  },
  offCallback: function($el) {
    $el.find('.accordion-content').animateHeight('close');
  }
});

$('#tabs').unfinishedToggler({
  scattered: true
});

$('#tooltips').unfinishedToggler({
  scattered: true,
  triggerSelector: '.tooltip-btn',
  contentSelector: '.tooltip-content',
  onClass: 'is-active'
});