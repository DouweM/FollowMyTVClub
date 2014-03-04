var TVClub = {
  allShowInfosUpdatedKey: "allShowInfosUpdated",
  allShowInfosKey:        "allShowInfos",

  reviewInfoKey:          function(showName, seasonNr, episodeNr) { 
    return "reviewInfo[" + showName + "][" + seasonNr + "][" + episodeNr + "]" 
  },
  reviewInfosUpdatedKey:  "reviewInfosUpdated",

  getAllShowInfos: function(callback) {
    var self = this;
    chrome.storage.local.get([self.allShowInfosUpdatedKey, self.allShowInfosKey], function(storageItems) {
      var updatedTime = storageItems[self.allShowInfosUpdatedKey]
      var showInfos   = storageItems[self.allShowInfosKey];

      if (
        updatedTime && 
        showInfos && 
        // Recalculate after one week
        ((new Date()).getTime() - updatedTime) < (7 * 24 * 60 * 60 * 1000)
      ) return callback(showInfos);

      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (this.readyState != 4) return;
        if (this.status != 200) return callback(null);

        var rawShowInfos = JSON.parse(this.responseText);

        var showInfos = _.map(rawShowInfos, function(rawShowInfo) {
          return {
            name: rawShowInfo.name,
            url:  "http://www.avclub.com" + rawShowInfo.url
          }
        });

        var storageItems = {}
        storageItems[self.allShowInfosUpdatedKey] = (new Date()).getTime();
        storageItems[self.allShowInfosKey]        = showInfos;
        chrome.storage.local.set(storageItems);

        callback(showInfos);
      }
      xhr.open("GET", "http://www.avclub.com/reviews/tvshows.json");
      xhr.send();
    });
  },

  getShowInfo: function(name, callback) {
    name = name.replace(/ \([0-9]{4}\)$/, "");
    
    this.getAllShowInfos(function(showInfos) {
      if (!showInfos) return callback(null);

      var showInfo = _.find(showInfos, function(showInfo) {
        return (showInfo.name.toLowerCase() == name.toLowerCase());
      });

      callback(showInfo);
    });
  },

  getShowSeasonDocument: function(name, seasonNr, callback) {
    this.getShowInfo(name, function(showInfo) {
      if (!showInfo) return callback(null);

      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (this.readyState != 4) return;
        if (this.status != 200) return callback(null);
 
        var showDocument = document.implementation.createHTMLDocument("");
        showDocument.body.innerHTML = this.responseText;
        callback(showDocument);
      }
      xhr.open("GET", showInfo.url + "?season=" + seasonNr);
      xhr.send();
    });
  },

  getReviewInfo: function(showName, seasonNr, episodeNr, callback, showDocument) {
    var self = this;

    var reviewInfoKey = self.reviewInfoKey(showName, seasonNr, episodeNr);
    chrome.storage.local.get([self.reviewInfosUpdatedKey, reviewInfoKey], function(storageItems) {
      var updatedTimes  = storageItems[self.reviewInfosUpdatedKey] || {};
      var reviewInfo    = storageItems[reviewInfoKey];

      if (reviewInfo) return callback(reviewInfo);

      var parseShowDocument = function(showDocument) {
        if (!showDocument) return callback(null);

        var episodeArticles = showDocument.querySelector(".article-list").querySelectorAll("article.item");
        var episodeArticle = _.find(episodeArticles, function(episodeArticle) {
          // Currently doesn't support reviews for multiple episodes :(
          var seasonEpisode = episodeArticle.querySelector(".season-episode");
          var seasNr = parseInt(seasonEpisode.querySelector(".season").innerText.match(/ ([0-9]+)$/)[1]);
          var epNr = parseInt(seasonEpisode.querySelector(".episode").innerText.match(/ ([0-9]+)$/)[1]);

          return seasNr == seasonNr && epNr == episodeNr;
        });

        if (!episodeArticle) return callback(null);

        var reviewInfo = {
          url:    "http://www.avclub.com" + episodeArticle.querySelector("h1 a").getAttribute("href"),
          grade:  episodeArticle.querySelector(".grade.letter").innerText
        }

        updatedTimes[reviewInfoKey] = (new Date()).getTime();

        var storageItems = {}
        storageItems[self.reviewInfosUpdatedKey] = updatedTimes;
        storageItems[reviewInfoKey] = reviewInfo;
        chrome.storage.local.set(storageItems);

        callback(reviewInfo);
      }

      if (showDocument) {
        if (_.isFunction(showDocument)) {
          showDocument(parseShowDocument)
        }
        else {
          parseShowDocument(showDocument);
        }
      }
      else {
        self.getShowSeasonDocument(showName, seasonNr, parseShowDocument);
      }
    });
  },

  cleanupOldReviewInfos: function() {
    var self = this;
    chrome.storage.local.get(self.reviewInfosUpdatedKey, function(storageItems) {
      var updatedTimes = storageItems[self.reviewInfosUpdatedKey];
      if (!updatedTimes) return;

      var keysToRemove = [];

      _.each(updatedTimes, function(updatedTime, reviewInfoKey) {
        // Remove after one week.
        if (((new Date()).getTime() - updatedTime) > (7 * 24 * 60 * 60 * 1000)) {
          delete updatedTimes[reviewInfoKey];
          keysToRemove.push(reviewInfoKey);
        }
      });

      if (keysToRemove.length > 0) {
        chrome.storage.local.remove(keysToRemove);

        var storageItems = {};
        storageItems[self.reviewInfosUpdatedKey] = updatedTimes;
        chrome.storage.local.set(storageItems);
      }
    });
  }
}

TVClub.cleanupOldReviewInfos();