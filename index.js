import "./navigo_EditedByLars.js"; //Will create the global Navigo, with a few changes, object used below

import {
  setActiveLink,
  adjustForMissingHash,
  renderTemplate,
  loadHtml,
} from "./utils.js";

import { initSchedule } from "./pages/schedule/schedule.js";
import {
  initLogin,
  checkAuthenticationStatus,
} from "./pages/security/login.js";

window.addEventListener("load", async () => {
  const templateSchedule = await loadHtml("./pages/schedule/schedule.html");
  const templateNotFound = await loadHtml("./pages/notFound/notFound.html");
  const templateLogin = await loadHtml("./pages/security/login.html");

  adjustForMissingHash();

  const router = new Navigo("/", { hash: true });

  window.router = router;

  router
    .hooks({
      before: (done, match) => {
        setActiveLink("menu", match.url);
        done();
      },
    })
    .on({
      "/": async () => {
        const isAuthenticated = await checkAuthenticationStatus();
        if (!isAuthenticated) {
          window.router.navigate("/login");
          updateUserInfo(null);
          return;
        }
        await fetchUserInfo(); // Fetch user information and update the UI
      },
      "/schedule": () => {
        renderTemplate(templateSchedule, "content");
        initSchedule();
      },
      "/login": async () => {
        renderTemplate(templateLogin, "content");
        initLogin();
        await checkAuthenticationStatus();
      },
    })
    .notFound(() => {
      renderTemplate(templateNotFound, "content");
    })
    .resolve();
});

window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  alert(
    "Error: " +
      errorMsg +
      " Script: " +
      url +
      " Line: " +
      lineNumber +
      " Column: " +
      column +
      " StackTrace: " +
      errorObj
  );
};

function updateUserInfo(userInfo) {
  const userInfoContainer = document.getElementById("user-info");
  const userName = document.getElementById("user-name");
  const userEmail = document.getElementById("user-email");
  const userProfilePic = document.getElementById("user-profile-pic");

  if (userInfoContainer && userName && userEmail && userProfilePic) {
    if (userInfo) {
      userName.textContent = userInfo.name;
      userEmail.textContent = userInfo.email;
      userProfilePic.src = userInfo.profilePic;
      userInfoContainer.style.display = "block";
    } else {
      userInfoContainer.style.display = "none";
    }
  }
}

async function fetchUserInfo() {
  const backendUrl = "http://localhost:8080";
  try {
    const response = await fetch(`${backendUrl}/user-info`, { credentials: "include" });
    if (response.status === 200) {
      const userInfo = await response.json();
      localStorage.setItem("user", JSON.stringify(userInfo));
      updateUserInfo(userInfo);
    } else {
      localStorage.removeItem("user");
      updateUserInfo(null);
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
  }
}