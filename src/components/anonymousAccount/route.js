module.exports = Backbone.Router.extend({
  routes: {
    'account/login': 'login',
    'account/signup': 'signup',
    'account/facebook/login/': 'loginFacebook',
    'account/google/login/': 'loginGoogle',
    'account/linkedin/login/': 'loginLinkedin',
    'account/finish/login/': 'finishSocialLogin',
    'account/reset': 'resetPassword',
  },

  login(id) {
    require.ensure([], function() {
      const View = require('components/anonymousAccount/views.js');
      let a1 = api.makeRequest(Urls['rest_login'](), 'OPTIONS');
      $.when(a1).done((metaData) => {
        let loginView = new View.login({
          el: '#content',
          login_fields: metaData.actions.POST,
          model: new userModel(),
        });
        loginView.render();
        app.hideLoading();
      }).fail((xhr, error) => {
        // ToDo
        // Show global error message
        console.log(xhr, error);
        app.hideLoading();
      });
    });
  },

  signup(id) {
    require.ensure([], function() {
      const View = require('components/anonymousAccount/views.js');
      let a1 = api.makeRequest(Urls['rest_register'](), 'OPTIONS');
      $.when(a1).done((metaData) => {
        let signView = new View.signup({
          el: '#content',
          register_fields: metaData.actions.POST,
          model: new userModel(),
        });
        signView.render();
        app.hideLoading();
      }).fail((xhr, error) => {
        // ToDo
        // Show global error message
        console.log(xhr, error);
        app.hideLoading();
      });
    });
  },

    loginFacebook() {
        require.ensure([], function() {
            const socialAuth = require('js/views/social-auth');
            const hello = require('hellojs');

            hello('facebook').login({
                scope: 'public_profile,email'}).then(
                function (e) {
                    var sendToken = socialAuth.sendToken('facebook', e.authResponse.access_token);

                    $.when(sendToken).done(function (data) {
                        localStorage.setItem('token', data.key);
                        window.location = '/account/profile';
                    });
                },
                function (e) {

                    // TODO: notificate user about reason of error;
                    app.routers.navigate(
                        '/account/login',
                        {trigger: true, replace: true}
                    );
                });
        });

    },

    loginLinkedin() {

        require.ensure([], function() {
            const socialAuth = require('js/views/social-auth.js');
            const hello = require('hellojs');

            hello('linkedin').login({
                scope: 'r_basicprofile,r_emailaddress',
            }).then(
                function (e) {
                    var sendToken = socialAuth.sendToken('linkedin', e.authResponse.access_token);

                    $.when(sendToken).done(function (data) {
                        localStorage.setItem('token', data.key);
                        window.location = '/account/profile';
                    });
                },
                function (e) {

                    // TODO: notificate user about reason of error;
                    app.routers.navigate(
                        '/account/login',
                        {trigger: true, replace: true}
                    );
                }
            );
        });

    },

    loginGoogle() {
        require.ensure([], function() {

            const socialAuth = require('js/views/social-auth.js');
            const hello = require('hellojs');

            hello('google').login({
                scope: 'profile,email'}).then(
                function (e) {
                    var sendToken = socialAuth.sendToken('google', e.authResponse.access_token);

                    $.when(sendToken).done(function (data) {
                        localStorage.setItem('token', data.key);
                        window.location = '/account/profile';
                    });
                },
                function (e) {

                    // TODO: notificate user about reason of error;
                    app.routers.navigate(
                        '/account/login',
                        {trigger: true, replace: true}
                    );
                });
        });
    },

    finishSocialLogin() {
        require.ensure([], function() {
            const socialAuth = require('js/views/social-auth.js');
            const hello = require('hellojs');
        });
    },

    resetPassword: function() {
        require.ensure([], function() {
            const view = require('components/anonymousAccount/views.js');
            let i = new view.reset({
                el: '#content',
            });
            i.render();
            app.hideLoading();
        });
    },
});    