import * as templates from "templates";
import $ from "jquery";
import * as data from "data";
import * as toastr from "toastr";
import "jquery-ui";

function all(context) {
    templates.get("login")
        .then(template => {
            context
                .$element()
                .find("#form-field")
                .html(template());
        })
        .then(() => {
            $("#show-form").on("click", () => $("#login-panel").slideDown(400, () => {
                $("#show-form").fadeOut();
            }));
            $("#hide-form").on("click", () => $("#login-panel").slideUp(400, () => {
                $("#show-form").fadeIn();
            }));

            if (data.hasUser()) {
                $('#container-sign-in').hide();
            } else {
                $('#container-sign-out').hide();
            }

            $('#btn-sign-out').on('click', function() {
                data.signOut()
                    .then(function() {
                        toastr.success('User signed out!');
                        //document.location = '#/register';
                        context.redirect('#/home');
                        setTimeout(function() {
                            $('#container-sign-out').fadeOut(100, function() {
                                $('#container-sign-in').fadeIn(500);
                                $("#show-form").html(`<span class="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span> login`);
                            });
                        }, 1000);
                    });
            });

            $('#btn-sign-in').on('click', function(e) {
                var user = {
                    username: $('#tb-username').val(),
                    password: $('#tb-password').val()
                };

                data.signIn(user)
                    .then(function(user) {
                        toastr.success('User signed in!');
                        //document.location = '#/register';
                        context.redirect('#/home');
                        setTimeout(function() {
                            $('#container-sign-in').fadeOut(100, function() {
                                $('#container-sign-out')
                                    .fadeIn(500)
                                    .find("h4")
                                    .html("Hello, " + user.username);
                                $("#show-form").html(user.username);
                            });
                        }, 1000);
                    }, function(err) {
                        if (typeof err === "object") {
                            err = err.responseText;
                        }
                        toastr.error(err);
                        context.redirect('#/');
                    });
            });
        })
        .then(templates.get("home")
            .then(template => {
                context
                    .$element()
                    .find("#main-content")
                    .html(template());

                $("#all-posts-sortable").sortable();
            })
        );
}

export { all };