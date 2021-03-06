var apiUrl = "https://api.stackexchange.com/2.2/";
var regKeyUrl = "&key=vmabJJcs4fmvFhEfbvagXg((";
//var regKeyUrl = "&key=6XCcTC6F0uxg2NYxjQSxSA((";
var waybackMachineURL = "http://archive.org/wayback/available";
var CORSdisableUrl = "https://cors-anywhere.herokuapp.com/";

var body; //make it global variable to remain changed after several link replace
//
//started from 2008-09
var startDate = new Date(2008, 7, 14);
var endDate = new Date(2008, 7, 15);
var pagesize = 100;
var sleepAmount = 2000; //2 seconds
var sleepNoConnection = 3000;
var nrBrokenLinks = 0;
var ajaxTimeout = 5000; //5 seconds
var nrTries = 0;
var customPostFilter = "!0S26ZGstNd3Z5PS9PCgaXBpVD"; //contains body, body_markdown, has_more, quota_remaining, post_id, link
var totPages = 10;

var maxPage = 0;

//sleep without freezing UI thread
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function seconds_since_epoch(date) {
  return Math.floor(date.getTime() / 1000)
}


async function isInternetConnection() {
  try {
    await $.ajax({
      url: CORSdisableUrl + "google.com",
    });
  } catch (err) {
    console.log(err.message);
    return false;
  }
  return true;
}

async function getArchivedURL(url) {
  nrTries = nrTries + 1;
  var apiUrl = waybackMachineURL + "?url=" + url;
  var sameOriginURL = CORSdisableUrl + apiUrl;
  var value = null;
  try {
    value = await $.ajax({
      url: sameOriginURL,
      timeout: ajaxTimeout
    });
    if (value.archived_snapshots.closest.url) {
      return value.archived_snapshots.closest.url;
    }
  } catch (err) {
    console.log(err.message);
    var conn = await isInternetConnection();
    if (conn) {
      return null; //it means we have another error =>> just continue executing
    }
    await sleep(sleepNoConnection); //sleep after checking internet connection because it can happen that connection is resumed after sleep
    var result = await getArchivedURL(url);
    return result;
  }
  return null;
}


async function getPosts(page, fromDate, toDate) {
  var URL = apiUrl + "posts?page=" + page + "&pagesize=" + pagesize + "&todate=" + seconds_since_epoch(toDate) + "&fromdate=" + seconds_since_epoch(fromDate) + "&order=desc&sort=activity&site=stackoverflow" + regKeyUrl;
  var value = null;
  try {
    value = await $.ajax({
      url: URL,
      timeout: ajaxTimeout
    });

    if (value.backoff != null) {
      //obey backoff -> sleep 'backoff' number of seconds
      await sleep(value.backoff * 1000 + 100);
      console.log("backoff value present=" + value.backoff);
    } else {
       // console.log("sleepAmount");
      await sleep(sleepAmount);
    }
  } catch (err) {
      await sleep(sleepAmount);
    console.log(err.message);
    var conn = await isInternetConnection();
    if (conn) {
      return null; //it means we have another error =>> just continue executing
    }
    await sleep(sleepNoConnection);
    var result = await getPosts(page, fromDate, toDate);
    return result;
  }
  return value;
}

async function getPostById(id) {
  var URL = apiUrl + "posts/" + id + "?&site=stackoverflow&filter=" + customPostFilter + regKeyUrl;
  var value = null;
  try { //use try catch so when the computer goes to sleep, the script does not give an error
    value = await $.ajax({
      url: URL,
      timeout: ajaxTimeout
    });
    if (value.backoff != null) {
      //obey backoff -> sleep 'backoff' number of seconds
      await sleep(value.backoff * 1000 + 100);
      console.log("backoff value present=" + value.backoff);
    } else {
      await sleep(sleepAmount);
    }
  } catch (err) {
    console.log(err.message);
    var conn = await isInternetConnection();
    if (conn) {
      return null; //it means we have another error =>> just continue executing
    }
    await sleep(sleepNoConnection);
    var result = await getPostById(id);
    return result;
  }

  return value;
}

async function urlExists(text, url, postLink, i) {
  nrTries = nrTries + 1; //workaround for the situation when other error occurs than connection error(not to repeat the same function multiple times)
  try { //use try catch so when the computer goes to sleep, the script does not give an error
    var sameOriginURL = CORSdisableUrl + url;
    var status = 0;
    await $.ajax({
      type: "HEAD",
      url: sameOriginURL,
      timeout: ajaxTimeout,
      error: function(xhr, statusText, err) {
        status = xhr.status;
      }
    });
    if (status === 404)//if (status > 400)
      await appendLinkToList(text, url, postLink, status, i);
  } catch (err) {
    console.log(err.message);
    if (status === 404) {//if (status > 400)
      await appendLinkToList(text, url, postLink, status, i);
      return null;
    }
    var conn = await isInternetConnection();
    if (conn) {
      return null; //it means we have another error =>> just continue executing
    }
    //sleep after checking internet connection because it can happen that connection is resumed after sleep
    await sleep(sleepNoConnection);
    await urlExists(text, url, postLink, i);
  }

}

