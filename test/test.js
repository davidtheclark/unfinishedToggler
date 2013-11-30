$('#nav').unfinishedToggler({
  groupSelector: 'li',
  triggerSelector: 'li > a',
  contentSelector: '.subnav',
  event: 'click focus',
  onClass: 'is-active',
  clickOutsideCloses: true
});

$('#accordion').unfinishedToggler({
  onlyOneOn: false,
  scattered: true,
  contentSelector: '.uft-group',
  onCallback: function(uft) {
    uft.$el.find('.accordion-content').slideDown();
    $('html, body').animate({scrollTop: uft.$el.offset().top});
  },
  onDelay: 300,
  offCallback: function(uft) {
    setTimeout(function() {
      uft.$el.find('.accordion-content').slideUp();
    }, 300);
  }
});

$('#tabs').unfinishedToggler({
  scattered: true,
  allOff: false
});




$('#insider').unfinishedToggler({
  groupSelector: '.insider-group',
  triggerSelector: '.insider-trigger'
});