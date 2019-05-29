const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

const signUpButtonMobile = document.getElementById('signUpMobile');
const signInButtonMobile = document.getElementById('signInMobile');



signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});
signUpButtonMobile.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButtonMobile.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});