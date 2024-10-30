'use strict';

document.addEventListener('DOMContentLoaded', function() {
    const infoUpdateLink = document.getElementById('info-update');

    if (infoUpdateLink) {
        infoUpdateLink.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default link behavior

            // Get the account_id from the data attribute
            const accountId = infoUpdateLink.getAttribute('data-account-id');
            let updateURL = `/account/update/${accountId}`; // Construct the URL with account_id

            fetch(updateURL) // Fetch account details using the constructed URL
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not OK");
                    }
                    return response.json();
                })
                .then(data => {
                    // Handle the data returned from the server (populate your form here)
                    console.log(data); // Log the data to see the structure
                    populateAccountForm(data); // Call a function to populate the form
                })
                .catch(error => {
                    console.error('There was a problem:', error.message);
                });
        });
    }

    function populateAccountForm(data) {
        // Assuming you have a form with specific input fields to populate
        document.getElementById('firstname').value = data.firstname;
        document.getElementById('lastname').value = data.lastname;
        document.getElementById('email').value = data.email;
        // Add more fields as needed
        // Optionally, you can redirect to the form page or display the form as a modal
    }
});
