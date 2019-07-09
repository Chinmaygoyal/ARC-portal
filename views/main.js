// SLIDER CODE
const container = document.getElementById('container');
const fpButtons = document.querySelectorAll('.fp');
const sliderButtons = document.querySelectorAll('.slider');
fpButtons.forEach(button =>
  button.addEventListener('click', () =>
    container.classList.toggle('forgot-p-active')
  )
);
sliderButtons.forEach(button =>
  button.addEventListener('click', () =>
    container.classList.toggle('right-panel-active')
  )
);

// FORM ACTION
const signinForm = document.querySelector('#signin-form');
const signupForm = document.querySelector('#signup-form');

// Sign-in form
signinForm.addEventListener('submit', function(e) {
  e.preventDefault();
  $.ajax({
    url: '/auth/student/login',
    method: 'POST',
    data: $(this).serialize(),
    success: (data, status, jqXHR) => {
      // Save token cookie and redirect to dash
      Cookies.set('x-auth-token', jqXHR.getResponseHeader('x-auth-token'), {
        expires: 1 / 48 // expires in 30 minutes
      });
      document.location.replace('/home');
    },
    error: jqXHR => alert(jqXHR.responseText)
  });
});

signupForm.addEventListener('submit', function(e) {
  e.preventDefault();
  $.ajax({
    url: '/auth/student/register',
    method: 'POST',
    data: $(this).serialize(),
    success: (data, status, jqXHR) => {
      // Inform about verification mail sent
      alert('Verification mail has been sent. Please check your mail.');
    },
    error: jqXHR => alert(jqXHR.responseText)
  });
});

const wrapper = document.querySelector('.content');
$('#setpwd').on('submit', e => {
  e.preventDefault();
  // Get the elements
  const email = $('#email').val();
  const label = $('#message');
  // Password length and match check
  // Retrieve token
  const token = new URL(document.location).searchParams.get('token');
  label.val('Sending...');
  // Send request
  $.ajax({
    url: '/auth/student/forgot',
    method: 'POST',
    data: { email: email },
    headers: { 'x-auth-token': token },
    success: () => {
      alert('Verfication Mail has been sent');
      window.location.href = '/';
    },
    error: xhr => {
      addAlert(wrapper, 'error', xhr.responseText);
    }
  });
  label.html('');
});
