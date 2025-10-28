$(function () {
    "use strict";
    
    // Initialize EmailJS
    emailjs.init("eVdll3huwnqusvwy0");
    
    // Test EmailJS connection
    console.log('EmailJS initialized with public key: eVdll3huwnqusvwy0');
    
    // Initialize form validation
    $('#contact-form').validator({
        focus: false
    });
    
    // Handle form submission
    $('#contact-form').on('submit', function (e) {
        console.log('Form submit event triggered');
        e.preventDefault(); // Prevent default form submission
        
        // Store current scroll position to prevent auto-scroll
        var currentScrollTop = $(window).scrollTop();
        
        // Prevent any focus changes that might cause scrolling
        $('input, textarea, button').blur();
        
        // Prevent scrolling by temporarily disabling scroll
        $('html, body').css('overflow', 'hidden');
        
        // Process the form
        // Get form data
        var formData = {
            name: $('#name').val().trim(),
            email: $('#email').val().trim(),
            phone: $('#phone').val().trim(),
            message: $('#message').val().trim(),
            recaptchaResponse: grecaptcha.getResponse()
        };
        
        // Validate all fields individually first
        var allFieldsValid = true;
        $('#name, #email, #phone, #message').each(function() {
            validateField($(this));
            if ($(this).hasClass('is-invalid')) {
                allFieldsValid = false;
            }
        });
        
        // Validate reCAPTCHA
        var recaptchaValid = formData.recaptchaResponse && formData.recaptchaResponse.length > 0;
        if (!recaptchaValid) {
            $('#recaptcha-error').text('Please verify that you are not a robot by completing the reCAPTCHA.');
            allFieldsValid = false;
        } else {
            $('#recaptcha-error').text('');
        }
        
        if (!allFieldsValid) {
            // Restore scroll position and overflow
            setTimeout(function() {
                $(window).scrollTop(currentScrollTop);
                $('html, body').css('overflow', 'auto');
            }, 100);
            return false;
        }
        
        // Show loading state
        setSubmitButtonLoading(true);
        
        // Restore overflow for successful submission
        $('html, body').css('overflow', 'auto');
        
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
        } else if (data.name.length < 2) {
            errorMessage += 'Name must be at least 2 characters.<br>';
            isValid = false;
        }
        
        // Validate email
        if (!data.email) {
            errorMessage += 'Valid email is required.<br>';
            isValid = false;
        } else if (!isValidEmail(data.email)) {
            errorMessage += 'Please enter a valid email address.<br>';
            isValid = false;
        }
        
        // Validate phone
        if (!data.phone) {
            errorMessage += 'Phone number is required.<br>';
            isValid = false;
        } else if (!isValidPhone(data.phone)) {
            errorMessage += 'Phone number should contain only numbers.<br>';
            isValid = false;
        }
        
        // Validate message
        if (!data.message) {
            errorMessage += 'Message is required.<br>';
            isValid = false;
        }
        
        // Validate reCAPTCHA
        if (!data.recaptchaResponse) {
            errorMessage += 'Please verify that you are not a robot by completing the reCAPTCHA.<br>';
            $('#recaptcha-error').text('Please verify that you are not a robot by completing the reCAPTCHA.');
            isValid = false;
        } else {
            $('#recaptcha-error').text('');
        }
        
        if (!isValid) {
            // Don't show consolidated error message - individual field errors are already shown
            // showMessage('danger', errorMessage);
        }
        
        return isValid;
    }
    
    // Email validation function
    function isValidEmail(email) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Phone validation function
    function isValidPhone(phone) {
        var phoneRegex = /^[0-9]+$/;
        return phoneRegex.test(phone);
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
    
    // Prevent non-numeric input in phone field
    $('#phone').on('input', function() {
        var value = $(this).val();
        // Remove any non-numeric characters
        var numericValue = value.replace(/[^0-9]/g, '');
        if (value !== numericValue) {
            $(this).val(numericValue);
        }
    });
    
    // Real-time validation feedback
    $('#name, #email, #phone, #message').on('blur', function() {
        validateField($(this));
    });
    
    // Also validate on input for immediate feedback
    $('#name, #email, #phone, #message').on('input', function() {
        var field = $(this);
        var value = field.val().trim();
        
        // Only show validation if user has started typing
        if (value.length > 0) {
            validateField(field);
        } else {
            // Clear validation when field is empty
            field.removeClass('is-invalid is-valid');
            field.siblings('.help-block.with-errors').text('');
        }
    });
    
    // Field validation function
    function validateField(field) {
        var value = field.val().trim();
        var fieldName = field.attr('name');
        
        // Clear previous validation
        field.removeClass('is-invalid is-valid');
        field.siblings('.help-block.with-errors').text('');
        
        // Validate based on field type
        if (fieldName === 'name') {
            if (!value) {
                showFieldError(field, 'Name is required.');
            } else if (value.length < 2) {
                showFieldError(field, 'Name must be at least 2 characters.');
            } else {
                showFieldSuccess(field);
            }
        } else if (fieldName === 'email') {
            if (!value) {
                showFieldError(field, 'Valid email is required.');
            } else if (!isValidEmail(value)) {
                showFieldError(field, 'Please enter a valid email address.');
            } else {
                showFieldSuccess(field);
            }
        } else if (fieldName === 'phone') {
            if (!value) {
                showFieldError(field, 'Phone number is required.');
            } else if (!isValidPhone(value)) {
                showFieldError(field, 'Phone number should contain only numbers.');
            } else {
                showFieldSuccess(field);
            }
        } else if (fieldName === 'message') {
            if (!value) {
                showFieldError(field, 'Message is required.');
            } else {
                showFieldSuccess(field);
            }
        }
    }
    
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
        // Clear any reCAPTCHA error messages
        $('#recaptcha-error').text('');
    };
    
    window.onRecaptchaExpired = function() {
        console.log('reCAPTCHA expired');
        $('#recaptcha-error').text('reCAPTCHA has expired. Please complete it again.');
    };
    
    window.onRecaptchaError = function() {
        console.log('reCAPTCHA error');
        $('#recaptcha-error').text('reCAPTCHA error occurred. Please try again.');
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
                
                // Show error message in a more user-friendly way
                alert('Sorry, there was an error sending your message. Please try again or contact us directly at info@jadeadv.com');
                
                // Restore scroll position and overflow
                setTimeout(function() {
                    $(window).scrollTop(currentScrollTop);
                    $('html, body').css('overflow', 'auto');
                }, 100);
                
                // Re-enable submit button
                setSubmitButtonLoading(false);
            });
    }
});