//quote String to interpret it as String and not Regex
RegExp.quote = function(str) {
  return (str + '').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
};

function replaceLinkInBody(oldLink, newLink) {
  var find = oldLink;
  var re = new RegExp(RegExp.quote(find), 'g');
  var body2 = body.replace(re, newLink);
  body = body2;
}


function saveBody(nr) {
  var $temp = $("<textarea>");
  $temp.attr("id", "body" + nr);
  $temp.hide();
  $temp.text(bodies[nr - 1]);
  $("body").append($temp);
}

async function appendLinkToList(text, url, postLink, status, i) {
  var archivedUrl = await getArchivedURL(url);
  if (archivedUrl !== null && archivedUrl !== undefined) {
    if(archivedUrl.length > 0) {
      //archivedUrl = "";
      nrBrokenLinks++;
      replaceLinkInBody(url, archivedUrl);
      bodies.push(body);
      saveBody(nrBrokenLinks);
      // $("#list").append("<li>" + nrBrokenLinks + "." + i + "   status=" + status + "" +
      //     "<a href='" + postLink + "'>     Stackoverflow-link       </a>" +
      //     "<iframe src='" + url + "' width='600' height='600' ></iframe>" +
      //     "<iframe src='" + archivedUrl + "' width='600' height='600' ></iframe>" +
      //     "</li><button onclick='copyBodyToClipboard(" + nrBrokenLinks + ")'>Copy Body</button>");

      $("#list").append("<li>" + nrBrokenLinks + "." + i + "   link=" + text + "" +
          "<a href='" + postLink + "'>     Stackoverflow-link       </a>" +
          "<iframe src='" + url + "' width='600' height='600' ></iframe>" +
          "<iframe src='" + archivedUrl + "' width='600' height='600' ></iframe>" +
          "</li><button onclick='copyBodyToClipboard(" + nrBrokenLinks + ")'>Copy Body</button>");
    }
  }
}


function htmlDecode(textWithHtmlEntities) {
  var tmpDoc = new DOMParser().parseFromString(textWithHtmlEntities, "text/html");
  return tmpDoc.documentElement.textContent;
}

async function searchBrokenLinks(totalPages) {
  totalPages = totalPages || Number.MAX_SAFE_INTEGER;
  for (let page = 1; ; page++) {
    try {

      if(page > maxPage){
        maxPage = page;
      }


      var jsonPost = await getPosts(page, startDate, endDate);
      //if daily limit has been exceeded then stop
      if (jsonPost.quota_remaining <= 1)
        return -1;

      var items = jsonPost.items;

      if (items.length === 0) {
        alert("done");
        break;
      }

      for (let i = 0; i < items.length; i++) {
        try {
          var postId = items[i].post_id;
          var postLink = items[i].link;
          var post = await getPostById(postId);

          //if daily limit has been exceeded then stop
          if (post.quota_remaining <= 1)
            return -1;

          body = htmlDecode(post.items[0].body_markdown);

          //find all links in the HTML body
          var htmlBody = post.items[0].body;

          //alert(htmlBody.length + ":"+postLink);
          if (htmlBody.length <= 1000) {

            var href = $('<div>').append(htmlBody).find('a');
            var tempBrokenLinks = nrBrokenLinks;

            // if(href.length <= 3) {//currently only check short and one link posts

            for (let i = 0; i < href.length; i++) {
              var url = $(href[i]).attr('href');
              //alert($(href[i]).text() + ":"+postLink);
              var text = $(href[i]).text();
              if (url.indexOf("localhost") === -1) {//omit localhost
                nrTries = 0; //reset it
                await urlExists(text, url, postLink, i);
              }
            }
            if (tempBrokenLinks !== nrBrokenLinks) //a broken link was found ==>> it was printed out ==>> print newline after it
              $("#list").append("<br>");
            // }
          }
        } catch (err) {

        }
      }
      //update progress bar - if totalPages is missing from the parameters then the result will be inaccurate
      //but returning the remaining page numbers with the api is expensive
      var amount = (100 * page) / totalPages;
      setProgressBar(amount);

      //if no more pages in result then break
      if (jsonPost.has_more == false)
        return 0;
    } catch (err) {

    }

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
  var value = await searchBrokenLinks(totPages);

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
  alert("maxpage=" + maxPage)
}

$(document).ready(function() {


  main();


});
