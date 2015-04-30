$(document).on('click', '#add-vendor', function(e) {
  e.preventDefault();
  $.post('/list/vendor/add', function(data) {
    $('.restaurant table tbody').append(
      '<tr>' +
      '<td><label>'+data._id+'</label></td>' +
      '<td><input class="textbox" type="text" name="name:'+data._id+'" value="'+data.name+'"></td>' +
      '<td><input class="textbox" type="text" name="menu:'+data._id+'" value="'+data.menu.join(',')+'"></td>' +
      '</tr>'
    );
  });
});