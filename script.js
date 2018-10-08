var apiUrl = "https://api.stackexchange.com/2.2/";
var regKeyUrl = "&key=vmabJJcs4fmvFhEfbvagXg((";
//var regKeyUrl = "&key=6XCcTC6F0uxg2NYxjQSxSA((";
var waybackMachineURL = "http://archive.org/wayback/available";
var CORSdisableUrl = "https://cors-anywhere.herokuapp.com/";

//
var pagesize = 100;
var sleepAmount = 2000; //2 seconds
var nrBrokenLinks = 0;

//sleep without freezing UI thread
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function seconds_since_epoch(date) {
  return Math.floor(date.getTime() / 1000)
}


async function getArchivedURL(url){
  var apiUrl = waybackMachineURL + "?url=" + url;
  var sameOriginURL = CORSdisableUrl + apiUrl;
  var value = await $.ajax({
    url: sameOriginURL,
    async: false
  }).responseJSON;
  if(value){
    return value.archived_snapshots.closest.url;
  }
  return null;
}


async function getPosts(page,fromDate, toDate ) {
  var URL = apiUrl + "posts?page=" + page + "&pagesize=" + pagesize + "&todate="+seconds_since_epoch(toDate)+"&fromdate="+seconds_since_epoch(fromDate)+"&order=desc&sort=activity&site=stackoverflow" + regKeyUrl;

  var value = await $.ajax({
    url: URL,
    async: false
  }).responseJSON;

  if (value.backoff != null) {
    //obey backoff -> sleep 'backoff' number of seconds
    await sleep(value.backoff * 1000 + 100);
    console.log("backoff value present=" + value.backoff);
  } else {
    await sleep(sleepAmount);
  }
  return value;
}

async function getPostById(id) {
  var URL = apiUrl + "posts/" + id + "?&site=stackoverflow&filter=withbody" + regKeyUrl;

  var value = await $.ajax({
    url: URL,
    async: false
  }).responseJSON;
  if (value.backoff != null) {
    //obey backoff -> sleep 'backoff' number of seconds
    await sleep(value.backoff * 1000 + 100);
    console.log("backoff value present=" + value.backoff);
  } else {
    await sleep(sleepAmount);
  }
  return value;
}

function urlExists(url, postLink) {
  var sameOriginURL = CORSdisableUrl + url;
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status > 400) {
        nrBrokenLinks++;
        appendLinkToList(url, postLink, xhr.status);
      }
    }
  };
  xhr.open('HEAD', sameOriginURL);
  xhr.send();
}

async function appendLinkToList(url, postLink, status){
  var archivedUrl = await getArchivedURL(url);
  if(!archivedUrl)
        archivedUrl = "";
  $("#list").append("<li>status=" + status + "<a href='" + postLink + "'>     Stackoverflow-link       </a><a href='" + url + "'>broken-link</a><a href='" +  archivedUrl  +  "'>   archived-link   </a></li>");
}


async function searchBrokenLinks(totalPages) {
  totalPages = totalPages || Number.MAX_SAFE_INTEGER;
  for (let page = 1; page <= totalPages; page++) {
    var jsonPost = await getPosts(page, new Date(2010,7,1), new Date(2010,12,30));

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


async function main() {
  var msg;
  var value = await searchBrokenLinks(10);

  switch (value) {
    case 0:
      msg = "Completed succesfully!";
      break;
    case -1:
      msg = "Daily request limit exceeded!";
      break;
  }
  msg += " " + nrBrokenLinks + " broken links found...";
  alert(msg);
}

$(document).ready(function() {

  main();


});
