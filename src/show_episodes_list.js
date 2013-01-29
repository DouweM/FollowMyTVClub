var titleEl = document.querySelector("h2");
var showName = titleEl.innerText.match(/^(.+) Season [0-9]+$/)[1];

var showDocumentLoadCallbacks = [];
var loadingShowDocument = false;
var loadedShowDocument;

var episodesEls = document.querySelectorAll(".split-content .item-teaser");
_.each(episodesEls, function(episodeEl) {
  var episodeId = episodeEl.querySelector(".info .epinr").innerText;
  var episodeNrs = episodeId.split("x");

  TVClub.getReviewInfo(showName, parseInt(episodeNrs[0]), parseInt(episodeNrs[1]), function(reviewInfo) {
    var origRatingEl = episodeEl.querySelector(".rating-wrap");

    var ratingEl = document.createElement("div");
    ratingEl.className = "rating-wrap";

    var ratingElInner = document.createElement("div");
    ratingElInner.className = "rating-wrap-inner";
    ratingEl.appendChild(ratingElInner);

    var ratingDiv = document.createElement("div");
    ratingDiv.className = "rating";
    ratingElInner.appendChild(ratingDiv);

    if (reviewInfo) {
      var reviewLinkEl = document.createElement("a");
      reviewLinkEl.target     = "_blank"
      reviewLinkEl.href       = reviewInfo.url;
      reviewLinkEl.innerText  = reviewInfo.grade;

      ratingDiv.appendChild(reviewLinkEl);
    }
    else {
      ratingDiv.innerText = "?";
    }

    origRatingEl.parentNode.insertBefore(ratingEl, origRatingEl.nextSibling);
  }, function(callback) {
    if (loadedShowDocument) {
      callback(loadedShowDocument);
    }
    else {
      showDocumentLoadCallbacks.push(callback);

      if (!loadingShowDocument) {
        loadingShowDocument = true;
        TVClub.getShowDocument(showName, function(showDocument) {
          loadedShowDocument = showDocument;
          loadingShowDocument = false;

          _.each(showDocumentLoadCallbacks, function(callback) {
            callback(loadedShowDocument);
          })
          showDocumentLoadCallbacks = [];
        });
      }
    }
  });
});