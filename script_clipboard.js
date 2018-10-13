var bodies = [];

function copyBodyToClipboard(nr) {
	 	var $temp = $("<textarea>");
    $("body").append($temp);
    console.log($("#body"+nr).text());
    $temp.val($("#body"+nr).text()).select();
    document.execCommand("copy");
    $temp.remove();
}
