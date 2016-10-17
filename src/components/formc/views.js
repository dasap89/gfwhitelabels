"use strict";
let menuHelper = require('helpers/menuHelper.js');
let addSectionHelper = require('helpers/addSectionHelper.js');
let yesNoHelper = require('helpers/yesNoHelper.js');

module.exports = {
  introduction: Backbone.View.extend(_.extend({
    urlRoot: formcServer + '/:id' + '/introduction',

    events: _.extend({
      'submit form': 'submit',
    }, menuHelper.events, yesNoHelper.events),


    preinitialize() {
      // ToDo
      // Hack for undelegate previous events
      for(let k in this.events) {
        $('#content ' + k.split(' ')[1]).undelegate(); 
      }
    },

    getSuccessUrl() {
      return  '/formc/' + this.model.id + '/team-members';
    },

    submit(e) {
      var $target = $(e.target);
      var data = $target.serializeJSON();
      // ToDo
      // Fix this
      if (data.failed_to_comply_choice == false) {
        data.failed_to_comply = 'Please explain.';
      }
      api.submitAction.call(this, e, data);
    },

    initialize(options) {
      this.fields = options.fields;
    },

    render() {
      let template = require('components/formc/templates/introduction.pug');

      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          fields: this.fields,
          values: this.model,
        })
      );
      return this;
    },

  }, menuHelper.methods, yesNoHelper.methods)),

  teamMembers: Backbone.View.extend(_.extend({
    urlRoot: formcServer + '/:id' + '/team-members',
    events: _.extend({
    }, menuHelper.events),

    preinitialize() {
      // ToDo
      // Hack for undelegate previous events
      for(let k in this.events) {
        $('#content ' + k.split(' ')[1]).undelegate(); 
      }
    },

    getSuccessUrl() {
      return  '/formc/' + this.model.id + '/use-of-proceeds';
    },

    submit: api.submitAction,

    initialize(options) {
      this.fields = options.fields;
      // this.labels = {
      //   full_time_employers: 'Full Time Employees',
      //   part_time_employers: 'Part Time Employees',
      // };
      // this.labels = {};
      this.fields.full_time_employers = {label: 'Full Time Employees'};
      this.fields.part_time_employers = {label: 'Part Time Employees'};
      // this.fields.full_time_employers.label = 'Full Time Employees';
      // this.fields.part_time_employers.label = 'Part Time Employees';
      // this.assignLabels();
    },

    render() {
      let template = require('./templates/teamMembers.pug');

      this.model.campaign = {id: 72};
      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          fields: this.fields,
          values: this.model,
          roles: ['shareholder', 'director', 'officer', ],
          titles: {
            ceo: 'CEO/President', 
            financial: 'Principal Financial Officer/Treasurer', 
            controller: 'Controller/Principal Accounting Officer',
          },
        })
      );
      return this;
    },

  }, menuHelper.methods, addSectionHelper.methods)),

  teamMemberAdd: Backbone.View.extend(_.extend({
    urlRoot: formcServer + '/:id' + '/team-members',
    roles: ['shareholder', 'director', 'officer', ],
    events: _.extend({
      'submit form': 'submit',
    }, addSectionHelper.events, menuHelper.events),

    initialize(options) {
      this.fields = options.fields;
      this.role = options.role;

      this.labels = {
        experiences: {
          employer: '',
          employer_principal: '',
          title: '',
          responsibilities: '',
          start_date_of_service: '',
          end_date_of_service: '',
        },
        positions: {
          position: '',
          start_date_of_service: '',
          end_date_of_service: '',
        },
      };
      this.assignLabels();

      this.createIndexes();
      this.buildJsonTemplates('formc');
    },

    render() {
      let template = null;

      if(this.model.hasOwnProperty('uuid')  && this.model.uuid != '') {
        this.model.id = this.model.formc_id;
        this.urlRoot += '/' + this.role + '/' + this.model.uuid;
      } else {
        this.urlRoot = this.urlRoot.replace(':id', this.model.formc_id);
        this.urlRoot += '/' + this.role;
      }

      if (this.role == 'director') {
        template = require('components/formc/templates/teamMembersDirector.pug');
        this.buildJsonTemplates('formc');
      } else if(this.role == 'officer') {
        template = require('components/formc/templates/teamMembersOfficer.pug');
        this.buildJsonTemplates('formc');
      } else if (this.role == 'shareholder') {
        template = require('components/formc/templates/teamMembersShareHolder.pug');
      }

      require('bootstrap-select/sass/bootstrap-select.scss');
      let selectPicker = require('bootstrap-select');

      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          fields: this.fields,
          values: this.model,
          templates: this.jsonTemplates
        })
      );
      this.$el.find('.selectpicker').selectpicker();
    },

    getSuccessUrl(data) {
      return '/formc/' + this.model.formc_id + '/team-members';
    },

    submit: function(e) {
      e.preventDefault();
      var data = $(e.target).serializeJSON({ useIntKeysAsArrayIndex: true });

      data['board_service_start_date'] = data.board_service_start_date__year && data.board_service_start_date__month
      ? data.board_service_start_date__year + '-' + data.board_service_start_date__month + '-' + '01'
      : '';
      delete data.board_service_start_date__month;
      delete data.board_service_start_date__year;
      data['board_service_end_date'] = data.board_service_end_date__year && data.board_service_end_date__month
      ? data.board_service_end_date__year + '-' + data.board_service_end_date__month + '-' + '01'
      : '';
      delete data.board_service_end_date__month;
      delete data.board_service_end_date__year;
      data['employer_start_date'] = data.employer_start_date__year && data.employer_start_date__month
      ? data.employer_start_date__year + '-' + data.employer_start_date__month + '-' + '01'
      : '';
      delete data.employer_start_date__year;
      delete data.employer_start_date__month;
      _(data.positions).each((el, i) => {
      el.start_date_of_service = el.start_date_of_service__year && el.start_date_of_service__month
        ? el.start_date_of_service__year + '-' + el.start_date_of_service__month + '-' + '01'
        : '';
      delete el.start_date_of_service__year;
      delete el.start_date_of_service__month;
      el.end_date_of_service = el.end_date_of_service__year && el.end_date_of_service__month
        ? el.end_date_of_service__year + '-' + el.end_date_of_service__month + '-' + '01'
        : '';
      delete el.end_date_of_service__year;
      delete el.end_date_of_service__month;
      });
      _(data.experiences).each((el, i) => {
      el.start_date_of_service = el.start_date_of_service__year && el.start_date_of_service__month
        ? el.start_date_of_service__year + '-' + el.start_date_of_service__month + '-' + '01'
        : '';
      delete el.start_date_of_service__year;
      delete el.start_date_of_service__month;
      el.end_date_of_service = el.end_date_of_service__year && el.end_date_of_service__month
        ? el.end_date_of_service__year + '-' + el.end_date_of_service__month + '-' + '01'
        : '';
      delete el.end_date_of_service__year;
      delete el.end_date_of_service__month;
      });
      api.submitAction.call(this, e, data);
    },
  }, addSectionHelper.methods, menuHelper.methods)),

  offering: Backbone.View.extend(_.extend({
    events: _.extend({
      'submit form': 'submit',
    }, addSectionHelper.events, menuHelper.events),

    preinitialize() {
      // ToDo
      // Hack for undelegate previous events
      for(let k in this.events) {
        $('#content ' + k.split(' ')[1]).undelegate(); 
      }
    },

    getSuccessUrl() {
      return  '/formc/offering/' + this.model.id;
    },
    submit: api.submitAction,

    initialize(options) {
      this.fields = options.fields;
    },

    render() {
      let template = require('templates/formc/offering.pug');
      let values = this.model;

      if (!Array.isArray(values.members)) {
        values.members = [];
      }

      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          fields: this.fields,
          // values: this.model.toJSON(),
          values: values,
        })
      );
      return this;
    },

  }, addSectionHelper.methods, menuHelper.methods)),

  /*useOfProceeds: Backbone.View.extend({
    events: _.extend({
      'submit form': 'submit',
    }, jsonActions.events),

    preinitialize() {
      // ToDo
      // Hack for undelegate previous events
      for(let k in this.events) {
        $('#content ' + k.split(' ')[1]).undelegate(); 
        $('#content ' + k.split(' ')[1]).undelegate(); 
      }
    },

    addSection: jsonActions.addSection,
    deleteSection: jsonActions.deleteSection,
    getSuccessUrl() {
      return  '/formc/team-members/' + this.model.get('id');
    },
    // submit: app.defaultSaveActions.submit,
    submit: api.submitAction,

    initialize(options) {
      this.fields = options.fields;
    },

    render() {
      let template = require('templates/formc/useofproceeds.pug');

      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          fields: this.fields,
          values: this.model.toJSON(),
        })
      );
      return this;
    },
  }),*/

  relatedParties: Backbone.View.extend(_.extend({
    el: '#content',
    urlRoot: formcServer + '/:id' + '/related-parties',

    events: _.extend({
      'submit form': 'submit',
    }, addSectionHelper.events, menuHelper.events, yesNoHelper.events),

    initialize(options) {
      this.fields = options.fields;

      this.labels = {
        transaction_with_related_parties: {
          amount_of_interest: 'Amount of Interest',
          nature_of_interest: 'Nature of Interest in Transaction',
          relationship_to_issuer: 'Relationship to Issuer',
          specified_person: 'Specified Person',
        }
      };
      this.assignLabels();

      this.createIndexes();
      this.buildJsonTemplates('formc');

    },

    // submit: api.submitAction,
    submit(e) {
      var $target = $(e.target);
      var data = $target.serializeJSON({useIntKeysAsArrayIndex: true});

      if (data.had_transactions == 'false') {
        data.transaction_with_related_parties = [];
      }
      api.submitAction.call(this, e, data);
    },

    getSuccessUrl(data) {
      return '/formc/' + this.model.id + '/use-of-proceeds'
    },

    render() {
      let template = require('./templates/relatedParties.pug');

      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          fields: this.fields,
          values: this.model,
          templates: this.jsonTemplates,
        })
      );
      return this;
    },
  }, addSectionHelper.methods, menuHelper.methods, yesNoHelper.methods)),

  useOfProceeds: Backbone.View.extend(_.extend({
    urlRoot: 'https://api-formc.growthfountain.com/' + ':id' + '/use-of-proceeds',

    initialize(options) {
      this.fields = options.fields;
    },

    events: _.extend({
      'submit form': 'submit',
      'change input[type=radio][name=doc_type]': 'changeDocType',
      'click .add-proceed': 'addProceed',
      'click .delete-proceed': 'deleteProceed',
      'click .min-net-proceeds': 'calculate',
    }, addSectionHelper.events, menuHelper.events),
    // }, menuHelper.events),

    calculate(e) {
      // Add all min-expense
      // debugger
      let minNetProceeds = this.$('.min-expense').map(function (e) { return parseInt($(this).val()); }).toArray().reduce(function (total, num) { return total + num; });
      let maxNetProceeds = this.$('.max-expense').map(function (e) { return parseInt($(this).val()); }).toArray().reduce(function (total, num) { return total + num; });
      this.$('.min-net-proceeds').text(minNetProceeds);
      this.$('.max-net-proceeds').text(minNetProceeds);
      // this.$('.min-total-proceeds').text();
      // return true if the table is valid in terms of the calculation, else return false
      return false;
    },

    addProceed(e) {
      e.preventDefault();
      let $target = $(e.target);
      let template = require('./templates/proceed.pug');
      let type = $target.data('type');
      let dataType;
      if (type == 'use') dataType = 'use_of_net_proceeds';
      else if (type == 'expense') dataType = 'less_offering_express';
      $('.' + type + '-table tbody').append(template({
        type: type,
        dataType: dataType,
        index: 0,
      }));
    },

    deleteProceed(e) {
      e.preventDefault();
      let $target = $(e.currentTarget);
      let type = $target.data('type');
      let index = $target.data('index');
      $('.' + type + '-table tr.index_' + index).remove();
    },

    changeDocType(e) {
      if (e.target.value == 'describe') {
        this.$('.describe').show();
        this.$('.doc').hide();
      } else if (e.target.value == 'doc') {
        this.$('.describe').hide();
        this.$('.doc').show();
      }
    },

    submit: api.submitAction,

    render() {
      let template = require('components/formc/templates/useOfProceeds.pug');
    // this.fields['offering-expense'].type = 'row';

      if (this.model.faq) {
        // this.faqIndex = Object.keys(this.model.get('faq')).length;
        this.faqIndex = Object.keys(this.model.faq).length;
      } else {
        this.faqIndex = 0;
      }
      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          fields: this.fields,
          // values: this.model.toJSON(),
          values: this.model,
        })
      );
      return this;
    }, 
  }, addSectionHelper.methods, menuHelper.methods)),

  riskFactorsInstruction: Backbone.View.extend(_.extend({
    initialize(options) {},

    events: _.extend({
      'submit form': 'submit',
    }, menuHelper.events),

    submit: api.submitAction,    

    render() {
      let template = require('components/formc/templates/riskFactorsInstructions.pug');
      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          // fields: this.fields,
          // values: this.model.toJSON(),
          values: this.model,
        })
      );
      return this;
    },
  }, menuHelper.methods)),

  riskFactorsMarket: Backbone.View.extend(_.extend({
    urlRoot: formcServer + '/:id' + '/risk-factors-market/:index',
    events: _.extend({
      'submit form': 'submit',
      'click .delete': 'deleteRisk',
      'click .edit-risk': 'editRisk',
    }, menuHelper.events),

    initialize(options) {
      this.fields = options.fields;
      this.fields.title = {label: 'Title for Risk'};
      this.fields.risk = {label: 'Describe Your Risk'};
      this.defaultRisks = {
        0: {
          title: 'There is a limited market for the Company’s product or services',
          risk: 'Although we have identified what we believe to be a need in the market for our products and services, there can be no assurance that demand or a market will develop or that we will be able to create a viable business. Our future financial performance will depend, at least in part, upon the introduction and market acceptance of our products and services. Potential customers may be unwilling to accept, utilize or recommend any of our proposed products or services. If we are unable to commercialize and market such products or services when planned, we may not achieve any market acceptance or generate revenue.',
        },
        1: {
          title: 'We must correctly predict, identify, and interpret changes in consumer preferences and demand, offer new products to meet those changes, and respond to competitive innovation.',
          risk: 'Our success depends on our ability to predict, identify, and interpret the tastes and habits of consumers and to offer products that appeal to consumer preferences. If we do not offer products that appeal to consumers, our sales and market share will decrease. If we do not accurately predict which shifts in consumer preferences will be long-term, or if we fail to introduce new and improved products to satisfy those preferences, our sales could decline. If we fail to expand our product offerings successfully across product categories, or if we do not rapidly develop products in faster growing and more profitable categories, demand for our products could decrease, which could materially and adversely affect our product sales, financial condition, and results of operations.',
        },
        2: {
          title: 'We may be adversely affected by cyclicality, volatility or an extended downturn in the United States or worldwide economy, or in the industries we serve.',
          risk: 'Our operating results, business and financial condition could be significantly harmed by an extended economic downturn or future downturns, especially in regions or industries where our operations are heavily concentrated. Further, we may face increased pricing pressures during such periods as customers seek to use lower cost or fee services, which may adversely affect our financial condition and results of operations.',
        },
        3: {
          title: 'Failure to obtain new clients or renew client contracts on favorable terms could adversely affect results of operations.',
          risk: 'We may face pricing pressure in obtaining and retaining our clients.  On some occasions, this pricing pressure may result in lower revenue from a client than we had anticipated based on our previous agreement with that client. This reduction in revenue could result in an adverse effect on our business and results of operations. Further, failure to renew client contracts on favorable terms could have an adverse effect on our business. If we are not successful in achieving a high rate of contract renewals on favorable terms, our business and results of operations could be adversely affected.',
        },
        4: {
          title: 'Our business and results of operations may be adversely affected if we are unable to maintain our customer experience or provide high quality customer service.',
          risk: 'The success of our business largely depends on our ability to provide superior customer experience and high quality customer service, which in turn depends on a variety of factors, such as our ability to continue to provide a reliable and user-friendly website interface for our customers to browse and purchase our products, reliable and timely delivery of our products, and superior after sales services. If our customers are not satisfied, our reputation and customer loyalty could be negatively affected.',
        },
      };
    },

    deleteRisk(e) {
      e.stopPropagation();
      e.preventDefault();
      if (!confirm("Do you really want to delete this risk?")) return;
      let index = e.target.dataset.index;
      let url = this.urlRoot.replace(':id', this.model.id).replace(':index', index);
      // let data = $(e.target).serializeJSON({ useIntKeysAsArrayIndex: true });

      api.makeRequest(url, 'DELETE', {}).then((data) => {
        if (index < Object.keys(this.defaultRisks).length) {
          $(e.target).find('textarea').prop('readonly', true);
          let $form = this.$('form[index=' + index + ']');
          $form.find('.buttons').css({display: 'none'});
          $form.find('.unadded-state').css({display: 'inline-block'});
          $form.find('textarea').val(this.defaultRisks[index].risk);
          let $panel = this.$('.risk-panel[index=' + index + ']');
          $panel.find('a').removeClass('added-risk-title');
        } else {
          let $section = $('.risk-panel[index=' + index + ']');
          $section.remove();
        }
      // $form.find('.added-span').text(' (added to Form C)');
      }).fail((xhr, status, text) => {
        api.errorAction(this, xhr, status, text, this.fields);
      });

    },

    editRisk(e) {
      e.preventDefault();
      let $target = $(e.target);
      let index = $target.data('index');
      $('textarea[index=' + index + ']').attr('readonly', false);
      // let $form = $('form[index=' + index + ']');
      let $form = $('form[index=' + index + ']');
      // $panel.find('.add-risk').css({display: 'inline-block'});
      // $panel.find('.alter-risk').css({display: 'none'});
      $form.find('.buttons').css({display: 'none'});
      $form.find('.editing-state').css({display: 'inline-block'});
      $form.find('.added-span').text('');
      // $target.css({display: 'none'});
    },

    submit(e) {
      e.preventDefault();
      let index = e.target.dataset.index;
      if (!index) {
        index = Object.keys(this.defaultRisks).length - 1;
        $('.risk-panel').each(function(idx, elem) {
          let $elem = $(this);
          let panelIdx = parseInt($elem.attr('index'))
          if (panelIdx > index) index = panelIdx;
        });
        index += 1;
      }
      let url = this.urlRoot.replace(':id', this.model.id).replace(':index', index);
      let formData = $(e.target).serializeJSON({ useIntKeysAsArrayIndex: true });

      api.makeRequest(url, 'PATCH', formData).then((data) => {
        $(e.target).find('textarea').prop('readonly', true);
        let $form = $('form[index=' + index + ']');
        if ($form.length > 0) { // find the form    
          $form.find('.buttons').css({display: 'none'});
          $form.find('.added-state').css({display: 'inline-block'});
          $form.find('.added-span').text(' (added to Form C)');
          let $panel = this.$('.risk-panel[index=' + index + ']');
          $panel.find('a').addClass('added-risk-title');
        } else {
          // create and append panel
          let template = require('./templates/risk.pug');
          $('#accordion-risk').append(template({
            k: index,
            v: formData,
          }));
          $('.add-risk-form').find('input:text, textarea').val('');
        }
      }).
      fail((xhr, status, text) => {
        api.errorAction(this, xhr, status, text, this.fields);
      });
    },

    render() {
      let template = require('components/formc/templates/riskFactorsMarket.pug');
      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          fields: this.fields,
          // values: this.model.toJSON(),
          values: this.model,
          defaultRisks: this.defaultRisks,
        })
      );
      return this;
    },
  }, menuHelper.methods)),

  riskFactorsFinancial: Backbone.View.extend(_.extend({
    initialize(options) {},

    events: _.extend({
      'submit form': 'submit',
    }, menuHelper.events),

    submit: api.submitAction,

    render() {
      let template = require('components/formc/templates/riskFactorsFinancial.pug');
      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          // fields: this.fields,
          // values: this.model.toJSON(),
          values: this.model,
        })
      );
      return this;
    },
  }, menuHelper.methods)),

  riskFactorsOperational: Backbone.View.extend(_.extend({
    initialize(options) {},

    events: _.extend({
      'submit form': 'submit',
    }, menuHelper.methods),

    submit: api.submitAction,

    render() {
      let template = require('components/formc/templates/riskFactorsOperational.pug');
      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          // fields: this.fields,
          // values: this.model.toJSON(),
          values: this.model,
        })
      );
      return this;
    },
  }, menuHelper.methods)),

  riskFactorsCompetitive: Backbone.View.extend(_.extend({
    initialize(options) {},

    events: _.extend({
      'submit form': 'submit',
    }, menuHelper.events),

    submit: api.submitAction,

    render() {
      let template = require('components/formc/templates/riskFactorsCompetitive.pug');
      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          // fields: this.fields,
          // values: this.model.toJSON(),
          values: this.model,
        })
      );
      return this;
    },
  }, menuHelper.methods)),


  riskFactorsPersonnel: Backbone.View.extend(_.extend({
    initialize(options) {},

    events: _.extend({
      'submit form': 'submit',
    }, menuHelper.events),

    submit: api.submitAction,

    render() {
      let template = require('components/formc/templates/riskFactorsPersonnel.pug');
      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          // fields: this.fields,
          // values: this.model.toJSON(),
          values: this.model,
        })
      );
      return this;
    },
  }, menuHelper.methods)),

  riskFactorsLegal: Backbone.View.extend(_.extend({
    initialize(options) {},

    events: _.extend({
      'submit form': 'submit',
    }, menuHelper.events),

    submit: api.submitAction,

    render() {
      let template = require('components/formc/templates/riskFactorsLegal.pug');
      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          // fields: this.fields,
          values: this.model,
        })
      );
      return this;
    },
  }, menuHelper.methods)),

  riskFactorsMisc: Backbone.View.extend(_.extend({
    initialize(options) {},

    events: _.extend({
      'submit form': 'submit',
    }, menuHelper.events),

    submit: api.submitAction,

    render() {
      let template = require('components/formc/templates/riskFactorsMisc.pug');
      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          // fields: this.fields,
          values: this.model,
        })
      );
      return this;
    },
  }, menuHelper.methods)),

  financialCondition: Backbone.View.extend(_.extend({
    urlRoot: 'https://api-formc.growthfountain.com/' + ':id' + '/financial-condition',

    initialize(options) {
      this.fields = options.fields;
      this.labels = {
        taxable_income: "Taxable Income",
        total_income: "Total Income",
        total_tax: "Total Tax",
        total_assets: "Total Assets",
        long_term_debt: "Long Term Debt",
        short_term_debt: "Short Term Debt",
        cost_of_goods_sold: "Cost of Goods Sold",
        account_receivable: "Account Receivable",
        cash_and_equivalents: "Cash Equivalents",
        revenues_sales: "Revenues Sales",
      };
      this.assignLabels();
    },

    events: _.extend({
      'submit form': 'submit',
    }, menuHelper.events, yesNoHelper.events),

    submit: api.submitAction,

    getSuccessUrl() {
      return  '/formc/' + this.model.id + '/outstanding-security';
    },

    render() {
      // this.fields.sold_securities_data.schema.taxable_income.label = "Taxable Income";
      // this.fields.sold_securities_data.schema.total_income.label = "Total Income";
      // this.fields.sold_securities_data.schema.total_tax.label = "Total Tax";
      // this.fields.sold_securities_data.schema.total_assets.label = "Total Assets";
      // this.fields.sold_securities_data.schema.long_term_debt.label = "Long Term Debt";
      // this.fields.sold_securities_data.schema.short_term_debt.label = "Short Term Debt";
      // this.fields.sold_securities_data.schema.cost_of_goods_sold.label = "Cost of Goods Sold";
      // this.fields.sold_securities_data.schema.account_receivable.label = "Account Receivable";
      // this.fields.sold_securities_data.schema.cash_and_equivalents.label = "Cash Equivalents";
      // this.fields.sold_securities_data.schema.revenues_sales.label = "Revenues Sales";
      let template = require('components/formc/templates/financialCondition.pug');
      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          fields: this.fields,
          values: this.model,
        })
      );
      return this;
    },
  }, menuHelper.methods, yesNoHelper.methods)),

  outstandingSecurity: Backbone.View.extend(_.extend({
    urlRoot: formcServer + '/:id' + '/outstanding-security',
    initialize(options) {
      this.fields = options.fields;
      this.labels = {
        exempt_offering: {
          exemption_relied_upon: "Exemption Relied upon",
          use_of_proceeds: "Use of Proceeds",
          offering_date: "Date of The Offering",
          amount_sold: "Amount Sold",
          securities_offered: "Securities Offered",
        },
        business_loans_or_debt: {
          maturity_date: "Maturity Date",
          outstaind_amount: "Outstanding Date",
          interest_rate: "Interest Rate",
          other_material_terms: "Other Material Terms",
          creditor: "Creditor"
        },
        principal_shareholders_affect: 'How could the exercise of rights held by the principal shareholders affect the purchasers of the securities being offered?',
        risks_to_purchasers: '',
        terms_modified: 'How may the terms of the securities being offered be modified?',
        security_differences: 'Are there any differences not reflected above between the securities being offered and each other class of security of the issuer?',
        rights_of_securities_beign: 'How may the rights of the securities being offered be materially limited, diluted or qualified by the rights of any other class of security identified above?',
        outstanding_securities: 'Outstanding Securities',
      };
      this.assignLabels();
    },

    events: _.extend({
      'submit form': 'submit',
      'click .add-outstanding': 'addOutstanding',
      'click .delete-outstanding': 'deleteOutstanding',
    }, addSectionHelper.events, menuHelper.events, yesNoHelper.events),

    // submit: api.submitAction,
    submit(e) {
      var $target = $(e.target);
      var data = $target.serializeJSON({useIntKeysAsArrayIndex: true});
      if (data.have_loans_debt == 'false') data.business_loans_or_debt = [];
      if (data.conduct_exempt_offerings == 'false') data.exempt_offering = [];
      if (!data.outstanding_securities) data.outstanding_securities = [];
      api.submitAction.call(this, e, data);
    },

    addOutstanding(e) {
      e.preventDefault();
      // get the form
      let $form = $(".modal-form");
      let data = $form.serializeJSON();
      // console.log(data);
      // add an entry
      let template = require('./templates/security.pug');
      $('.securities-table tbody').append(template({
        values: data,
        index: this.outstanding_securitiesIndex
      }));
      this.outstanding_securitiesIndex++;
    },

    deleteOutstanding(e) {
      e.preventDefault();
      if(confirm('Are you sure?')) {
        let sectionName = e.currentTarget.dataset.section;
        $('.' + sectionName + ' .index_' + e.currentTarget.dataset.index).remove();
        // e.currentTarget.offsetParent.remove();
      }

      // ToDo
      // Fix index counter
      // this[sectionName + 'Index'] --;
    },

    getSuccessUrl() {
      return  '/formc/' + this.model.id + '/background-check';
    },

    render() {
      let template = require('components/formc/templates/outstandingSecurity.pug');

      if (this.model.business_loans_or_debt) {
        this.business_loans_or_debtIndex = Object.keys(this.model.business_loans_or_debt).length;
      } else {
        this.business_loans_or_debtIndex = 0;
      }
      if (this.model.exempt_offerings) {
        this.exempt_offeringsIndex = Object.keys(this.model.exempt_offerings).length;
      } else {
        this.exempt_offeringsIndex = 0;
      }

      if (this.model.outstanding_securities) {
        this.outstanding_securitiesIndex = Object.keys(this.model.outstanding_securities).length;
      } else {
        this.outstanding_securitiesIndex = 0;
      }

      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          fields: this.fields,
          values: this.model,
        })
      );
      return this;
    },
  }, addSectionHelper.methods, menuHelper.methods, yesNoHelper.methods)),

  backgroundCheck: Backbone.View.extend(_.extend({
    urlRoot: formcServer + '/:id' + '/background-check',
    initialize(options) {
      this.fields = options.fields;
      this.labels = {
        company_or_director_subjected_to: 'If Yes, Explain',
        descrption_material_information: "2) If you've provide any information in a format, media or other means not able to be reflected in text or pdf, please include here: (a) a description of the material content of such information; (b) a description of the format in which such disclosure is presented; and (c) in the case of disclosure in video, audio or other dynamic media or format, a transcript or description of such disclosure.",
        material_information: '1) Such further material information, if any, as may be neessary to make the required statments, in the light of the cirsumstances under which they are made, not misleading.',
      };
      this.assignLabels();
    },

    getSuccessUrl() {
      // return  '/formc/' + this.model.id + '/background-check';
      return  '/formc/' + this.model.id + '/outstanding-security';
    },

    events: _.extend({
      'submit form': 'submit',
    }, menuHelper.events, yesNoHelper.events),

    submit: api.submitAction,

    render() {
      let template = require('components/formc/templates/backgroundCheck.pug');
      this.$el.html(
        template({
          serverUrl: serverUrl,
          Urls: Urls,
          fields: this.fields,
          values: this.model,
        })
      );
      return this;
    },
  }, menuHelper.methods, yesNoHelper.methods, addSectionHelper.methods)),
};
