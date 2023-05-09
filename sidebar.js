const backendUrl = "http://localhost:8080";
import { checkAuthenticationStatus } from "./pages/security/login.js";
import { logout } from "./pages/security/login.js";


$(document).ready(function () {
    // Set the initial position of the hamburger icon
    $(".hamburger").css("left", "90px");
  
    // Login button click event
    $('a[href="/login"]').on("click", function (event) {
      event.preventDefault();
      window.router.navigate("/login");
    });
  
    // Logout button click event
    $('a[href="#sign-out"]').on("click", async function (event) {
        event.preventDefault();
        await logout();
      });
  
    // Toggle sidebar collapse
    $(".hamburger").on("click", function () {
      // ... existing code ...
    });
  });