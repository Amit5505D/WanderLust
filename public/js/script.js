
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

 
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })

  // Handle alert dismissal manually if Bootstrap doesn't work
  const alertCloseButtons = document.querySelectorAll('.btn-close');
  alertCloseButtons.forEach(button => {
    button.addEventListener('click', function() {
      const alert = this.closest('.alert');
      if (alert) {
        // Add fade-out animation class
        alert.classList.add('fade-out');
        // Remove the element after animation completes
        setTimeout(() => {
          if (alert && alert.parentNode) {
            alert.remove();
          }
        }, 300);
      }
    });
  });

  // Auto-dismiss alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(alert => {
    setTimeout(() => {
      if (alert && alert.parentNode) {
        alert.remove();
      }
    }, 5000);
  });
})()