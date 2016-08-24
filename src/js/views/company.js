define(function() {
    return {

        createOrUpdate: Backbone.View.extend({
            events: {
                'submit form': 'submit',
            },
            initialize: function(options) {
                this.fields = options.fields;
                this.campaign = options.campaign;
            },

            render: function() {
                let template = require('templates/companyCreateOrUpdate.pug');
                this.$el.html(
                    template({
                        serverUrl: serverUrl,
                        Urls: Urls,
                        fields: this.fields,
                        values: this.model.toJSON(),
                        user: app.user.toJSON(),
                        campaign: this.campaign
                    })
                );
                return this;
            },

            submit: function(e) {
                this.$el.find('.alert').remove();
                event.preventDefault();

                var data = $(e.target).serializeObject();
                delete data['id'];
                //var investment = new InvestmentModel(data);
                console.log(data);

                this.model.set(data);
                console.log(this.model);
                Backbone.Validation.bind(this, {model: this.model});

                if(this.model.isValid(true)) {
                    // ToDo
                    // Move it to success method
                    var self = this;
                    this.model.save().
                        then((data) => { 
                            app.showLoading();

                            self.undelegateEvents();
                            $('#content').scrollTo();
                            app.routers.navigate(
                                '/campaign/general_information/?company_id=' + data.id,
                                {trigger: true, replace: false}
                            );

                        }).
                        fail((xhr, status, text) => {
                            app.defaultSaveActions.error(this, xhr, status, text, this.fields);
                        });
                } else {
                    if(this.$('.alert').length) {
                        this.$('.alert').scrollTo();
                    } else  {
                        this.$el.find('.has-error').scrollTo();
                    }
                }
            },

        }),
    }
});
