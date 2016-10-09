define('ember-date/components/date-picker', ['exports', 'ember', '../templates/components/date-picker'], function (exports, _ember, _templatesComponentsDatePicker) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var get = _ember['default'].get;
  var set = _ember['default'].set;
  var computed = _ember['default'].computed;

  /**
   * A versatile date picker component.
   * This is 100% ember based and uses no other date picker library.
   *
   * @namespace EmberDateComponents
   * @class DatePicker
   * @extends Ember.Component
   * @public
   */
  exports['default'] = _ember['default'].Component.extend({
    layout: _templatesComponentsDatePicker['default'],

    classNames: ['date-picker__wrapper'],
    classNameBindings: ['isOpen:date-picker__wrapper--open'],

    // ATTRIBUTES BEGIN ----------------------------------------

    /**
     * The default value for the date picker.
     * Can be a value or an array.
     * Note that internally, this will always be converted to an array (if for a sinle-date picker field).
     * So it makes no difference if it is val or [val].
     *
     * @attribute value
     * @type {Date}
     * @optional
     * @public
     */
    value: null,

    /**
     * An optional minimum date for this date picker.
     * No dates before this date will be selectable.
     *
     * @attribute minDate
     * @type {Date}
     * @optional
     * @public
     */
    minDate: null,

    /**
     * An optional maximum date for this date picker.
     * No dates after this date will be selectable.
     *
     * @attribute masDate
     * @type {Date}
     * @optional
     * @public
     */
    maxDate: null,

    /**
     * If this date picker should select a range instead of a single date.
     * If this is set, the action's parameter will always be an array with two elements, both of which could be null.
     * The dates will always be in order (e.g. earlier date as first element, later date as second element).
     *
     * @attribute range
     * @type {Boolean}
     * @default false
     * @public
     */
    range: false,

    /**
     * The placeholder for the button, if no date is selected.
     *
     * @attribute placeholder
     * @type {String}
     * @default 'Select Date...'
     * @public
     */
    placeholder: 'Select Date...',

    /**
     * Optional classes for the button.
     *
     * @attribute buttonClasses
     * @type {String}
     * @optional
     * @public
     */
    buttonClasses: '',

    /**
     * The date format which should be used for the button.
     * Defaults to localized 'L'.
     *
     * @attribute buttonDateFormat
     * @type {String}
     * @default 'L'
     * @public
     */
    buttonDateFormat: 'Y/m/d',
    titleDateFormat: 'm-Y',

    pad: function pad(val) {
      if ((val + '').length < 2) return '0' + val;
      return '' + val;
    },

    formatDate: function formatDate(date, format) {
      var mapFormat = {
        'y': function y(date) {
          return (date.getFullYear() + '').substring(2, 4);
        },

        'Y': function Y(date) {
          return date.getFullYear() + '';
        },

        'd': function d(date) {
          return this.pad(date.getDate());
        },

        'm': function m(date) {
          return this.pad(date.getMonth() + 1);
        }
      };

      var seprator = format.match(/[\/\.\-]/);
      var parts = format.split(/[\/\.\-]/);
      var result = [];

      if (seprator.length != 1) throw new Error('Non supported format');

      for (var i = 0; i < parts; i++) {
        var part = mapFormat[parts[i]];
        if (!part) throw new Error('Non supported format');

        result.push(part(date));
      }

      return result.join(seprator[0]);
    },

    /**
     * If custom options should be displayed.
     * If this is true, the default options for date-pickers/date-range-pickers will be shown.
     * It can also be an array, where the exact options are specified.
     *
     * @attribute options
     * @type {Boolean|Array}
     * @default false
     * @public
     */
    options: false,

    /**
     * The action to call whenever one of the value changes.
     *
     * @event action
     * @param {Date|Date[]} date Either a single date (or null) if `range=false`, or an array with two elements if `range=true`.
     * @public
     */
    action: null,

    /**
     * The action to call whenever the date picker is closed.
     *
     * @event action
     * @param {Date|Date[]} date Either a single date (or null) if `range=false`, or an array with two elements if `range=true`.
     * @public
     */
    closeAction: null,

    // ATTRIBUTES END ----------------------------------------

    // PROPERTIES BEGIN ----------------------------------------

    /**
     * A separator for the date range buttons.
     *
     * @property dateRangeSeparator
     * @type {String}
     * @default ' - '
     * @private
     */
    dateRangeSeparator: ' - ',

    /**
     * The internal dates. No matter if it is a range or a single date selector,
     * the dates will always be saved in this array.
     *
     * @property _dates
     * @type {Date[]}
     * @private
     */
    _dates: [],

    /**
     * The currently visible month.
     * This is set on initialisation. It is either the first selected date (if a value is provided), or today.
     *
     * @property currentMonth
     * @type {Date}
     * @private
     */
    currentMonth: null,

    /**
     * If the current selection is the to-step.
     * This is automatically set internally for a range picker.
     *
     * @property isToStep
     * @type {Boolean}
     * @private
     */
    isToStep: false,

    /**
     * If the date picker is open.
     *
     * @property isOpen
     * @type {Boolean}
     * @private
     */
    isOpen: false,

    /**
     * The text for the button.
     * This will either return the placeholder, or the formatted date.
     *
     * @property buttonText
     * @type {String}
     * @readOnly
     * @private
     */
    buttonText: computed('range', '_dates.[]', function () {
      var isRange = get(this, 'range');
      var vals = get(this, '_dates') || _ember['default'].A([]);
      var dateFormat = get(this, 'buttonDateFormat');

      var _vals = _slicedToArray(vals, 1);

      var dateFrom = _vals[0];

      if (!isRange) {
        if (!dateFrom) {
          return get(this, 'placeholder');
        }
        return this.formatDate(dateFrom, dateFormat); //dateFrom.format(dateFormat);
      }

      if (!dateFrom) {
        return get(this, 'placeholder');
      }

      return this.formatDate(dateForm, dateFormat); //dateFrom.format(dateFormat);
    }),

    titleText: computed('currentMonth', 'titleDateFormat', function () {
      var currentMonth = get(this, 'currentMonth');
      var dateFormat = get(this, 'titleDateFormat');

      return this.formatDate(currentMonth, dateFormat);
    }),

    /**
     * The text for the to-button.
     * This is only used for date range pickers.
     * It will either return the placeholder, or the formatted date.
     *
     * @property buttonToText
     * @type {String}
     * @readOnly
     * @private
     */
    buttonToText: computed('range', '_dates.[]', function () {
      var vals = get(this, '_dates') || _ember['default'].A([]);
      //let dateFormat = get(this, 'buttonDateFormat');

      var _vals2 = _slicedToArray(vals, 2);

      var dateTo = _vals2[1];

      if (!dateTo) {
        return get(this, 'placeholder');
      }

      return this.formatDate(dateTo, dateFormat); //dateTo.format(dateFormat);
    }),

    /**
     * If the (first) button is currently focused.
     *
     * @property buttonFocused
     * @type {Boolean}
     * @readOnly
     * @private
     */
    buttonFocused: computed('range', 'isOpen', 'isToStep', function () {
      var isRange = get(this, 'range');
      var isOpen = get(this, 'isOpen');
      var isToStep = get(this, 'isToStep');

      return isRange ? isOpen && !isToStep : isOpen;
    }),

    /**
     * If the to-button is currently focused.
     *
     * @property buttonToFocused
     * @type {Boolean}
     * @readOnly
     * @private
     */
    buttonToFocused: computed('range', 'isOpen', 'isToStep', function () {
      var isRange = get(this, 'range');
      var isOpen = get(this, 'isOpen');
      var isToStep = get(this, 'isToStep');

      return isRange ? isOpen && isToStep : false;
    }),

    /**
     * An array with all selected dates.
     * This contains only selected dates, no null values! This means it can have zero, one or two values.
     * This is passed to date-picker-month to show the selected dates.
     *
     * @property selectedDates
     * @type {Date[]}
     * @readOnly
     * @private
     */
    selectedDates: computed('_dates.[]', function () {
      var arr = [];

      var _get = get(this, '_dates');

      var _get2 = _slicedToArray(_get, 2);

      var dateFrom = _get2[0];
      var dateTo = _get2[1];

      if (dateFrom) {
        arr.push(dateFrom);
      }
      if (dateTo) {
        arr.push(dateTo);
      }
      return _ember['default'].A(arr);
    }),

    /**
     * The width of the calendar widget. If you use the default styling, this will be 300.
     * If you do not use the default styling, change this to the value you use.
     * This is used to calculate the correct position of the calendar if it would run out of the window on the right side.
     *
     * @attribute calendarWidth
     * @type {Number}
     * @default 280
     * @private
     */
    calendarWidth: computed('options', function () {
      var baseWidth = 280;
      var optionWidth = 140;

      return get(this, 'options') ? baseWidth + optionWidth : baseWidth;
    }),

    /**
     * This string is built to fix the offset of the component.
     * For example, if the date-picker is at the right edge of the window, the date-picker would run outside of the window.
     * This offset ensures that the date picker will stay inside of the window.
     * This will be set to a style-compatible SafeString, e.g. `transform: translate(100px,0)`.
     *
     * @property translateX
     * @type {String}
     * @private
     */
    translateX: null,

    /**
     * These are the parsed options.
     * String/default options are converted into actual option objects via _optionsMap.
     *
     * @property _options
     * @type {Object[]}
     * @readOnly
     * @private
     */
    _options: computed('options.[]', function () {
      var options = get(this, 'options');
      var isRange = get(this, 'range');
      var optionsMap = get(this, '_optionsMap');

      if (!options) {
        return _ember['default'].A();
      }

      // If options is true, return the default options depending on isRange
      if (_ember['default'].typeOf(options) !== 'array') {
        options = isRange ? get(this, '_defaultDateRangeOptions') : get(this, '_defaultDateOptions');
      }

      return options.map(function (option) {
        return _ember['default'].typeOf(option) === 'string' ? optionsMap[option] : option;
      });
    }),

    /**
     * This maps how option names are mapped to actual options.
     * You can overwrite this if you want to have different option shortcuts.
     *
     * @property _optionsMap
     * @type {Object}
     * @private
     */
    _optionsMap: {
      'clear': {
        action: 'clearDate',
        label: 'Clear'
      },
      'today': {
        action: 'selectToday',
        label: 'Today'
      },
      'last7Days': {
        action: 'selectDateRange',
        label: 'Last 7 days',
        actionValue: [moment().startOf('day').subtract(6, 'days'), moment().startOf('day')]
      },
      'last30Days': {
        action: 'selectDateRange',
        label: 'Last 30 days',
        actionValue: [moment().startOf('day').subtract(29, 'days'), moment().startOf('day')]
      },
      'lastYear': {
        action: 'selectDateRange',
        label: 'Last year',
        actionValue: [moment().startOf('day').subtract(1, 'year').add(1, 'day'), moment().startOf('day')]
      },
      'last3Months': {
        action: 'selectDateRange',
        label: 'Last 3 months',
        actionValue: [moment().startOf('day').subtract(3, 'months').add(1, 'day'), moment().startOf('day')]
      },
      'last6Months': {
        action: 'selectDateRange',
        label: 'Last 6 months',
        actionValue: [moment().startOf('day').subtract(6, 'months').add(1, 'day'), moment().startOf('day')]
      },
      'thisWeek': {
        action: 'selectDateRange',
        label: 'This week',
        actionValue: [moment().startOf('isoweek'), moment().startOf('day')]
      },
      'thisMonth': {
        action: 'selectDateRange',
        label: 'This month',
        actionValue: [moment().startOf('month'), moment().startOf('day')]
      }
    },

    /**
     * The default options for date pickers.
     * You can overwrite this if you want different default options.
     *
     * @property _defaultDateOptions
     * @type {Array}
     * @private
     */
    _defaultDateOptions: _ember['default'].A(['clear', 'today']),

    /**
     * The default options for date range pickers.
     * you can overwrite this if you want different default options.
     *
     * @property _defaultDateRangeOptions
     * @type {Array}
     * @private
     */
    _defaultDateRangeOptions: _ember['default'].A(['clear', 'today', 'last7Days', 'last30Days', 'last3Months']),

    // PROPERTIES END ----------------------------------------

    // HOOKS BEGIN ----------------------------------------

    didReceiveAttrs: function didReceiveAttrs() {
      this._super.apply(this, arguments);
      this._setupValue();
    },

    willDestroyElement: function willDestroyElement() {
      this._destroyOutsideListener();
      this._super.apply(this, arguments);
    },

    // HOOKS END ----------------------------------------

    // METHODS BEGIN ----------------------------------------

    /**
     * Setup the value.
     * This is called on didReceiveAttrs and transforms the given value into an array which can be used by this component.
     *
     * @method _setupValue
     * @private
     */
    _setupValue: function _setupValue() {
      var val = get(this, 'value');
      var isRange = get(this, 'range');

      if (val) {
        if (_ember['default'].typeOf(val) !== 'array') {
          val = _ember['default'].A([val]);
        }
      } else {
        val = _ember['default'].A();
      }

      set(this, '_dates', val);

      if (val.length > 0) {
        var month = val[0] ? val[0].clone().startOf('month') : moment().startOf('month');
        set(this, 'currentMonth', month);
      } else {
        var month = moment().startOf('month');
        set(this, 'currentMonth', month);
      }

      if (val.length === 1 && isRange) {
        set(this, 'isToStep', true);
        val.pushObject(null);
      } else if (val.length === 0 && isRange) {
        val.pushObjects([null, null]);
      }
    },

    /**
     * Actually send the action.
     *
     * @method _sendAction
     * @private
     */
    _sendAction: function _sendAction() {
      var action = get(this, 'attrs.action');
      var vals = get(this, '_dates');
      var isRange = get(this, 'range');

      if (action) {
        action(isRange ? vals : vals[0] || null);
      }
    },

    /**
     * Open the date picker.
     *
     * @method _open
     * @private
     */
    _open: function _open() {
      set(this, 'isOpen', true);
      this._setupOutsideListener();

      var $el = this.$();

      var windowWidth = _ember['default'].$(window).width();
      var elLeftOffset = $el.offset().left;
      var elOffset = elLeftOffset + get(this, 'calendarWidth');

      if (elOffset > windowWidth) {
        var translate = elOffset - windowWidth + 10;
        var style = new _ember['default'].Handlebars.SafeString('transform: translate(-' + translate + 'px, 0)');
        set(this, 'translateX', style);
      } else {
        set(this, 'translateX', null);
      }
    },

    /**
     * Close the date picker.
     *
     * @method _close
     * @private
     */
    _close: function _close() {
      set(this, 'isOpen', false);
      set(this, 'isToStep', false);

      var action = get(this, 'attrs.closeAction');
      var vals = get(this, '_dates');
      var isRange = get(this, 'range');

      if (action) {
        action(isRange ? vals : vals[0] || null);
      }

      this._destroyOutsideListener();
    },

    /**
     * Set a single date value.
     * It will also close the date picker.
     *
     * @method _setSingleDate
     * @param {Date[]} date The selected date in an array
     * @returns {Date[]}
     * @private
     */
    _setSingleDate: function _setSingleDate(date) {
      var vals = _ember['default'].A([date]);
      set(this, '_dates', vals);
      this._close();
      return vals;
    },

    /**
     * Set the from date to the selected date.
     * It might also switch the to-date with the from-date if the to-date is before the from-date.
     *
     * @method _setFromDate
     * @param date
     * @private
     */
    _setFromDate: function _setFromDate(date) {
      var dates = get(this, '_dates');

      var _dates = _slicedToArray(dates, 2);

      var dateTo = _dates[1];

      var vals = undefined;

      if (dateTo && date.valueOf() > dateTo.valueOf()) {
        vals = _ember['default'].A([date, null]);
      } else {
        vals = _ember['default'].A([date, dateTo || null]);
      }

      set(this, '_dates', vals);
    },

    /**
     * Set the to date to the selected date.
     * It might also switch the to-date with the from-date if the to-date is before the from-date.
     *
     * @method _setToDate
     * @param date
     * @private
     */
    _setToDate: function _setToDate(date) {
      var dates = get(this, '_dates');

      var _dates2 = _slicedToArray(dates, 1);

      var dateFrom = _dates2[0];

      var vals = undefined;

      if (date) {
        date = date.endOf('day');
      }

      if (date && dateFrom && date.valueOf() < dateFrom.valueOf()) {
        vals = _ember['default'].A([date, dateFrom]);
      } else {
        vals = _ember['default'].A([dateFrom, date]);
      }

      set(this, '_dates', vals);
    },

    /**
     * Set date range values.
     * It will also close the date picker if it is the to-date.
     *
     * @method _setDateRange
     * @param {Date[]} date The selected dates in an array
     * @returns {Date[]}
     * @private
     */
    _setDateRange: function _setDateRange(date) {
      var isToStep = get(this, 'isToStep');

      if (!isToStep) {
        this._setFromDate(date);
        this._moveToToStep();
      } else {
        this._setToDate(date);
        this._close();
      }
    },

    /**
     * Move to the from step.
     * This will set the current month to the month of the from-step (if a from-date is set)
     *
     * @method _moveToFromStep
     * @private
     */
    _moveToFromStep: function _moveToFromStep() {
      var _ref = get(this, '_dates') || _ember['default'].A();

      var _ref2 = _slicedToArray(_ref, 1);

      var month = _ref2[0];

      if (month) {
        set(this, 'currentMonth', month.clone().startOf('month'));
      }
      set(this, 'isToStep', false);
    },

    /**
     * Move to the to step.
     * This will set the current month to the month of the to-step (if a to-date is set)
     *
     * @method _moveToToStep
     * @private
     */
    _moveToToStep: function _moveToToStep() {
      var _ref3 = get(this, '_dates') || _ember['default'].A();

      var _ref32 = _slicedToArray(_ref3, 2);

      var month = _ref32[1];

      if (month) {
        set(this, 'currentMonth', month.clone().startOf('month'));
      }
      set(this, 'isToStep', true);
    },

    /**
     * Move to the from date and open the date picker.
     *
     * @method _openFromDate
     * @private
     */
    _openFromDate: function _openFromDate() {
      this._moveToFromStep();
      this._open();
    },

    /**
     * Move to the to step and open the date picker.
     *
     * @method _openToDate
     * @private
     */
    _openToDate: function _openToDate() {
      this._moveToToStep();
      this._open();
    },

    /**
     * Setup an event listener on the body to auto-close the date-picker if the user clicks outside.
     *
     * @method _setupOutsideListener
     * @private
     */
    _setupOutsideListener: function _setupOutsideListener() {
      var _this = this;

      var $element = this.$();

      _ember['default'].$('body').on('click.' + this.elementId, function (e) {
        if (_this.get('isDestroyed')) {
          return;
        }
        var $target = _ember['default'].$(e.target);
        if (!$target.hasClass('date-picker__day') && !$target.closest($element).length) {
          _this._close();
        }
      });
    },

    /**
     * Tear down the event listeners on the body.
     *
     * @method _destroyOutsideListener
     * @private
     */
    _destroyOutsideListener: function _destroyOutsideListener() {
      _ember['default'].$('body').off('click.' + this.elementId);
    },

    // METHODS END ----------------------------------------

    // ACTIONS BEGIN ----------------------------------------

    actions: {

      clearDate: function clearDate() {
        set(this, '_dates', _ember['default'].A());
        set(this, 'isToStep', false);
        this._sendAction();
        this._close();
      },

      selectToday: function selectToday() {
        var today = moment().startOf('day');
        if (get(this, 'range')) {
          set(this, '_dates', _ember['default'].A([today, today]));
        } else {
          set(this, '_dates', _ember['default'].A([today]));
        }

        this._sendAction();
        this._close();
      },

      toggleOpen: function toggleOpen() {
        var isOpen = get(this, 'isOpen');
        var isRange = get(this, 'range');
        var isToStep = get(this, 'isToStep');

        if (!isRange) {
          if (isOpen) {
            this._close();
          } else {
            this._openFromDate();
          }
          return;
        }

        if (isOpen) {
          // If it is a range picker, either close it or switch to isToStep=false
          if (isToStep) {
            this._moveToFromStep();
          } else {
            this._close();
          }
        } else {
          this._openFromDate();
        }
      },

      toggleOpenTo: function toggleOpenTo() {
        var isOpen = get(this, 'isOpen');
        var isToStep = get(this, 'isToStep');

        if (isOpen) {
          if (!isToStep) {
            this._moveToToStep();
          } else {
            this._close();
          }
        } else {
          this._openToDate();
        }
      },

      gotoNextMonth: function gotoNextMonth() {
        var month = get(this, 'currentMonth');
        set(this, 'currentMonth', month.clone().add(1, 'month'));
      },

      gotoPreviousMonth: function gotoPreviousMonth() {
        var month = get(this, 'currentMonth');
        set(this, 'currentMonth', month.clone().subtract(1, 'month'));
      },

      selectDate: function selectDate(date) {
        var isRange = get(this, 'range');

        if (!isRange) {
          this._setSingleDate(date);
        } else {
          this._setDateRange(date);
        }

        this._sendAction();
      },

      selectDateRange: function selectDateRange(dates) {
        set(this, '_dates', _ember['default'].A(dates));

        this._sendAction();
        this._close();
      }
    }

    // ACTIONS END ----------------------------------------
  });
});