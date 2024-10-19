const togglePassword = document.getElementById('toggle-password');
const passwordField = document.getElementById('account_password');

  togglePassword.addEventListener('click', function() {
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    togglePassword.textContent = type === 'password' ? 'Show Password' : 'Hide Password';
  });

  document.getElementById('add-classification-form').addEventListener('submit', function (e) {
    const classificationName = document.getElementById('classification_name').value;
    const regex = /^[a-zA-Z0-9]+$/;

    if (!regex.test(classificationName)) {
      alert("Classification name cannot contain spaces or special characters.");
      e.preventDefault();
    }
  });

  document.getElementById('add-inventory-form').addEventListener('submit', function(e) {
    const year = document.getElementById('inv_year').value;
    if (!/^\d{4}$/.test(year)) {
      alert('Please enter a valid 4-digit year.');
      e.preventDefault();
    }
  });