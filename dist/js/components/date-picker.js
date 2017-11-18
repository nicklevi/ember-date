define('ember-date/components/date-picker', ['exports', 'ember', '../templates/components/date-picker'], function (exports, _ember, _templatesComponentsDatePicker) {
  'use strict';

  var get = _ember['default'].get;
  var set = _ember['default'].set;
  var computed = _ember['default'].computed;

  var ranges = {

    last7Days: function last7Days() {
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0);
      var oneDay = 1000 * 60 * 60 * 24;
      var end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0);
      var start = new Date(today.getTime() - 6 * oneDay);

      return [start, end];
    },

    last30Days: function last30Days() {
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0);
      var oneDay = 1000 * 60 * 60 * 24;
      var end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0);
      var start = new Date(today.getTime() - 29 * oneDay);

      return [start, end];
    },

    lastYear: function lastYear() {
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0);
      var oneDay = 1000 * 60 * 60 * 24;

      var tmp = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate(), 0);
      var start = new Date(tmp.getTime() + oneDay);
      var end = new Date(today.getTime());

      return [start, end];
    },

    last3Months: function last3Months() {
      var now = new Date();
      var oneDay = 1000 * 60 * 60 * 24;
      var end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0);

      var month = now.getMonth() - 3;
      var year = now.getFullYear();
      var date = now.getDate();

      year = month < 0 ? year - 1 : year;
      month = month < 0 ? 11 - month : month;

      var tmp = new Date(year, month + 1, 0, 0);
      var daysInMonth = tmp.getDate();
      date = daysInMonth <= date ? daysInMonth - 1 : date;

      var start = new Date(tmp.getTime() + oneDay);

      return [start, end];
    },

    last6Months: function last6Months() {
      var now = new Date();
      var oneDay = 1000 * 60 * 60 * 24;
      var end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0);

      var month = now.getMonth() - 6;
      var year = now.getFullYear();
      var date = now.getDate();

      year = month < 0 ? year - 1 : year;
      month = month < 0 ? 11 - month : month;

      var tmp = new Date(year, month + 1, 0, 0);
      var daysInMonth = tmp.getDate();
      date = daysInMonth <= date ? daysInMonth - 1 : date;

      var start = new Date(tmp.getTime() + oneDay);

      return [start, end];
    },

    thisWeek: function thisWeek() {
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0);

      var oneDay = 1000 * 60 * 60 * 24;

      var weekDay = now.getDay();

      var start = new Date(today.getTime() - weekDay * oneDay);
      var end = new Date(start.getTime() + 6 * oneDay);

      return [start, end];
    },

    thisMonth: function thisMonth() {
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0);

      var lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

      var start = new Date(today.getFullYear(), today.getMonth(), 1);
      var end = new Date(today.getFullYear(), today.getMonth(), lastDayOfMonth);

      return [start, end];
    }

  };
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

    classNames: ['date-picker'],
    classNameBindings: ['isOpen:open'],

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
    buttonClasses: 'date-picker-button',

    buttonFromClasses: computed('buttonClasses', 'buttonFocused', 'range', function () {
      var base = this.get('buttonClasses');
      var focused = this.get('buttonFocused') ? ' focus' : '';
      var range = this.get('range') ? ' range' : '';
      return '' + base + focused + range;
    }),

    buttonToClasses: computed('buttonClasses', 'buttonToFocused', 'range', function () {
      var base = this.get('buttonClasses');
      var focused = this.get('buttonToFocused') ? ' focus' : '';
      var range = this.get('range') ? ' range' : '';
      return '' + base + focused + range;
    }),
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
    titleDateFormat: 'F Y',

    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

    pad: function pad(val) {
      if ((val + '').length < 2) return '0' + val;
      return '' + val;
    },

    formatDate: function formatDate(date, format) {
      var self = this;
      var mapFormat = {
        'y': function y(date) {
          //A two digit representation of a year
          return (date.getFullYear() + '').substring(2, 4);
        },

        'Y': function Y(date) {
          //A full numeric representation of a year, 4 digits
          return date.getFullYear() + '';
        },

        'd': function d(date) {
          //Day of the month, 2 digits with leading zeros
          return self.pad(date.getDate());
        },

        'm': function m(date) {
          //Numeric representation of a month, with leading zeros
          return self.pad(date.getMonth() + 1);
        },

        'F': function F(date) {
          //A full textual representation of a month
          return self.get('months')[date.getMonth()];
        }
      };

      if (!date || isNaN(date.getFullYear())) return null;

      var result = [];
      for (var i = 0; i < format.length; i++) {
        var letter = format[i];
        var formater = mapFormat[letter];
        result.push(formater ? formater(date) : letter);
      }

      return result.join('');
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
      var dateFormat = get(this, 'buttonDateFormat').toString();

      var dateFrom = vals[0];

      if (!isRange) {
        if (!dateFrom) {
          return get(this, 'placeholder');
        }
        return this.formatDate(dateFrom, dateFormat); //dateFrom.format(dateFormat);
      }

      if (!dateFrom) {
        return get(this, 'placeholder');
      }

      return this.formatDate(dateFrom, dateFormat); //dateFrom.format(dateFormat);
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
      var dateFormat = get(this, 'buttonDateFormat');

      var dateTo = vals[1];

      if (!dateTo) {
        return get(this, 'placeholder');
      }

      return this.formatDate(dateTo, dateFormat);
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

      var dateFrom = _get[0];
      var dateTo = _get[1];

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
        actionValue: ranges.last7Days()
      },

      'last30Days': {
        action: 'selectDateRange',
        label: 'Last 30 days',
        actionValue: ranges.last30Days()
      },

      'lastYear': {
        action: 'selectDateRange',
        label: 'Last year',
        actionValue: ranges.lastYear()
      },

      'last3Months': {
        action: 'selectDateRange',
        label: 'Last 3 months',
        actionValue: ranges.last3Months()
      },

      'last6Months': {
        action: 'selectDateRange',
        label: 'Last 6 months',
        actionValue: ranges.last6Months()
      },

      'thisWeek': {
        action: 'selectDateRange',
        label: 'This week',
        actionValue: ranges.thisWeek()
      },

      'thisMonth': {
        action: 'selectDateRange',
        label: 'This month',
        actionValue: ranges.thisMonth()
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

      //normalize values to array
      if (val) {
        if (_ember['default'].typeOf(val) !== 'array') {
          val = _ember['default'].A([val]);
        }
      } else {
        val = _ember['default'].A();
      }

      //convert string Date object
      for (var i = 0; i < val.length; i++) {
        if (typeof val[i] == "string" && val[i].length) {
         var temp = val[i].replace(/-/gi,'/');
          var t = !isNaN(new Date().getFullYear(temp)) ? new Date(temp) : null;
          val[i] = t ? new Date(temp) : null;
        }
      }

      set(this, '_dates', val);

      var now = new Date();

      if (val.length > 0) {
        var tmp = val[0];
        var month = tmp ? new Date(tmp.getFullYear(), tmp.getMonth(), 1, 0) : new Date(now.getFullYear(), now.getMonth(), 1, 0);

        set(this, 'currentMonth', month);
      } else {
        var month = new Date(now.getFullYear(), now.getMonth(), 1, 0);

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
      var value = get(this, 'attrs.value');

      if (value && value.update) {
        value.value = this.formatDate(vals[0], 'Y-m-d');
        value.update(value.value);
      }

      if (action && isRange) {
        action(vals || null);
        return;
      }

      if (action) {
        action(vals[0] || null, this.formatDate(vals[0], 'Y-m-d'));
        return;
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
        var style = 'transform: translate(-' + translate + 'px, 0)';
        set(this, 'translateX', Em.String.htmlSafe(style));
      } else {
        set(this, 'translateX', Em.String.htmlSafe(''));
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
      var dateTo = dates[1];

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
      var dateFrom = dates[0];

      var vals = undefined;

      var oneDay = 1000 * 60 * 60 * 24;

      if (date) {
        var tmp = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0);
        date = new Date(tmp.getTime() + (oneDay - 1));
      }

      if (date && dateFrom && date.getTime() < dateFrom.getTime()) {
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

      var month = _ref[0];

      if (month) {
        var startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        set(this, 'currentMonth', startOfMonth);
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
      var _ref2 = get(this, '_dates') || _ember['default'].A();

      var month = _ref2[1];

      if (month) {
        var startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        set(this, 'currentMonth', startOfMonth);
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
        if (!$target.hasClass('day') && !$target.closest($element).length) {
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
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0);
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

        var nextY = month.getFullYear();
        var nextM = month.getMonth();

        nextY = nextM == 11 ? nextY + 1 : nextY;
        nextM = nextM == 11 ? 0 : nextM + 1;

        set(this, 'currentMonth', new Date(nextY, nextM, 1, 0));
      },

      gotoPreviousMonth: function gotoPreviousMonth() {
        var month = get(this, 'currentMonth');

        var prevY = month.getFullYear();
        var prevM = month.getMonth();

        prevY = prevM == 0 ? prevY - 1 : prevY;
        prevM = prevM == 0 ? 11 : prevM - 1;

        set(this, 'currentMonth', new Date(prevY, prevM, 1, 0));
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