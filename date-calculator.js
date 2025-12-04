(function() {
    var DIVISORS = {
        days: 1000 * 60 * 60 * 24
    };
    
    
    var Constructor = function(date_, unit_) {
        this.date = new Date(date_.getFullYear(), date_.getMonth(), date_.getDate());
        
        if (unit_) {
            this.unit = unit_;
        }
    };

    var subDays = function(operand1, operand2) {
        if (operand2 instanceof Date) {
            return Math.ceil(operand1.getTime() / DIVISORS.days) - Math.ceil(operand2.getTime() / DIVISORS.days);
        } else if (typeof operand2 === 'number') {
            return new Date(operand1.getTime() - (operand2 * DIVISORS.days));
        }
    };

    var subWeeks = function(currentDate, operand) {
        var date1 = subDays(currentDate, parseInt(currentDate.getDay())),
            date2 = subDays(operand, parseInt(operand.getDay()));

        return subDays(date1, date2) / 7;
    }

    Constructor.prototype.add = function(operand) {
        if (operand instanceof Date) {
            this.date = new Date(this.date.getTime() + operand.getTime());
        } else if (typeof operand === 'number') {
            this.date = new Date(this.date.getTime() + (operand * DIVISORS.days));
        }
        
        return this;
    };

    Constructor.prototype.sub = function(operand) {
        if (operand instanceof Date) {
            operand = new Date(operand.getFullYear(), operand.getMonth(), operand.getDate());

            return {
                days: subDays(this.date, operand),
                weeks: subWeeks(this.date, operand),
                months: ((this.date.getFullYear() - 1) * 12 + this.date.getMonth()) -  ((operand.getFullYear() - 1) * 12 + operand.getMonth()),
                years: this.date.getFullYear() - operand.getFullYear()
            };
        } else if (typeof operand === 'number') {
            return subDays(this.date, operand);
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