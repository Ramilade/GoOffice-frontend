const backendUrl = "https://go-office.azurewebsites.net";
//const backendUrl = "http://localhost:8080";


export function initLogin() {
  document.getElementById("google").addEventListener("click", function () {
    openLoginPopup("google");
  });

document.getElementById("logout").addEventListener("click", logout);

}

export async function logout() {
  try {
    const response = await fetch(`${backendUrl}/logout`, {
      method: "POST",
      credentials: "include",
    });
    console.log("Logout response:", response); // Log the response
    if (response.status === 200 || response.status === 204) {
      checkAuthenticationStatus();
    }
  } catch (error) {
    console.error("Error during logout:", error);
  }
}


export async function checkAuthenticationStatus() {
  const loginButton = document.getElementById("google");
  const logoutButton = document.getElementById("logout");
  try {
    const response = await fetch(`${backendUrl}/auth-status`, {
      credentials: "include",
    });

    if (response.status === 200) {
      const jsonResponse = await response.json(); // Parse the JSON response
      console.log("Authentication status response JSON:", jsonResponse); // Log the JSON response

      if (jsonResponse.isAuthenticated) {
        if (popup) {
          popup.close(); // Close the popup window if it exists
          //@ts-ignore
          window.router.navigate("/");
          window.location.reload();
        }
        if (loginButton) loginButton.style.display = "none";
        if (logoutButton) logoutButton.style.display = "block";
        return true;
      } else {
        if (loginButton) loginButton.style.display = "block";
        if (logoutButton) logoutButton.style.display = "none";
        return false;
      }
    } else {
        response.json().then((json) => console.log(json))
      return false;
    }
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return false;
  }
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
let popup;

function openLoginPopup(provider) {
  if (isMobileDevice()) {
    // Redirect to the login page on mobile devices
    window.location.href = `${backendUrl}/oauth2/authorization/${provider}`;
  } else {
    const width = 600;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2 + window.screenX;
    const top = window.innerHeight / 2 - height / 2 + window.screenY;

    popup = window.open(
      `${backendUrl}/oauth2/authorization/${provider}`,
      "Login",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const timer = setInterval(async () => {
      if (await checkAuthenticationStatus()) {
        clearInterval(timer);
        popup.close(); // Close the popup window if it exists
        //@ts-ignore
        window.router.navigate("/"); // Navigate to the desired page after login
      }
    }, 1000);
  }
}
