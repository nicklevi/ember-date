define('ember-date/components/date-picker-month', ['exports', 'ember', '../templates/components/date-picker-month-table'], function (exports, _ember, _templatesComponentsDatePickerMonthTable) {
  'use strict';

  var get = _ember['default'].get;
  var set = _ember['default'].set;
  var computed = _ember['default'].computed;
  var getProperties = _ember['default'].getProperties;

  /**
   * A single month view.
   * This is used internally by the date-picker.
   * It is stand alone and could also be used without it.
   *
   * @namespace EmberDateComponents
   * @class DatePickerMonth
   * @extends Ember.Component
   * @public
   */
  exports['default'] = _ember['default'].Component.extend({
    layout: _templatesComponentsDatePickerMonthTable['default'],
    classNames: ['calendar'],

    // ATTRIBUTES BEGIN ----------------------------------------

    /**
     * The selected dates for the date picker.
     * This has to be an array with 0-2 elements. If it has 2 elements, it will show the range between the two.
     *
     * @attributes selectedDates
     * @type {Date[]}
     * @optional
     * @public
     */
    selectedDates: [],

    /**
     * The month that should be shown.
     * If this is not set, it will default to the current month.
     *
     * @attribute month
     * @type {Date}
     * @optional
     * @public
     */
    month: null,

    /**
     * An optional minimum date.
     * No dates before this date will be selectable.
     *
     * @attribute minDate
     * @type {Date}
     * @optional
     * @public
     */
    minDate: null,

    /**
     * An optional maximum date.
     * No dates after this date will be selectable.
     *
     * @attribute maxDate
     * @type {Date}
     * @optional
     * @public
     */
    maxDate: null,

    /**
     * If weekdays (Mo, Tu, ...) should be shown in the calendar.
     *
     * @attribute showWeekdays
     * @type {Boolean}
     * @default true
     * @public
     */
    showWeekdays: true,

    /**
     * This action will receive the selected date as parameter.
     * It is called when a date is clicked.
     *
     * @event selectDate
     * @param {Date} date The selected date
     * @public
     */
    selectDate: null,

    // ATTRIBUTES END ----------------------------------------

    // PROPERTIES BEGIN ----------------------------------------

    /**
     * Internally, the minDate is copied, set to startOf('day') and saved here to save unnecessary processing.
     *
     * @property _minDate
     * @type {Date}
     * @private
     */
    _minDate: null,

    /**
     * Internally, the maxDate is copied, set to startOf('day') and saved here to save unnecessary processing.
     *
     * @property _maxDate
     * @type {Date}
     * @private
     */
    _maxDate: null,

    /**
     * This takes the given month and converts it to the beginning of the Date object.
     * If no month is given, it will default to the current month.
     *
     * @property currentMonth
     * @type {Date}
     * @private
     */
    currentMonth: computed('month', function () {
      var date = get(this, 'month');
      var now = new Date();
      if (date) {
        return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
      }
      //getFullYear 2016;
      //getMonth 0 - 11
      //getDate 1 - 31

      return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }),

    _dayObject: function _dayObject(date) {
      return {
        date: date,
        dateString: [date.getFullYear(), this.pad(date.getMonth() + 1), this.pad(date.getDate())].join('/'),
        year: date.getFullYear(),
        month: this.pad(date.getMonth() + 1),
        day: this.pad(date.getDate()),
        weekday: date.getDay() + 1
      };
    },

    /**
     * The currently displayed days in the calendar.
     * This will contain all the days of the current month,
     * prepended with days to fill a started week in the beginning of the month,
     * appended with days to fill a started week in the end of the month.
     * This means that the array length will always be divisible by 7.
     * The generated objects contain the reference to the used date, as well as various other pieces of information:
     *
     * ```js
     * {
     *    date: day,
     *    dateString: day.format('YYYY-MM-DD'),
     *    year: day.year(),
     *    month: day.month(),
     *    day: day.date(),
     *    weekday: day.isoWeekday(),
     *    disabled: this._dayIsDisabled(day),
     *    notInCurrentMonth: true
     * }
     * ```
     *
     * @property _daysInMonth
     * @type {Object[]}
     * @readOnly
     * @private
     */
    _daysInMonth: computed('currentMonth', function () {
      var currentMonth = new Date(get(this, 'currentMonth').getTime());

      var daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

      var days = _ember['default'].A();

      var oneDay = 1000 * 60 * 60 * 24;

      var fisrtDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

      var lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      // start with days from previous month to fill up first week
      var firstWeekday = fisrtDayOfMonth.getDay();
      //for (let i = firstWeekday; i > 1; i--) {
      for (var i = firstWeekday; i > 0; i--) {
        var day = new Date(fisrtDayOfMonth.getTime() - i * oneDay);
        days.push(this._dayObject(day));
        //days.push(null);
      }

      // create one day object for every day in current month
      for (var i = 0; i < daysInMonth; i++) {
        var day = new Date(fisrtDayOfMonth.getTime() + i * oneDay);
        days.push(this._dayObject(day));
      }

      // end with days from next month to fill up last week
      var lastWeekday = lastDayOfMonth.getDay();
      //for (let i = 1; i <= (7 - lastWeekday); i++) {
      for (var i = 1; i <= 6 - lastWeekday; i++) {
        var day = new Date(lastDayOfMonth.getTime() + i * oneDay);
        days.push(this._dayObject(day));
        //days.push(null);
      }

      return days;
    }),

    /**
     * This takes the generated _daysInMonth and parses the days.
     * It will set disabled and inRange accordingly for all days.
     * Note that for performance reasons, this will mutate the original array instead of creating a new one.
     *
     * @property daysInMonth
     * @type {Object[]}
     * @readOnly
     * @private
     */
    daysInMonth: computed('_daysInMonth', '_minDate', '_maxDate', 'selectedDates.[]', function () {
      var _this = this;

      var days = get(this, '_daysInMonth');

      days.forEach(function (day) {
        if (!day) {
          return;
        }
        set(day, 'disabled', _this._dayIsDisabled(day.date));
        set(day, 'inRange', _this._dayIsInRange(day.date));
        set(day, 'isSelected', _this._dayIsSelected(day.date));
        set(day, 'isToday', _this._dayIsToday(day.date));
        set(day, 'classes', _this.datePickerDayClasses(day));
      });

      return days;
    }),

    rowsInMonth: computed('daysInMonth', function () {
      var days = get(this, 'daysInMonth');
      var rows = [];

      var rowsCount = Math.ceil(days.length / 7);

      for (var i = 0; i < rowsCount; i++) {
        var start = i * 7;
        var end = start + 7;
        rows.push(days.slice(start, end));
      }

      return rows;
    }),

    datePickerDayClasses: function datePickerDayClasses(day) {
      var baseClass = 'day';
      var isTodayClass = day.isToday ? ' today' : '';
      var isSelectedClass = day.isSelected ? ' selected' : '';
      var isDisabledClass = day.isDisabled ? ' disabled' : '';
      var isInRangeClass = day.isInRange ? ' inrange' : '';

      return '' + baseClass + isTodayClass + isSelectedClass + isDisabledClass + isInRangeClass;
    },

    weekStartDay: 0,
    weekdays: [],
    months: [],

    /**
     * The current day.
     *
     * @property today
     * @type {Date}
     * @readOnly
     * @private
     */
    today: computed(function () {
      var now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }),

    // PROPERTIES END ----------------------------------------

    // HOOKS BEGIN ----------------------------------------

    didReceiveAttrs: function didReceiveAttrs() {
      var minDate = get(this, 'minDate');
      var maxDate = get(this, 'maxDate');

      set(this, '_minDate', minDate ? new Date(minDate + ' 00:00:00') : null);
      set(this, '_maxDate', maxDate ? new Date(maxDate + ' 00:00:00') : null);
    },

    // HOOKS END ----------------------------------------

    // METHODS BEGIN ----------------------------------------

    /**
     * Check if a date is disabled.
     * This checks if the date is inside of minDate/maxDate.
     *
     * @method _dayIsDisabled
     * @param {Date} day The date to check
     * @return {Boolean}
     * @private
     */
    _dayIsDisabled: function _dayIsDisabled(day) {
      var _getProperties = getProperties(this, '_minDate', '_maxDate');

      var _minDate = _getProperties._minDate;
      var _maxDate = _getProperties._maxDate;

      if (_minDate && _minDate.getTime() > day.getTime()) {
        return true;
      }

      return _maxDate && _maxDate.getTime() < day.getTime();
    },

    /**
     * Check if a day is in the range of the selectedDates.
     * If selectedDates does not consist of two dates, this will always return false.
     *
     * @method _dayIsInRange
     * @param {Object} day
     * @return {Boolean}
     * @private
     */
    _dayIsInRange: function _dayIsInRange(day) {
      var selectedDates = get(this, 'selectedDates');

      if (!selectedDates || !selectedDates.length || selectedDates.length < 2) {
        return false;
      }

      var selectedDateVal = selectedDates[0].getTime();
      var selectedUntilVal = selectedDates[1].getTime();
      var dayVal = day.getTime();

      if (selectedDateVal > selectedUntilVal) {
        return dayVal > selectedUntilVal && dayVal < selectedDateVal;
      } else {
        return dayVal < selectedUntilVal && dayVal > selectedDateVal;
      }
    },

    _dayIsToday: function _dayIsToday(date) {
      var today = get(this, 'today');
      if (date.getTime() === today.getTime()) return true;
      return false;
    },

    _dayIsSelected: function _dayIsSelected(date) {
      var selectedDates = get(this, 'selectedDates');
      for (var i = 0; i < selectedDates.length; i++) {
        if (selectedDates[i].getTime() == date.getTime()) return true;
      }
      return false;
    },

    pad: function pad(val) {
      if ((val + '').length < 2) return '0' + val;
      return '' + val;
    },

    actions: {
      selectDate: function selectDate(date) {
        var action = get(this, 'attrs.selectDate');
        if (action) {
          action(date);
        }
      }
    }
  });
});