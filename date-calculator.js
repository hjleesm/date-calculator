(function() {
    var DIVISORS = {
        days: 1000 * 60 * 60 * 24
    };

    var checkDate = function(date) {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            throw new TypeError('Expected a valid Date');
        }
    };

    var checkNumber = function(value, name, integer) {
        if (typeof value !== 'number' || !isFinite(value) || (integer && Math.floor(value) !== value)) {
            throw new TypeError(name + ' must be a finite' + (integer ? ' integer' : ' number'));
        }
    };

    var calendarDay = function(date) {
        var utcDate = new Date(0);
        utcDate.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        utcDate.setUTCHours(0, 0, 0, 0);
        return utcDate.getTime() / DIVISORS.days;
    };

    var shiftDays = function(date, amount) {
        var result = new Date(date.getTime());
        var wholeDays = amount < 0 ? Math.ceil(amount) : Math.floor(amount);
        result.setDate(result.getDate() + wholeDays);
        result.setTime(result.getTime() + (amount - wholeDays) * DIVISORS.days);
        return result;
    };

    var shiftMonths = function(date, amount, overflow) {
        var result = new Date(date.getTime());
        var day = result.getDate();
        result.setDate(1);
        result.setMonth(result.getMonth() + amount);

        var lastDay = new Date(0);
        lastDay.setFullYear(result.getFullYear(), result.getMonth() + 1, 0);
        if (day > lastDay.getDate() && overflow === 'reject') {
            throw new RangeError('Target month does not contain day ' + day);
        }
        result.setDate(Math.min(day, lastDay.getDate()));
        return result;
    };

    var shiftDuration = function(date, duration, direction, options) {
        if (!duration || typeof duration !== 'object' || duration instanceof Date || Array.isArray(duration)) {
            throw new TypeError('Expected a duration object');
        }
        var overflow = options && options.overflow !== undefined ? options.overflow : 'constrain';
        if (overflow !== 'constrain' && overflow !== 'reject') {
            throw new RangeError('overflow must be constrain or reject');
        }
        var units = ['years', 'months', 'weeks', 'days'];
        var values = {};
        for (var key in duration) {
            if (Object.prototype.hasOwnProperty.call(duration, key) && units.indexOf(key) === -1) {
                throw new RangeError('Unknown duration unit: ' + key);
            }
        }
        for (var i = 0; i < units.length; i++) {
            var unit = units[i];
            values[unit] = duration[unit] === undefined ? 0 : duration[unit];
            checkNumber(values[unit], unit, unit !== 'days');
        }
        var result = new Date(date.getTime());
        if (values.years) result = shiftMonths(result, direction * values.years * 12, overflow);
        if (values.months) result = shiftMonths(result, direction * values.months, overflow);
        return shiftDays(result, direction * (values.weeks * 7 + values.days));
    };

    var weekStartDay = function(date, weekStartsOn) {
        return calendarDay(date) - (date.getDay() - weekStartsOn + 7) % 7;
    };

    var Constructor = function(date_) {
        checkDate(date_);
        this.date = new Date(date_.getTime());
        this.date.setHours(0, 0, 0, 0);
    };

    Constructor.prototype.add = function(operand, options) {
        if (typeof operand === 'number') {
            checkNumber(operand, 'days', false);
            this.date = shiftDays(this.date, operand);
        } else {
            this.date = shiftDuration(this.date, operand, 1, options);
        }
        return this;
    };

    Constructor.prototype.sub = function(operand, options) {
        if (operand instanceof Date) {
            return {
                days: this.diff(operand, { unit: 'days' }),
                weeks: this.diff(operand, { unit: 'weeks' }),
                months: this.diff(operand, { unit: 'months' }),
                years: this.diff(operand, { unit: 'years' })
            };
        } else if (typeof operand === 'number') {
            checkNumber(operand, 'days', false);
            return shiftDays(this.date, -operand);
        }
        return shiftDuration(this.date, operand, -1, options);
    };

    Constructor.prototype.diff = function(other, options) {
        checkDate(other);
        options = options || {};
        var unit = options.unit || 'days';
        var mode = options.mode || 'calendar';
        var weekStartsOn = options.weekStartsOn === undefined ? 0 : options.weekStartsOn;
        checkNumber(weekStartsOn, 'weekStartsOn', true);
        if (weekStartsOn < 0 || weekStartsOn > 6) throw new RangeError('weekStartsOn must be between 0 and 6');
        if (mode !== 'calendar' && mode !== 'elapsed') throw new RangeError('Unknown difference mode: ' + mode);
        if (unit !== 'days' && unit !== 'weeks' && unit !== 'months' && unit !== 'years') {
            throw new RangeError('Unknown difference unit: ' + unit);
        }
        if (mode === 'elapsed') {
            if (unit !== 'days' && unit !== 'weeks') {
                throw new RangeError('Elapsed difference supports days and weeks only');
            }
            return (this.date.getTime() - other.getTime()) / DIVISORS.days / (unit === 'weeks' ? 7 : 1);
        }
        if (unit === 'days') return calendarDay(this.date) - calendarDay(other);
        if (unit === 'weeks') return (weekStartDay(this.date, weekStartsOn) - weekStartDay(other, weekStartsOn)) / 7;
        if (unit === 'months') {
            return (this.date.getFullYear() - other.getFullYear()) * 12 + this.date.getMonth() - other.getMonth();
        }
        return this.date.getFullYear() - other.getFullYear();
    };

    Constructor.prototype.addBusinessDays = function(amount, options) {
        checkNumber(amount, 'business days', true);
        options = options || {};
        var weekend = options.weekend === undefined ? [0, 6] : options.weekend;
        var holidays = options.holidays === undefined ? [] : options.holidays;
        if (!Array.isArray(weekend) || !Array.isArray(holidays)) {
            throw new TypeError('weekend and holidays must be arrays');
        }
        for (var i = 0; i < weekend.length; i++) {
            checkNumber(weekend[i], 'weekend day', true);
            if (weekend[i] < 0 || weekend[i] > 6) throw new RangeError('weekend day must be between 0 and 6');
        }
        if ([0, 1, 2, 3, 4, 5, 6].every(function(day) { return weekend.indexOf(day) !== -1; })) {
            throw new RangeError('At least one business day is required');
        }
        var holidayDays = [];
        for (i = 0; i < holidays.length; i++) {
            checkDate(holidays[i]);
            holidayDays.push(calendarDay(holidays[i]));
        }
        var result = new Date(this.date.getTime());
        var remaining = Math.abs(amount);
        var direction = amount < 0 ? -1 : 1;
        while (remaining > 0) {
            result = shiftDays(result, direction);
            if (weekend.indexOf(result.getDay()) === -1 && holidayDays.indexOf(calendarDay(result)) === -1) {
                remaining--;
            }
        }
        this.date = result;
        return this;
    };

    if (typeof define == 'function' && define.amd) {
        define(function(){
            return Constructor;
        });
    } else if (typeof module !== 'undefined') {
        module.exports = Constructor;
    } else {
        window.DateCalculator = Constructor;
    }
})();
