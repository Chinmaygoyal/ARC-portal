// SLIDER CODE
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

const fpButtons = document.querySelectorAll('.fp');
fpButtons.forEach(button => button.addEventListener('click', () => container.classList.toggle('forgot-p-active')));

const signUpButtonMobile = document.getElementById('signUpMobile');
const signInButtonMobile = document.getElementById('signInMobile');

signUpButton.addEventListener('click', () => container.classList.add("right-panel-active"));
signInButton.addEventListener('click', () => container.classList.remove("right-panel-active"));
signUpButtonMobile.addEventListener('click', () => container.classList.add("right-panel-active"));
signInButtonMobile.addEventListener('click', () => container.classList.remove("right-panel-active"));

// FORM ACTION
const signinForm = document.querySelector('#signin-form');
const signupForm = document.querySelector('#signup-form');

signinForm.addEventListener('submit', function (e) {
	e.preventDefault();
	$.ajax({
		url: 'http://localhost:3000/auth/student/login',
		method: 'POST',
		data: $(this).serialize(),
		success: (data, status, jqXHR) => {
			Cookies.set('auth_token', jqXHR.getResponseHeader('x-auth-token'));
			document.location.replace('http://localhost:3000/dash.html');
		},
		error: jqXHR => alert(jqXHR.responseText)
	});
});

signupForm.addEventListener('submit', function (e) {
	e.preventDefault();
	$.ajax({
		url: 'http://localhost:3000/auth/student/register',
		method: 'POST',
		data: $(this).serialize(),
		success: (data, status, jqXHR) => {
			// TODO: Inform about mail, and maybe show the resend button 
		},
		error: jqXHR => alert(jqXHR.responseText)
	})
})