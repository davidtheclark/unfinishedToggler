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
  onClass: 'is-on',
  offClass: 'is-off',
  transClass: 'is-trans',
  contentSelector: '.carousel-content',
  triggerSelector: '.carousel-tracker',
  nextSelector: '#carousel-next',
  prevSelector: '#carousel-prev',
  allOff: false,
  scattered: true,
  offTransTime: 300,
  nextInterval: 3000
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
  transOverlap: false,
  offTransTime: 500
});


var nav = new UnfinishedToggler({
  root: '#nav',
  groupSelector: '.nav > li',
  triggerSelector: '.nav > li > a',
  onClass: 'is-active',
  offClass: 'is-inactive',
  outsideTurnsOff: true,
  innerFocus: 'a',
  offTransTime: 300,
  transOverlap: false
});

var accordion = new UnfinishedToggler({
  root: '#accordion',
  scattered: true,
  contentSelector: '.uft-group',
  onTransDelay: 300,
  offTransTime: 300,
  onCallback: function(uft) {
    uft.$group.find('.accordion-content').slideDown(300);
    $('html, body').animate({scrollTop: uft.$group.offset().top});
  },
  offCallback: function(uft) {
    uft.$group.find('.accordion-content').slideUp(300);
  }
});

var popup = new UnfinishedToggler({
  triggerSelector: '.popup-t',
  groupSelector: '.popup-g',
  onClass: 'popup-on',
  offClass: 'popup-off',
  events: ['click', 'focus', 'mouseover'],
  outsideTurnsOff: true
});