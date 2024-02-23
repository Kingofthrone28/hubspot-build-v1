$(document).ready(function() {
  $('.tab').click(function() {
    $('#' + $(this).data('parent') + ' .tab').removeClass('tab-selected');
    $(this).addClass('tab-selected');
    $('#' + $(this).data('parent') + ' .tab-content').removeClass('tab-content-selected');
    $('#' + $(this).data('parent') + ' .tab-content').hide();
    $('#' + $(this).data('id')).show();
    $('#' + $(this).data('id')).addClass('tab-content-selected');
  });
});