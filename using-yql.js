$(document).ready(function(){
  $('.ajaxtrigger').click(function(){
    doAjax($(this).attr('href'));
    return false;
  });

});


