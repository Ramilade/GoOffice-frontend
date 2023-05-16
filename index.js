import "./navigo_EditedByLars.js"; //Will create the global Navigo, with a few changes, object used below
import { API_URL } from "settings.js";
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
  //const templateNotFound = await loadHtml("./pages/notFound/notFound.html");
  const templateLogin = await loadHtml("./pages/security/login.html");
  const templateVacation = await loadHtml("./pages/vacation/vacation.html");

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
      "/schedule": async () => {
        const isAuthenticated = await checkAuthenticationStatus();
        if (!isAuthenticated) {
          window.router.navigate("/login");
          updateUserInfo(null);
          return;
        }
        renderTemplate(templateSchedule, "content");
        initSchedule();
        
      },
      "/vacation": async () => {
        const isAuthenticated = await checkAuthenticationStatus();
        if (!isAuthenticated) {
          window.router.navigate("/login");
          updateUserInfo(null);
          return;
        }
        renderTemplate(templateVacation, "content");
      },
      "/login": async () => {
        renderTemplate(templateLogin, "content");
        initLogin();
        await checkAuthenticationStatus();
      },
    })
    .notFound(() => {
      window.location.href = "/notFound.html";
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
  try {
    const response = await fetch(`${API_URL}/user-info`, { credentials: "include" });
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