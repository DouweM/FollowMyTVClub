var titleEl = document.querySelector("h2");
var showName = titleEl.innerText;

var infoListEl = document.querySelector("ul.info-list");

if (infoListEl) {
  TVClub.getShowInfo(showName, function(showInfo) {
    if (!showInfo) return;

    var lastListItemEl = infoListEl.querySelector("li:last-child");
    var valueEl = lastListItemEl.querySelector("span.value");

    var commaTextNode = document.createTextNode(", ");
    valueEl.replaceChild(commaTextNode, valueEl.querySelectorAll("a")[0].nextSibling);

    var andTextNode = document.createTextNode(" and ");
    valueEl.appendChild(andTextNode);

    var showLinkEl = document.createElement("a");
    showLinkEl.target     = "_blank";
    showLinkEl.href       = showInfo.url;
    showLinkEl.innerText  = "TV Club";
    valueEl.appendChild(showLinkEl);
  });
}