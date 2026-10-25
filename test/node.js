var assert = require('assert');
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var DateCalculator = require('../date-calculator');

var dateParts = function(date) {
    return [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()];
};

var earlyYear = new Date(0);
earlyYear.setFullYear(5, 0, 2);
assert.strictEqual(new DateCalculator(earlyYear).date.getFullYear(), 5);
assert.throws(function() { new DateCalculator(new Date(NaN)); }, TypeError);

assert.deepStrictEqual(
    new DateCalculator(new Date(2018, 7, 9)).sub(new Date(2018, 7, 3)),
    { days: 6, weeks: 1, months: 0, years: 0 }
);

assert.deepStrictEqual(
    new DateCalculator(new Date(2017, 11, 25)).sub(new Date(2018, 0, 22)),
    { days: -28, weeks: -4, months: -1, years: -1 }
);

var original = new DateCalculator(new Date(2024, 0, 2));
var previousReference = original.date;
original.add(1);
assert.notStrictEqual(original.date, previousReference);
assert.strictEqual(previousReference.getDate(), 2);
assert.strictEqual(original.date.getDate(), 3);

assert.strictEqual(new DateCalculator(new Date(2024, 0, 2)).add(0.5).date.getHours(), 12);
assert.strictEqual(new DateCalculator(new Date(2024, 0, 2)).add(-0.5).date.getHours(), 12);
assert.strictEqual(new DateCalculator(new Date(2024, 0, 2)).sub(0.5).getHours(), 12);
assert.strictEqual(new DateCalculator(new Date(2024, 0, 2)).sub(-0.5).getHours(), 12);

assert.deepStrictEqual(
    dateParts(new DateCalculator(new Date(2024, 0, 31)).add({ months: 1 }).date),
    [2024, 1, 29, 0]
);
assert.deepStrictEqual(
    dateParts(new DateCalculator(new Date(2020, 1, 29)).add({ years: 1, months: 1 }).date),
    [2021, 2, 28, 0]
);
assert.deepStrictEqual(
    dateParts(new DateCalculator(new Date(2024, 2, 31)).sub({ months: 1 })),
    [2024, 1, 29, 0]
);
assert.deepStrictEqual(
    dateParts(new DateCalculator(new Date(2023, 0, 31)).add({ months: 1 }).date),
    [2023, 1, 28, 0]
);
assert.deepStrictEqual(
    dateParts(new DateCalculator(new Date(2024, 1, 29)).add({ years: 1 }).date),
    [2025, 1, 28, 0]
);
assert.deepStrictEqual(
    dateParts(new DateCalculator(new Date(2024, 2, 31)).add({ months: -1, weeks: 1 }).date),
    [2024, 2, 7, 0]
);
var subtractDuration = new DateCalculator(new Date(2024, 2, 31));
assert.deepStrictEqual(dateParts(subtractDuration.sub({ months: 1, days: 2 })), [2024, 1, 27, 0]);
assert.deepStrictEqual(dateParts(subtractDuration.date), [2024, 2, 31, 0]);
var rejectedMonth = new DateCalculator(new Date(2024, 0, 31));
assert.throws(function() { rejectedMonth.add({ months: 1 }, { overflow: 'reject' }); }, RangeError);
assert.strictEqual(rejectedMonth.date.getMonth(), 0);
assert.throws(function() { rejectedMonth.add(new Date(2024, 0, 1)); }, TypeError);
assert.throws(function() { rejectedMonth.add({ months: 0.5 }); }, TypeError);
assert.throws(function() { rejectedMonth.add({ monts: 1 }); }, RangeError);
assert.throws(function() { rejectedMonth.add({ days: Infinity }); }, TypeError);
assert.throws(function() {
    new DateCalculator(new Date(2024, 2, 31)).sub({ months: 1 }, { overflow: 'reject' });
}, RangeError);

var february = new DateCalculator(new Date(2024, 1, 1));
assert.strictEqual(february.diff(new Date(2024, 0, 31)), 1);
assert.strictEqual(february.diff(new Date(2024, 0, 31), { unit: 'months' }), 1);
assert.strictEqual(february.diff(new Date(2024, 0, 31), { unit: 'years' }), 0);
assert.strictEqual(new DateCalculator(new Date(2024, 2, 10)).diff(new Date(2024, 2, 9), { unit: 'weeks' }), 1);
assert.strictEqual(new DateCalculator(new Date(2024, 2, 10)).diff(new Date(2024, 2, 9), { unit: 'weeks', weekStartsOn: 1 }), 0);
assert.strictEqual(new DateCalculator(new Date(2024, 0, 1)).diff(new Date(2023, 11, 31), { unit: 'years' }), 1);
assert.strictEqual(new DateCalculator(new Date(2024, 0, 1)).diff(new Date(2023, 11, 31), { unit: 'weeks' }), 0);
assert.strictEqual(new DateCalculator(new Date(2024, 0, 1)).diff(new Date(2023, 11, 31), { unit: 'weeks', weekStartsOn: 1 }), 1);
assert.strictEqual(new DateCalculator(new Date(2024, 0, 1)).diff(new Date(2024, 0, 1, 18), { mode: 'elapsed' }), -0.75);
assert.throws(function() { february.diff(new Date(2024, 0, 31), { unit: 'months', mode: 'elapsed' }); }, RangeError);
assert.throws(function() { february.diff(new Date(2024, 0, 31), { weekStartsOn: 7 }); }, RangeError);
assert.throws(function() { february.diff(new Date(NaN)); }, TypeError);

