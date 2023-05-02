import "./navigo_EditedByLars.js"  //Will create the global Navigo, with a few changes, object used below

import {
  setActiveLink, adjustForMissingHash, renderTemplate, loadHtml
} from "./utils.js"

import { initSchedule } from "./pages/schedule/schedule.js"


window.addEventListener("load", async () => {

  const templateSchedule = await loadHtml("./pages/schedule/schedule.html")
  const templateNotFound = await loadHtml("./pages/notFound/notFound.html")


  adjustForMissingHash()

  const router = new Navigo("/", { hash: true });

  window.router = router

  router
    .hooks({
      before(done, match) {
        setActiveLink("menu", match.url)
        done()
      }
    })
    .on({
      "/schedule": () => {
        renderTemplate(templateSchedule, "content")
        initSchedule()
      },
    })
    .notFound(() => {
      renderTemplate(templateNotFound, "content")
    })
    .resolve()
});


window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
    + ' Column: ' + column + ' StackTrace: ' + errorObj);
}



