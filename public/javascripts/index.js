$(document).on('click', '#submit-btn', function(e) {
  e.preventDefault();
  $.post('/submit', $('#order-form').serialize(), function(res) {
    var $orderMsg = $('#order-message');
    console.log(res);
    if (res.status == 'succeed') {
      $orderMsg.removeClass('ilab-warning').addClass('ilab-success').html(res.msg).fadeIn();
    } else if (res.status == 'failed'){
      $orderMsg.removeClass('ilab-success').addClass('ilab-warning').html(res.msg).fadeIn();
    }
  });
  $('#orderDialog').popup('close');
});