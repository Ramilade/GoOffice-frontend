const backendUrl = "http://localhost:8080";

export function initLogin(){

    document.getElementById("google").addEventListener("click", function () {
        openLoginPopup("google");
    });

    document.getElementById("logout").addEventListener("click", async function () {
        try {
            const response = await fetch(`${backendUrl}/logout`, { method: 'POST', credentials: 'include' });
             console.log('Logout response:', response); // Log the response
            if (response.status === 200 || response.status === 204) {
                checkAuthenticationStatus();
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    });
    

}

export async function checkAuthenticationStatus() {
    try {
      const response = await fetch(`${backendUrl}/auth-status`, { credentials: 'include' });
  
      if (response.status === 200) {
        const jsonResponse = await response.json(); // Parse the JSON response
        console.log('Authentication status response JSON:', jsonResponse); // Log the JSON response
  
        if (jsonResponse.isAuthenticated) {
          return true;
        } else {
          return false;
        }
      } else {
        console.error('Error checking authentication status. Unexpected response status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }
  
// Call the checkAuthenticationStatus function when the page loads


// Add this event listener to the end of your script.js file


function openLoginPopup(provider) {
    const popup = window.open(
        `${backendUrl}/oauth2/authorization/${provider}`,
        "Login",
        "width=600,height=600"
    );

    const timer = setInterval(() => {
        if (popup.closed) {
            clearInterval(timer);
            checkAuthenticationStatus();
        }
    }, 1000);
}


