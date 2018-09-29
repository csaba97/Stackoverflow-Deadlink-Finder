var apiUrl = "https://api.stackexchange.com/2.2/";
var regKeyUrl = "&key=6XCcTC6F0uxg2NYxjQSxSA((";
var pagesize = 100;

function getPosts(page) {
  var URL = apiUrl + "posts?page=" + page + "&pagesize=" + pagesize + "&todate=1473465600&order=desc&sort=activity&site=stackoverflow"+regKeyUrl;

  var value = $.ajax({
    url: URL,
    async: false
  }).responseJSON;
  return value;
}

function getPostById(id) {
  var URL = apiUrl + "posts/" + id + "?&site=stackoverflow&filter=withbody"+regKeyUrl;

  var value = $.ajax({
    url: URL,
    async: false
  }).responseJSON;
  return value;
}

function urlExists(url, postLink) {
  var samOriginURL = "https://cors-anywhere.herokuapp.com/" + url;
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if(xhr.status > 400)
        console.log("postLink=" + postLink + " url down: "+url);
    }
  };
  xhr.open('HEAD', samOriginURL);
  xhr.send();
}


$(document).ready(function() {

  var items = getPosts(1).items;
  for (let i = 0; i < items.length; i++) {
    //parse body of post
    var postId = items[i].post_id;
    var postLink = items[i].link;
    //console.log(postId);
    var post = getPostById(postId);
    var body = post.items[0].body;
    //body='<p>Further to my previous <a href="http://blog.rafaelsanches.com/2012/02/02/spring-mvc-velocity-dcevm/">Question</a>, which I managed to answer myself with <a href="https://forums.oracle.com/forums/message.jspa?messageID=10817895#10817895" rel="nofollow noreferrer">help from the Oracle forums</a>, I now have another issue which follows on from the earlier one (provided for background).</p>';
    var href = $('<div>').append(body).find('a');
    for (let i = 0; i < href.length; i++){
        var url = $(href[i]).attr('href');
        console.log(url);
        urlExists(url, postLink);
    }

  }

});
