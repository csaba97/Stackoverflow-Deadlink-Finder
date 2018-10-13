var bodies = [];

function copyBodyToClipboard(nr) {
  var $temp = $("<textarea>");
  $("body").append($temp);
  console.log($("#body" + nr).text());
  $temp.val($("#body" + nr).text()).select();
  document.execCommand("copy");
  $temp.remove();
}


$(document).ready(function() {
  //know where we left - the las button which was clicked, changes color
  $("button").click(function() {
    $(this).css('background-color', 'red');
  });
});
