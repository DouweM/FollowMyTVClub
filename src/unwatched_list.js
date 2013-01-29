var updateEpisodeEls = function() {
  var wrapper = document.querySelector(".markify");
  
  var episodeEls = wrapper.querySelectorAll(".row > .row-inner:not(.empty)");
  _.each(episodeEls, function(episodeEl) {
    var reviewLinkEl = document.createElement("span");
    reviewLinkEl.className = "unwatched-count last";
    reviewLinkEl.innerText = "-";

    var unwatchedCountEl = episodeEl.querySelector(".episode-nr-wrapper .unwatched-count");
    if (unwatchedCountEl) {
      unwatchedCountEl.parentNode.replaceChild(reviewLinkEl, unwatchedCountEl);
    }
    else {
      var episodeNrWrapperEl = episodeEl.querySelector(".episode-nr-wrapper");
      var episodeNrEl = episodeNrWrapperEl.querySelector(".episode-nr");
      episodeNrWrapperEl.className += " multi";
      episodeNrEl.parentNode.appendChild(reviewLinkEl);
    }
  });

  var pastEpisodesEls = wrapper.querySelectorAll(".row > .row-inner:not(.empty):not(.future):not(.tomorrow)");
  _.each(pastEpisodesEls, function(pastEpisodeEl) {
    var showName = pastEpisodeEl.querySelector(".show-name a").innerText;
    var episodeId = pastEpisodeEl.querySelector(".episode-nr-wrapper .episode-nr").innerText;
    var episodeNrs = episodeId.split("x");

    TVClub.getReviewInfo(showName, parseInt(episodeNrs[0]), parseInt(episodeNrs[1]), function(reviewInfo) {
      var unwatchedCountEl = pastEpisodeEl.querySelector(".episode-nr-wrapper .unwatched-count");

      if (reviewInfo) {
        var reviewLinkEl = document.createElement("a");
        reviewLinkEl.className  = "unwatched-count";
        reviewLinkEl.target     = "_blank"
        reviewLinkEl.href       = reviewInfo.url;
        reviewLinkEl.innerText  = reviewInfo.grade;

        unwatchedCountEl.parentNode.replaceChild(reviewLinkEl, unwatchedCountEl);
      }
      else {
        unwatchedCountEl.innerText = "?";
      }
    });
  });
}

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.addedNodes.length > 0) {
      var wrapper = mutation.addedNodes[0];

      updateEpisodeEls();
    }
  });    
});
observer.observe(document.querySelector(".markify"), { childList: true });

updateEpisodeEls();