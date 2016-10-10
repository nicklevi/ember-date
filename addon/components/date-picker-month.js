import Ember from 'ember';
import layout from '../templates/components/date-picker-month';

const { get, set, computed, getProperties } = Ember;

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
export default Ember.Component.extend({
  layout,
  classNames: ['date-picker__calendar__outer'],

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
  currentMonth: computed('month', function() {
    let date = get(this, 'month');
    let now  = new Date();
    if(date)
    {
      return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    }
    //getFullYear 2016;
    //getMonth 0 - 11
    //getDate 1 - 31

    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }),

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
  _daysInMonth: computed('currentMonth', function() {
    let currentMonth = new Date(get(this, 'currentMonth').getTime());

    let daysInMonth = (new Date(currentMonth.getFullYear(), 
                                currentMonth.getMonth() + 1, 
                                0))
                      .getDate();

    let days = Ember.A();

    // start with days from previous month to fill up first week
    let firstWeekday = currentMonth.getDay();
    //for (let i = firstWeekday; i > 1; i--) {
    for (let i = firstWeekday; i > 0; i--) {
      days.push(null);
    }

    var fisrtDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    let oneDay = (1000*60*60*24);
    
    let day = new Date(fisrtDayOfMonth.getTime());
    // create one day object for every day in the month
    for (let i = 0; i < daysInMonth; i++) 
    {  
      let dayObject = {
        date: day,
        dateString: [day.getFullYear(), this.pad(day.getMonth() + 1), this.pad(day.getDate())].join('/'),
        year: day.getFullYear(),
        month: this.pad(day.getMonth() + 1),
        day: this.pad(day.getDate()),
        weekday: day.getDay() + 1
      };
      days.push(dayObject);
      //increment day by one
      day = new Date(day.getTime() + oneDay);
    }

    let lastDayOfMonth = (new Date(currentMonth.getFullYear(), 
                                currentMonth.getMonth() + 1, 
                                0));
                      
    // end with days from next month to fill up last week
    let lastWeekday = lastDayOfMonth.getDay();
    //for (let i = 1; i <= (7 - lastWeekday); i++) {
    for (let i = 0; i <  (6 - lastWeekday); i++) {
      days.push(null);
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
  daysInMonth: computed('_daysInMonth', '_minDate', '_maxDate', 'selectedDates.[]', function() {
    let days = get(this, '_daysInMonth');

    days.forEach((day) => {
      if (!day) {
        return;
      }
      set(day, 'disabled', this._dayIsDisabled(day.date));
      set(day, 'inRange', this._dayIsInRange(day.date));
      set(day, 'isSelected', this._dayIsSelected(day.date));
      set(day, 'isToday', this._dayIsToday(day.date));
      set(day, 'classes', this.datePickerDayClasses(day));
    });

    return days;
  }),


  datePickerDayClasses(day) {
    let baseClass       = 'date-picker__day';
    let isTodayClass    = day.isToday         ? ` ${baseClass}--today`    : '';
    let isSelectedClass = day.isSelected      ? ` ${baseClass}--selected` : '';
    let isDisabledClass = day.isDisabled      ? ` ${baseClass}--disabled` : '';
    let isInRangeClass  = day.isInRange       ? ` ${baseClass}--in-range` : '';

    return `${baseClass}${isTodayClass}${isSelectedClass}${isDisabledClass}${isInRangeClass}`;
  },
  /**
   * The localized weekdays, starting with *monday* Sunday.
   *
   * @property weekdays
   * @type {String[]}
   * @readOnly
   * @private
   */
  weekdays: computed(function() {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }),

  /**
   * The current day.
   *
   * @property today
   * @type {Date}
   * @readOnly
   * @private
   */
  today: computed(function() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }),

  // PROPERTIES END ----------------------------------------

  // HOOKS BEGIN ----------------------------------------

  didReceiveAttrs() {
    let minDate = get(this, 'minDate');
    let maxDate = get(this, 'maxDate');

    set(this, '_minDate', minDate ? new Date(minDate+' 00:00:00') : null);
    set(this, '_maxDate', maxDate ? new Date(maxDate+' 00:00:00') : null);
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
  _dayIsDisabled(day) {
    let {
      _minDate,
      _maxDate
    } = getProperties(this, '_minDate', '_maxDate');

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
  _dayIsInRange(day) {
    let selectedDates = get(this, 'selectedDates');

    if (!selectedDates || !selectedDates.length || selectedDates.length < 2) {
      return false;
    }

    let selectedDateVal   = selectedDates[0].getTime();
    let selectedUntilVal  = selectedDates[1].getTime();
    let dayVal            = day.getTime();

    if (selectedDateVal > selectedUntilVal) {
      return dayVal > selectedUntilVal && dayVal < selectedDateVal;
    } else {
      return dayVal < selectedUntilVal && dayVal > selectedDateVal;
    }
  },

  _dayIsToday(date) {
    let today = get(this, 'today');
    if(date.getTime() === today.getTime())
      return true;
    return false;
  },

  _dayIsSelected(date) {
    let selectedDates = get(this, 'selectedDates');
    for(var i = 0; i < selectedDates.length; i++)
    {
      if(selectedDates[i].getTime() == date.getTime())
        return true;
    }
    return false;
  },

  pad(val) {
    if((val + '').length < 2)
      return '0' + val;
    return '' + val;
  },

  actions: {
    selectDate(date) {
      let action = get(this, 'attrs.selectDate');
      if (action) {
        action(date);
      }
    }
  }
});