assert.deepStrictEqual(
    dateParts(new DateCalculator(new Date(2024, 4, 3)).addBusinessDays(1, {
        holidays: [new Date(2024, 4, 6)]
    }).date),
    [2024, 4, 7, 0]
);
assert.deepStrictEqual(
    dateParts(new DateCalculator(new Date(2024, 4, 6)).addBusinessDays(-1).date),
    [2024, 4, 3, 0]
);
assert.deepStrictEqual(
    dateParts(new DateCalculator(new Date(2024, 4, 6)).addBusinessDays(-1, {
        holidays: [new Date(2024, 4, 3, 18)]
    }).date),
    [2024, 4, 2, 0]
);
assert.deepStrictEqual(
    dateParts(new DateCalculator(new Date(2024, 4, 3)).addBusinessDays(2, { weekend: [5, 6] }).date),
    [2024, 4, 6, 0]
);
assert.deepStrictEqual(
    dateParts(new DateCalculator(new Date(2024, 4, 4)).addBusinessDays(0).date),
    [2024, 4, 4, 0]
);
assert.throws(function() {
    new DateCalculator(new Date(2024, 4, 3)).addBusinessDays(1, { weekend: [0, 1, 2, 3, 4, 5, 6] });
}, RangeError);
assert.throws(function() {
    new DateCalculator(new Date(2024, 4, 3)).addBusinessDays(0.5);
}, TypeError);
assert.throws(function() {
    new DateCalculator(new Date(2024, 4, 3)).addBusinessDays(1, { holidays: [new Date(NaN)] });
}, TypeError);

var previousTimeZone = process.env.TZ;
process.env.TZ = 'America/New_York';

try {
    var spring = new DateCalculator(new Date(2024, 2, 10));
    spring.add(1);
    assert.deepStrictEqual(
        [spring.date.getFullYear(), spring.date.getMonth(), spring.date.getDate(), spring.date.getHours()],
        [2024, 2, 11, 0]
    );

    var fall = new DateCalculator(new Date(2024, 10, 3));
    fall.add(1);
    assert.deepStrictEqual(
        [fall.date.getFullYear(), fall.date.getMonth(), fall.date.getDate(), fall.date.getHours()],
        [2024, 10, 4, 0]
    );

    var previousDay = new DateCalculator(new Date(2024, 2, 11)).sub(1);
    assert.deepStrictEqual(
        [previousDay.getFullYear(), previousDay.getMonth(), previousDay.getDate(), previousDay.getHours()],
        [2024, 2, 10, 0]
    );

    assert.deepStrictEqual(
        new DateCalculator(new Date(2024, 2, 11)).sub(new Date(2024, 2, 9)),
        { days: 2, weeks: 1, months: 0, years: 0 }
    );

    assert.strictEqual(
        new DateCalculator(new Date(2024, 2, 11)).diff(new Date(2024, 2, 10), { mode: 'elapsed' }),
        23 / 24
    );
    assert.strictEqual(
        new DateCalculator(new Date(2024, 10, 4)).diff(new Date(2024, 10, 3), { mode: 'elapsed' }),
        25 / 24
    );
    assert.deepStrictEqual(
        dateParts(new DateCalculator(new Date(2024, 10, 1)).addBusinessDays(1).date),
        [2024, 10, 4, 0]
    );
} finally {
    if (previousTimeZone === undefined) {
        delete process.env.TZ;
    } else {
        process.env.TZ = previousTimeZone;
    }
}

var builtFile = path.join(__dirname, '..', 'dist', 'date-calculator.js');
var BuiltDateCalculator = require(builtFile);
assert.deepStrictEqual(
    new BuiltDateCalculator(new Date(2018, 7, 9)).sub(new Date(2018, 7, 3)),
    { days: 6, weeks: 1, months: 0, years: 0 }
);
assert.deepStrictEqual(
    dateParts(new BuiltDateCalculator(new Date(2024, 0, 31)).add({ months: 1 }).date),
    [2024, 1, 29, 0]
);
assert.strictEqual(
    new BuiltDateCalculator(new Date(2024, 1, 1)).diff(new Date(2024, 0, 31), { unit: 'months' }),
    1
);

var browser = { window: {}, Date: Date };
vm.runInNewContext(fs.readFileSync(builtFile, 'utf8'), browser);
assert.strictEqual(typeof browser.window.DateCalculator, 'function');
assert.strictEqual(
    new browser.window.DateCalculator(new Date(2018, 7, 9)).sub(new Date(2018, 7, 3)).days,
    6
);
assert.strictEqual(
    new browser.window.DateCalculator(new Date(2024, 4, 3)).addBusinessDays(1).date.getDate(),
    6
);

console.log('DateCalculator tests passed');
