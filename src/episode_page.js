var titleEl = document.querySelector("h2");
var showName = titleEl.querySelector("a").innerText;
var episodeNrMatches = titleEl.querySelector("span.episode").innerText.match(/([0-9]+)x([0-9]+)/);

TVClub.getReviewInfo(showName, parseInt(episodeNrMatches[1]), parseInt(episodeNrMatches[2]), function(reviewInfo) {
  var infoListEl = document.querySelector("ul.info-list");

  var listItemEl = document.createElement("li");
  listItemEl.classNames = "clearfix";

  var keyEl = document.createElement("span");
  keyEl.className = "key";
  keyEl.innerText = "TV Club grade";
  listItemEl.appendChild(keyEl);

  var valueEl = document.createElement("span");
  valueEl.className = "value";
  listItemEl.appendChild(valueEl);

  if (reviewInfo) {
    var reviewLinkEl = document.createElement("a");
    reviewLinkEl.target     = "_blank"
    reviewLinkEl.href       = reviewInfo.url;
    reviewLinkEl.innerText  = reviewInfo.grade;
    valueEl.appendChild(reviewLinkEl);
  }
  else {
    valueEl.innerText = "Unknown";
  }

  infoListEl.insertBefore(listItemEl, infoListEl.querySelector("li:last-child"));
});