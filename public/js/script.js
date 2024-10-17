const togglePassword = document.getElementById('toggle-password');
const passwordField = document.getElementById('account_password');

  togglePassword.addEventListener('click', function() {
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    togglePassword.textContent = type === 'password' ? 'Show Password' : 'Hide Password';
  });