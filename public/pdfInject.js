'use strict';




async function initPdf() {
  checkCurrentUrlIsLocalFileUrl();
  await sleepUntilPdfTextLoad();
  changeUrlParam();
  addSpaceBetweenPdfText();
}
initPdf();

//if current url is local file and no file permission
//alert user need permmsion
function checkCurrentUrlIsLocalFileUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const url = urlParams.get("file");

  if (/^file:\/\//.test(url)) {
    //check current url is file url
    chrome.extension.isAllowedFileSchemeAccess((isAllowedAccess) => {
      //check file url permmision
      if (isAllowedAccess == false) {
        alert(`
    ------------------------------------------------------------------
    Mouse tooltip translator require permission for local pdf file.
    User need to turn on 'Allow access to file URLs' from setting.
    This page will be redirected to setting page after confirm.
    -------------------------------------------------------------------`);
        openSettingPage(window.location.host);
      }
    });
  }
}

function openSettingPage(id) {
  chrome.tabs.create({
    url: "chrome://extensions/?id=" + id,
  });
}

function changeUrlParam() {
  var fileParam = getUrlParam("file");
  
  if (fileParam) {
    history.replaceState("", "", '/?file='+fileParam);
  }
}

function getUrlParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}


function sleepUntilPdfTextLoad() {
  return new Promise(resolve => {
      document.addEventListener("webviewerloaded", function() {
        PDFViewerApplication.initializedPromise.then(function() {
          PDFViewerApplication.eventBus.on("documentloaded", function(event) { //when pdf loaded
            window.PDFViewerApplication.eventBus.on('textlayerrendered', function pagechange(evt) { //when textlayerloaded
              resolve();   
            })
          });
        });
      }); 
  });
}


//pdf.js does not support new line, we need to add line break to show tooltip correctly
function addSpaceBetweenPdfText(){
  var lastY;
  var lastItem;
  document.querySelectorAll('.page span').forEach(function(item, index) {
    var currentY = parseFloat(item.style.top);

    if (index === 0) { //skip first index

    } else {
      var currentFontSize = parseFloat(item.style.fontSize);

      if (lastY < currentY - currentFontSize * 2 || currentY + currentFontSize * 2 < lastY) { //if y diff double, give end line
        if (!(/\n $/.test(lastItem.textContent))) { //if no end line, give end line
          lastItem.textContent = lastItem.textContent + "\n ";
        }
      } else if (lastY < currentY - currentFontSize || currentY + currentFontSize < lastY) { // if y diff, give end space
        if (!(/ $/.test(lastItem.textContent))) { //if no end space, give end space
          lastItem.textContent = lastItem.textContent + " ";
        }
      }
    }
    lastY = currentY
    lastItem = item;
  })
}