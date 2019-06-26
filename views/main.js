console.log("Working");
// SLIDER CODE
const container = document.getElementById("container");
const fpButtons = document.querySelectorAll(".fp");
const sliderButtons = document.querySelectorAll(".slider");
fpButtons.forEach(button =>
  button.addEventListener("click", () =>
    container.classList.toggle("forgot-p-active")
  )
);
sliderButtons.forEach(button =>
  button.addEventListener("click", () =>
    container.classList.toggle("right-panel-active")
  )
);

// FORM ACTION
const signinForm = document.querySelector("#signin-form");
const signupForm = document.querySelector("#signup-form");

// Sign-in form
signinForm.addEventListener("submit", function(e) {
  e.preventDefault();
  $.ajax({
    url: "http://localhost:3000/auth/student/login",
    method: "POST",
    data: $(this).serialize(),
    success: (data, status, jqXHR) => {
      // Save token cookie and redirect to dash
      Cookies.set("auth_token", jqXHR.getResponseHeader("x-auth-token"));
      document.location.replace("http://localhost:3000/home");
    },
    error: jqXHR => alert(jqXHR.responseText)
  });
});

signupForm.addEventListener("submit", function(e) {
  e.preventDefault();
  $.ajax({
    url: "http://localhost:3000/auth/student/register",
    method: "POST",
    data: $(this).serialize(),
    success: (data, status, jqXHR) => {
      // Inform about verification mail sent
      alert("Verification mail has been sent. Please check your mail.");
    },
    error: jqXHR => alert(jqXHR.responseText)
  });
});
