var tabs = new UnfinishedToggler({
  root: '#tabs',
  scattered: true,
  allOff: false
});


var nav = new UnfinishedToggler({
  root: '#nav',
  groupSelector: 'li',
  triggerSelector: 'li > a',
  contentSelector: '.subnav',
  event: 'click focus',
  onClass: 'is-active',
  clickOutsideCloses: true
});

var accordion = new UnfinishedToggler({
  root: '#accordion',
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


var insider = new UnfinishedToggler({
  root: '#insider',
  groupSelector: '.insider-group',
  triggerSelector: '.insider-trigger'
});