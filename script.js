var apiUrl = "https://api.stackexchange.com/2.2/";
var regKeyUrl = "&key=6XCcTC6F0uxg2NYxjQSxSA((";
var pagesize = 1;

async function getPosts(page) {
  var URL = apiUrl + "posts?page=" + page + "&pagesize=" + pagesize + "&todate=1473465600&order=desc&sort=activity&site=stackoverflow" + regKeyUrl;

  var value = await $.ajax({
    url: URL,
    async: false
  }).responseJSON;
  return value;
}

async function getPostById(id) {
  var URL = apiUrl + "posts/" + id + "?&site=stackoverflow&filter=withbody" + regKeyUrl;

  var value = await $.ajax({
    url: URL,
    async: false
  }).responseJSON;
  if(value.backoff !=null){
    //obey backoff -> sleep 'backoff' number of seconds

  }
  return value;
}

function urlExists(url, postLink) {
  var sameOriginURL = "https://cors-anywhere.herokuapp.com/" + url;
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status > 400) {
        $("#list").append("<li>status=" + xhr.status + "<a href='" + postLink + "'>     Stackoverflow-link       </a><a href='" + url + "'>broken-link</a></li>");
      }
    }
  };
  xhr.open('HEAD', sameOriginURL);
  xhr.send();
}


async function searchBrokenLinks(totalPages) {
  totalPages = totalPages || Number.MAX_SAFE_INTEGER;
  for (let page = 1; page <= totalPages; page++) {
    var jsonPost = await getPosts(page);

    //if daily limit has been exceeded then stop
    if (jsonPost.quota_remaining <= 1)
      return -1;

    var items = jsonPost.items;
    for (let i = 0; i < items.length; i++) {

      var postId = items[i].post_id;
      var postLink = items[i].link;
      var post = await getPostById(postId);

      //if daily limit has been exceeded then stop
      if (post.quota_remaining <= 1)
        return -1;

      var body = post.items[0].body;
      var href = $('<div>').append(body).find('a');
      for (let i = 0; i < href.length; i++) {
        var url = $(href[i]).attr('href');
        urlExists(url, postLink);
      }
    }
    //update progress bar - if totalPages is missing from the parameters then the result will be inaccurate
    //but returning the remaining page numbers with the api is expensive
    var amount = (100 * page) / totalPages;
    setProgressBar(amount);

    //if no more pages in result then break
    if (jsonPost.has_more == false)
      return 0;
  }
  return 0;
}

function setProgressBar(amount) {
  var wholeAmount = Number(amount);
  $("#progress-bar-complete").css("width", wholeAmount + "%");
  if (wholeAmount == 100)
    $("#progress-bar-complete").text("Complete");
  else $("#progress-bar-complete").text(wholeAmount + "%");
}


async function main(){
  var msg;
  var value = await searchBrokenLinks(0);

  switch (value) {
    case 0:
      msg = "Completed succesfully";
      break;
    case -1:
      msg = "Daily request limit exceeded";
      break;
  }

  alert(msg);
}

$(document).ready(function() {

  main();


});
