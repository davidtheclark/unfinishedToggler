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

$('#popups').unfinishedToggler({
  groupSelector: '.popup-group',
  contentSelector: '.popup-content',
  onClass: 'is-active',
  clickOutsideCloses: true
});


$('#popups').unfinishedToggler('turnOn', $('#popupfirst'));


$('#insider').unfinishedToggler({
  groupSelector: '.insider-group',
  triggerSelector: '.insider-trigger'
});