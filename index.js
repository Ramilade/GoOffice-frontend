import "./navigo_EditedByLars.js"  //Will create the global Navigo, with a few changes, object used below

import {
  setActiveLink, adjustForMissingHash, renderTemplate, loadHtml
} from "./utils.js"

import { initSchedule } from "./pages/schedule/schedule.js"
import {initLogin, checkAuthenticationStatus } from "./pages/security/login.js"

window.addEventListener("load", async () => {

  const templateSchedule = await loadHtml("./pages/schedule/schedule.html")
  const templateNotFound = await loadHtml("./pages/notFound/notFound.html")
  const templateLogin = await loadHtml("./pages/security/login.html")

  adjustForMissingHash()

  const router = new Navigo("/", { hash: true });

  window.router = router

  router
    .hooks({
      before: async (done, match) => {
        await checkAuthenticationStatus();
        setActiveLink("menu", match.url)
        done()
      }
    })
    .on({
      "/": async () => {
        if (await checkAuthenticationStatus() === false) {
          window.router.navigate("/login");
          return;
        }
      },
      "/schedule": () => {
        renderTemplate(templateSchedule, "content")
        initSchedule()
      },
      "/login": async () => {
        renderTemplate(templateLogin, "content")
        initLogin()
        await checkAuthenticationStatus();
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



