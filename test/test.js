var carousel = new UnfinishedToggler({
  root: '#carousel',
  contentSelector: '.carousel-i',
  triggerSelector: '.carousel-tracker',
  nextSelector: '#carousel-next',
  prevSelector: '#carousel-prev',
  allOff: false,
  scattered: true,
  trans: 500
});

var input = new UnfinishedToggler({
  triggerSelector: '#test-input',
  groupSelector: '#input',
  outsideTurnsOff: true
});

var tabs = new UnfinishedToggler({
  root: '#tabs',
  scattered: true,
  allOff: false,
  trans: 300,
  overlap: false
});


var nav = new UnfinishedToggler({
  root: '#nav',
  groupSelector: 'li',
  triggerSelector: '> li > a',
  contentSelector: '.subnav',
  event: 'click focus',
  onClass: 'is-active',
  outsideTurnsOff: true
});

var accordion = new UnfinishedToggler({
  root: '#accordion',
  scattered: true,
  contentSelector: '.uft-group',
  onCallback: function(uft) {
    uft.$group.find('.accordion-content').slideDown();
    $('html, body').animate({scrollTop: uft.$group.offset().top});
  },
  onTrans: 300,
  offCallback: function(uft) {
    setTimeout(function() {
      uft.$group.find('.accordion-content').slideUp();
    }, 300);
  }
});

var popup = new UnfinishedToggler({
  triggerSelector: '.popup-t',
  groupSelector: '.popup-g',
  onClass: 'popup-on',
  offClass: 'popup-off',
  outsideTurnsOff: true
}).turnAllOff();