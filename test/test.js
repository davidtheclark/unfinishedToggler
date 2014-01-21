var modal = new UnfinishedToggler({
  scattered: true,
  triggerSelector: '.modal-trigger',
  contentSelector: '.modal-content',
  freezeScroll: true,
  offTransTime: 400,
  outsideTurnsOff: '.modal-popup'
});

// adding escape to close modal
$(document).keyup(function(e) {
  if (e.keyCode == 27 && modal.getOnItems().length > 0) {
    modal.turnAllOff();
  }
});

var carousel = new UnfinishedToggler({
  root: '#carousel',
  contentSelector: '.carousel-i',
  triggerSelector: '.carousel-tracker',
  nextSelector: '#carousel-next',
  prevSelector: '#carousel-prev',
  allOff: false,
  startOff: false,
  scattered: true
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
  startOff: false
});


var nav = new UnfinishedToggler({
  root: '#nav',
  groupSelector: '.nav > li',
  triggerSelector: '.nav > li > a',
  onClass: 'is-active',
  offClass: 'is-inactive',
  outsideTurnsOff: true,
  innerFocus: 'a',
  startOff: true,
  offTransTime: 300,
  transOverlap: false
});

var accordion = new UnfinishedToggler({
  root: '#accordion',
  scattered: true,
  contentSelector: '.uft-group',
  onCallback: function(uft) {
    uft.$group.find('.accordion-content').slideDown();
    $('html, body').animate({scrollTop: uft.$group.offset().top});
  },
  offCallback: function(uft) {
    uft.$group.find('.accordion-content').slideUp();
  }
});

var popup = new UnfinishedToggler({
  triggerSelector: '.popup-t',
  groupSelector: '.popup-g',
  onClass: 'popup-on',
  offClass: 'popup-off',
  events: ['click', 'focus'],
  outsideTurnsOff: true,
  startOff: true
});