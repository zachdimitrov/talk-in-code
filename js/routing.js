import * as templates from "template-requester";
import * as data from "data";
import User from "userModel";
import Post from "postModel";
import { USERNAME_LOCAL_STORAGE } from "constants";

const $content = $("#content");

// http://codeseven.github.io/toastr/demo.html
toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-center",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "50",
    "hideDuration": "50",
    "timeOut": "1200",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "slideDown",
    "hideMethod": "slideUp"
}

var sammyApp = Sammy('#content', function() {
    this.get('/', context => context.redirect('#/home'));

    this.get('#/', context => context.redirect('#/home'));

    this.get('#/home', context => loader.loadHomePage(context, false, false));

    this.get('#/home/:category', function(context) { loader.loadHomePage(context, this.params["category"], false); });

    this.get('#/home/all/:author', function(context) { loader.loadHomePage(context, false, this.params["author"]); });

    this.get('#/login', context => loader.loadLoginMenu(context));

    this.get('#/register', context => loader.loadRegisterMenu(context));

    this.get('#/posts/add', context => loader.loadCreatePost(context));

    this.get('#/posts/:postid', function(context) { loader.loadCurrentPost(context, this.params["postid"]); });

    this.get('#/posts/:postid/comment', function(context) { loader.loadCreateComment(context, this.params["postid"]); });
});

let loader = {
    loadHomePage: function(context, category, author) {
        data.posts.getPosts(category, author)
            .then(info => templates.get("home")
                .then(template => {
                    $content
                        .find("#main-content")
                        .html(template({ info }));
                })
                .then(() => {
                    // TODO: separate logic on different file
                    // $("#all-posts-sortable").sortable();
                    let signedUser = localStorage.getItem(USERNAME_LOCAL_STORAGE);
                    if (!signedUser) {
                        $("#login-button").show();
                        $("#add-new-thread").hide();
                        $("#logout-button").hide();
                        $("#login-info").hide();
                    } else {
                        $("#logout-button").show();
                        $("#login-info").show();
                        $("#add-new-thread").show();
                        $("#login-button").hide();
                    }

                    // click login -> goes to login page
                    $("body").on("click", "#login-button", () => {
                        context.redirect("#/login");
                    });

                    // click logout -> logouts and goes to home page
                    $("body").on("click", "#logout-button", () => {
                        // console.log(data);
                        data.users.signOut()
                            .then((user) => {
                                toastr.success("User " + user + " signed out!", "Success!");
                                context.redirect("#/");
                                $("#logout-button").fadeOut(100, function() {
                                    $("#login-button")
                                        .fadeIn(400);
                                    $("#login-info").hide();
                                });
                            })
                            .catch(err => {
                                toastr.error(err, "Error!");
                            });
                    });
                })
            );
    },
    loadPostsByAuthor: function(context) {

    },
    loadLoginMenu: function(context) {
        templates.get("login")
            .then(function(template) {
                $content
                    .find("#main-content")
                    .html(template());

                // TODO: separate logic on different file
                $("body").on("click", "#btn-sign-in", () => {
                    var user = {
                        username: $("#tb-username").val(),
                        password: $("#tb-password").val()
                    };

                    data.users.signIn(user)
                        .then(user => {
                            toastr.success("User " + user.username + " signed in!", "Success!");
                            $("#login-button").fadeOut(100, function() {
                                $("#logout-button")
                                    .fadeIn(400);
                                $("#login-info")
                                    .fadeIn(400)
                                    .html("Hello, " + user.username);
                            });
                        })
                        .then(() => {
                            context.redirect("#/home");
                        })
                        .catch(err => {
                            if (typeof err === "object") {
                                err = err.responseText;
                            }
                            toastr.error(err, "Error!");
                        })
                });
            });
    },
    loadRegisterMenu: function(context) {
        templates.get("register")
            .then(function(template) {
                $content
                    .find("#main-content")
                    .html(template());

                // TODO: separate logic on different file
                $("body").on("click", "#btn-register", function() {
                    // read from input fields
                    const username = $("#tb-reg-username").val(),
                        password = $("#tb-reg-password").val(),
                        email = $("#tb-reg-email").val();
                    // create user
                    const user = new User(username, password, email);

                    data.users.register(user)
                        .then(user => {
                            toastr.success("User " + user.username + " registered!", "Success!");
                            context.redirect("#/login");
                        })
                        .catch(err => {
                            if (typeof err === "object") {
                                err = err.responseText;
                            }
                            toastr.error(err, "Error!");
                        })
                });
            })
    },
    loadCreatePost: function(context) {
        templates.get("create-post")
            .then(template => {
                context
                    .$element()
                    .find("#main-content")
                    .html(template);
                return context;
            });
        $("body").on("click", "#create-new-post-request-button", function(ev) {
            var title, category;
            var content = "New pst";
            const author = { "username": data.users.authUser() };
            console.log(author);
            const likes = 0;
            $("#tb-thread-title")
                .keyup(function() {
                    title = $(this).val();
                })
                .keyup();
            console.log(title);
            category = $("#tb-thread-category").val();
            console.log(category);
            content = tinymce.get("post-content-field").getContent();
            console.log(content);
            const newPost = new Post(author, content, likes, title, category);
            console.log(newPost);
            data.posts.addPost(newPost)
                .then(function() {
                    toastr.success("You have published new post!");
                    setTimeout(function() {
                        context.redirect("#/");
                        document.location.reload(true);
                    }, 1000);
                }, function(err) {
                    if (typeof err === "object") {
                        err = err.responseText;
                    }
                    toastr.error(err);
                });
        });
    },
        loadCurrentPost: function (context,postid) {
            data.posts.getSinglePost(postid)
                .then(templates.get("current-post")
                    .then(template => {
                        $content
                            .find("#main-content")
                            .html(template());
                    }))
        },
        loadCreateComment: function (context, postid) {
        return 1;

        }


    };
    sammyApp.run('#/');