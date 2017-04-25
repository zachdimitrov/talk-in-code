import * as data from "data";
import * as toastr from "toastr";
import $ from "jquery";
import * as templates from "templates";

function register(context) {
    templates.get('register')
        .then(function(template) {
            context
                .$element()
                .find("#form-field")
                .html(template());

            $("#btn-back").on("click", () => $("#show-form").fadeIn());

            $('#btn-register').on('click', function() {
                var user = {
                    username: $('#tb-reg-username').val(),
                    password: $('#tb-reg-password').val(),
                    email: $('#tb-reg-email').val()
                };

                data.register(user)
                    .then(function() {
                        toastr.success('User registered!');
                        setTimeout(function() {
                            context.redirect('#/');
                            document.location.reload(true);
                        }, 1000);
                    }, function(err) {
                        if (typeof err === "object") {
                            err = err.responseText;
                        }
                        toastr.error(err);
                    });
            });
        });
}

export { register };