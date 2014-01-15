var modal = UnfinishedToggler({
  scattered: true,
  triggerSelector: '.modal-trigger, .modal-container',
  contentSelector: '.modal-content',
  freezeScroll: true,
  offTrans: 500
});

// adding escape to close modal
$(document).keyup(function(e) {
  if (e.keyCode == 27 && modal.getOnItems().length > 0) {
    modal.turnAllOff();
  }
});

var carousel = UnfinishedToggler({
  root: '#carousel',
  contentSelector: '.carousel-i',
  triggerSelector: '.carousel-tracker',
  nextSelector: '#carousel-next',
  prevSelector: '#carousel-prev',
  allOff: false,
  startOff: false,
  scattered: true,
  trans: 500
});

var input = UnfinishedToggler({
  triggerSelector: '#test-input',
  groupSelector: '#input',
  outsideTurnsOff: true
});

var tabs = UnfinishedToggler({
  root: '#tabs',
  scattered: true,
  allOff: false,
  startOff: false,
  trans: 300,
  overlap: false
});


var nav = UnfinishedToggler({
  root: '#nav',
  groupSelector: '.nav > li',
  triggerSelector: '.nav > li > a',
  onClass: 'is-active',
  offClass: 'is-inactive',
  outsideTurnsOff: true,
  innerFocus: 'a',
  startOff: true,
  offTrans: 400,
  overlap: false
});

var accordion = UnfinishedToggler({
  root: '#accordion',
  scattered: true,
  contentSelector: '.uft-group',
  onCallback: function(uft) {
    uft.$group.find('.accordion-content').slideDown();
    $('html, body').animate({scrollTop: uft.$group.offset().top});
  },
  onTrans: 300,
  offCallback: function(uft) {
    uft.$group.find('.accordion-content').slideUp();
  }
});

var popup = new UnfinishedToggler({
  triggerSelector: '.popup-t',
  groupSelector: '.popup-g',
  onClass: 'popup-on',
  offClass: 'popup-off',
  event: 'click focus',
  outsideTurnsOff: true,
  startOff: true
});