# DateCalculator
DateCalculator is a calculator for Date object.

## Installation
**Node.js** `npm install date-calculator`

## Usage
**Node.js**
```
var DateCalculator = require('date-calculator');
```

**In Browser**
```
<script src="date-calculator.js"></script>
```

**Example**
```
var dc = new DateCalculator(new Date(2018,7,9));
dc.sub(new Date(2018,7,3)); // -> Object {days: 6, months: 0, weeks: 1, years: 0}
```

The constructor accepts a valid `Date` and starts at its local midnight. `add()` updates the calculator and returns it. `sub()` returns a new `Date` for a number or duration, or a difference object for a `Date`.

```js
var dc = new DateCalculator(new Date(2024, 0, 31));
dc.add({ months: 1 });                         // February 29, 2024
dc.add({ weeks: 1, days: 2 });                // March 9, 2024
dc.sub({ months: 1 });                        // February 9, 2024; dc is unchanged
dc.diff(new Date(2024, 2, 1), { unit: 'days' }); // 8
```

Duration objects accept `years`, `months`, `weeks`, and `days`. Years, months, and weeks must be integers. Adding years and months clamps invalid month-end dates by default; pass `{ overflow: 'reject' }` as the second argument to throw instead. Years, months, weeks, and days are applied in that order. Numeric operands represent days: whole days move by local calendar date, while fractional days move by elapsed hours. `add(Date)` is no longer supported; use a number or duration object.

### Date differences

`diff(other, options)` returns one number. `unit` can be `days` (default), `weeks`, `months`, or `years`. Calendar mode (the default) counts date, week, month, or year boundaries. Weeks start on Sunday unless `weekStartsOn` is set to a weekday number (`0` for Sunday through `6` for Saturday). Elapsed mode measures the time between the calculator's current Date and the exact time in `other`; it supports days and weeks.

```js
var dc = new DateCalculator(new Date(2024, 1, 1));
dc.diff(new Date(2024, 0, 31), { unit: 'months' }); // 1 calendar month boundary
dc.diff(new Date(2024, 0, 31), { unit: 'days' });   // 1 calendar day
dc.diff(new Date(2024, 0, 31), { unit: 'days', mode: 'elapsed' }); // elapsed days
```

`sub(Date)` still returns `{ days, weeks, months, years }` using calendar boundaries and a Sunday week start. These fields are independent totals, not parts of one normalized duration.

### Business days

`addBusinessDays(amount, options)` updates the calculator and skips Saturday and Sunday. Negative amounts move backward. The starting date is not counted. Provide `holidays` as an array of `Date` objects and `weekend` as weekday numbers to customize it.

```js
var dc = new DateCalculator(new Date(2024, 4, 3)); // Friday
dc.addBusinessDays(1, { holidays: [new Date(2024, 4, 6)] }); // Tuesday, May 7
```

## Development
Run `npm test` to build the minified browser file and test both source and build output. Open `test/index.html` to run the browser QUnit tests.

### Copyright
Copyright (c) 2018-2020 Hyunjin Lee. See [LICENSE](LICENSE) for further details.
