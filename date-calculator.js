(function() {
    var DIVISORS = {
        days: 1000 * 60 * 60 * 24
    };
    
    var date;
    
    var Constructor = function(date_, unit_) {
        date = new Date(date_.getFullYear(), date_.getMonth(), date_.getDate());
        if (unit_)
            unit = unit_;
    };

    var subDays = function(operand1, operand2) {
        if (operand2 === undefined) {
            operand2 = operand1;
            operand1 = date;
        }

        if (operand2 instanceof Date) {
            return Math.ceil(operand1.getTime() / DIVISORS.days) - Math.ceil(operand2.getTime() / DIVISORS.days);
        } else if (typeof operand2 === 'number') {
            return new Date(operand1.getTime() - (operand2 * DIVISORS.days));
        }
    };

    var subWeeks = function(operand) {
        var date1 = subDays(date, parseInt(date.getDay())),
            date2 = subDays(operand, parseInt(operand.getDay()));

        return subDays(date1, date2) / 7;
    }

    Constructor.prototype.add = function(operand) {
        if (operand instanceof Date) {
            date = new Date(date.getTime() + operand.getTime());
        } else if (typeof operand === 'number') {
            date = new Date(date.getTime() + (operand * DIVISORS.days));
        }
        
        return this;
    };

    Constructor.prototype.sub = function(operand) {
        if (operand instanceof Date) {
            operand = new Date(operand.getFullYear(), operand.getMonth(), operand.getDate());

            return {
                days: subDays(operand),
                weeks: subWeeks(operand),
                months: ((date.getFullYear() - 1) * 12 + date.getMonth()) -  ((operand.getFullYear() - 1) * 12 + operand.getMonth()),
                years: date.getFullYear() - operand.getFullYear()
            };
        } else if (typeof operand === 'number') {
            return subDays(date, operand);
        }
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