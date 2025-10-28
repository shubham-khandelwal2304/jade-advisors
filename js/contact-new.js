$(function () {
    "use strict";
    
    // Initialize EmailJS
    emailjs.init("eVdll3huwnqusvwy0");
    
    // Test EmailJS connection
    console.log('EmailJS initialized with public key: eVdll3huwnqusvwy0');
    
    // Initialize form validation
    $('#contact-form').validator();
    
    // Handle form submission
    $('#contact-form').on('submit', function (e) {
        console.log('Form submit event triggered');
        e.preventDefault(); // Prevent default form submission
        
        // Process the form
        // Get form data
        var formData = {
            name: $('#name').val().trim(),
            email: $('#email').val().trim(),
            phone: $('#phone').val().trim(),
            message: $('#message').val().trim(),
            recaptchaResponse: grecaptcha.getResponse()
        };
        
        // Validate required fields
        if (!validateForm(formData)) {
            return false;
        }
        
        // Show loading state
        showMessage('info', 'Sending your message...', true);
        setSubmitButtonLoading(true);
        
        // Send email using EmailJS
        sendEmail(formData);
        
        return false;
    });
    
    // Form validation function
    function validateForm(data) {
        var isValid = true;
        var errorMessage = '';
        
        // Validate name
        if (!data.name) {
            errorMessage += 'Name is required.<br>';
            isValid = false;
        }
        
        // Validate email
        if (!data.email) {
            errorMessage += 'Email address is required.<br>';
            isValid = false;
        } else if (!isValidEmail(data.email)) {
            errorMessage += 'Please enter a valid email address.<br>';
            isValid = false;
        }
        
        // Validate phone
        if (!data.phone) {
            errorMessage += 'Phone number is required.<br>';
            isValid = false;
        }
        
        // Validate reCAPTCHA
        if (!data.recaptchaResponse) {
            errorMessage += 'Please verify that you are not a robot by completing the reCAPTCHA.<br>';
            isValid = false;
        }
        
        if (!isValid) {
            showMessage('danger', errorMessage);
        }
        
        return isValid;
    }
    
    // Email validation function
    function isValidEmail(email) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Show message function
    function showMessage(type, message, isLoading) {
        var messageAlert = 'alert-' + type;
        var alertBox = '<div class="alert ' + messageAlert + ' alert-dismissable">';
        
        if (!isLoading) {
            alertBox += '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
        }
        
        alertBox += message + '</div>';
        
        $('#contact-form').find('.messages').html(alertBox);
        
        // Auto-dismiss success messages after 10 seconds
        if (type === 'success') {
            setTimeout(function() {
                $('.alert').fadeOut();
            }, 10000);
        }
    }
    
    // Reset form function
    function resetForm() {
        $('#contact-form')[0].reset();
        
        // Reset reCAPTCHA
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
        }
        
        // Clear any validation errors
        $('.help-block.with-errors').text('');
        $('.form-control').removeClass('is-invalid');
    }
    
    // Real-time validation feedback
    $('#name, #email, #phone').on('blur', function() {
        var field = $(this);
        var value = field.val().trim();
        var fieldName = field.attr('name');
        
        // Clear previous validation
        field.removeClass('is-invalid is-valid');
        field.siblings('.help-block.with-errors').text('');
        
        // Validate based on field type
        if (fieldName === 'name' && !value) {
            showFieldError(field, 'Name is required.');
        } else if (fieldName === 'email') {
            if (!value) {
                showFieldError(field, 'Email address is required.');
            } else if (!isValidEmail(value)) {
                showFieldError(field, 'Please enter a valid email address.');
            } else {
                showFieldSuccess(field);
            }
        } else if (fieldName === 'phone' && !value) {
            showFieldError(field, 'Phone number is required.');
        } else if (value) {
            showFieldSuccess(field);
        }
    });
    
    // Show field error
    function showFieldError(field, message) {
        field.addClass('is-invalid');
        field.siblings('.help-block.with-errors').text(message);
    }
    
    // Show field success
    function showFieldSuccess(field) {
        field.addClass('is-valid');
        field.siblings('.help-block.with-errors').text('');
    }
    
    // Handle reCAPTCHA callback
    window.onRecaptchaCallback = function() {
        console.log('reCAPTCHA loaded successfully');
    };
    
    window.onRecaptchaExpired = function() {
        console.log('reCAPTCHA expired');
    };
    
    window.onRecaptchaError = function() {
        console.log('reCAPTCHA error');
    };
    
    // Set submit button loading state
    function setSubmitButtonLoading(isLoading) {
        var submitBtn = $('#Submit');
        if (isLoading) {
            submitBtn.addClass('btn-loading').prop('disabled', true);
        } else {
            submitBtn.removeClass('btn-loading').prop('disabled', false);
        }
    }
    
    // Send email using EmailJS
    function sendEmail(formData) {
        // Template parameters - try both formats to ensure compatibility
        var templateParams = {
            // Standard format
            from_name: formData.name,
            from_email: formData.email,
            phone: formData.phone,
            message: formData.message,
            // Additional format for your template
            name: formData.name,
            title: 'Contact Form',
            email: formData.email,
            time: new Date().toLocaleString()
        };
        
        console.log('Sending email with params:', templateParams);
        console.log('Service ID: service_kh0cqya');
        console.log('Template ID: template_sbu6zoa');
        
        // Send email using EmailJS
        emailjs.send("service_kh0cqya", "template_sbu6zoa", templateParams)
            .then(function(response) {
                console.log('Email sent successfully!', response.status, response.text);
                
                // Redirect to thank you page after successful submission
                window.location.href = 'thankyou.html';
                
            }, function(error) {
                console.error('Failed to send email:', error);
                console.error('Error details:', JSON.stringify(error));
                
                // Show error message
                showMessage('danger', 'Sorry, there was an error sending your message. Please try again or contact us directly at info@jadeadv.com');
                
                // Re-enable submit button
                setSubmitButtonLoading(false);
            });
    }
});
