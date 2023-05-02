$(document).ready(function() {
    // Set the initial position of the hamburger icon
    $('.hamburger').css('left', '90px');

    // Toggle Sign In and Sign Out buttons
    $('.sign-btn').on('click', function(event) {
        event.preventDefault();
        $('.sign-btn').toggle();
    });

    // Toggle sidebar collapse
    $('.hamburger').on('click', function() {
        if ($(window).width() > 768) {
            $('.sidebar').toggleClass('sidebar-collapsed');
            $('.logo-expanded, .logo-collapsed').toggle(); // Toggle logo visibility
            if ($('.sidebar').hasClass('sidebar-collapsed')) {
             $('.hamburger').css('left', '90px'); // Position the hamburger next to the collapsed sidebar
         } else {
             $('.hamburger').css('left', '220px'); // Position the hamburger next to the expanded sidebar
         }
            $('.main-content').toggleClass('sidebar-collapsed');
        } else {
            // Toggle menu visibility for mobile view
            $('.sidebar').toggleClass('mobile-active');
            $('.sidebar a:not(.sign-btn)').toggle();
        }
    });
});

