# DateCalculator

DateCalculator performs calendar arithmetic with JavaScript `Date` objects. It uses the runtime's local time zone and focuses on dates, day differences, and business days.

> This README describes the 2.0.0 code in this repository. Check the [published npm version](https://www.npmjs.com/package/date-calculator) before using the 2.0.0 examples with `npm install`; publishing to npm is separate from pushing this repository.

## Install and import

```sh
npm install date-calculator
```

```js
const DateCalculator = require('date-calculator');
```

For the repository version, clone the repository, run `npm ci`, and use `require('./date-calculator')`. Run `npm run build` to generate `dist/date-calculator.js`. In a browser, load either JavaScript file with a `<script>` tag; the constructor is available as `window.DateCalculator`. AMD loading is also supported.

## Quick start

```js
const DateCalculator = require('date-calculator');

const dc = new DateCalculator(new Date(2024, 0, 31)); // January 31
dc.add({ months: 1 });                               // returns dc
console.log(dc.date);                                 // February 29, 2024, local midnight
console.log(dc.diff(new Date(2024, 1, 1)));           // 28 calendar days

const earlier = dc.sub({ days: 2 });                  // February 27, 2024
console.log(dc.date);                                 // still February 29
```

JavaScript's numeric month argument starts at `0`: January is `0`, February is `1`, and so on. The constructor accepts a valid `Date`, copies it, and starts at local midnight. Changing the input `Date` afterward does not change the calculator.

## API

| Call | Result | Changes `dc.date`? |
| --- | --- | --- |
| `new DateCalculator(date)` | A calculator at the date's local midnight | — |
| `dc.add(days)` | `dc` | Yes |
| `dc.add(duration, options)` | `dc` | Yes |
| `dc.sub(days)` or `dc.sub(duration, options)` | A new `Date` | No |
| `dc.sub(otherDate)` | `{ days, weeks, months, years }` | No |
| `dc.diff(otherDate, options)` | One numeric difference | No |
| `dc.addBusinessDays(amount, options)` | `dc` | Yes |

### Add or subtract a duration

A duration can contain `years`, `months`, `weeks`, and `days`. Omitted fields count as zero. Years, months, and weeks must be integers; `days` may be fractional.

```js
const dc = new DateCalculator(new Date(2024, 0, 31));
dc.add({ months: 1 });                    // February 29, 2024
dc.add({ weeks: 1, days: 2 });           // March 9, 2024
dc.sub({ months: 1 });                   // February 9, 2024; dc stays on March 9
```

Duration fields are applied in this order: years, months, then weeks and days. If the target month lacks the original day, the date is moved to the last day of that month. Pass `{ overflow: 'reject' }` as the second argument to throw a `RangeError` instead:

```js
new DateCalculator(new Date(2023, 0, 31)).add({ months: 1 }).date;
// February 28, 2023

new DateCalculator(new Date(2023, 0, 31)).add(
  { months: 1 }, { overflow: 'reject' }
); // RangeError
```

A numeric operand represents days. Whole days move by local calendar date, preserving local time across daylight saving changes. The fractional part moves by elapsed hours: `add(0.5)` adds 12 elapsed hours.

### Compare dates

`diff(otherDate, options)` returns one number. Calendar mode is the default and counts crossed date, week, month, or year boundaries. It does not return a normalized duration; for example, January 31 to February 1 crosses one month boundary and one day boundary.

| Option | Values | Default |
| --- | --- | --- |
| `unit` | `'days'`, `'weeks'`, `'months'`, `'years'` | `'days'` |
| `mode` | `'calendar'`, `'elapsed'` | `'calendar'` |
| `weekStartsOn` | `0` (Sunday) through `6` (Saturday) | `0` |

```js
const dc = new DateCalculator(new Date(2024, 1, 1));
dc.diff(new Date(2024, 0, 31), { unit: 'days' });   // 1
dc.diff(new Date(2024, 0, 31), { unit: 'months' }); // 1

const sunday = new DateCalculator(new Date(2024, 2, 10));
sunday.diff(new Date(2024, 2, 9), { unit: 'weeks' });                  // 1
sunday.diff(new Date(2024, 2, 9), { unit: 'weeks', weekStartsOn: 1 }); // 0
```

Elapsed mode divides the time between `dc.date` and the exact time in `otherDate` by 24 hours for days, or seven 24-hour days for weeks. It supports only days and weeks; results can be fractional, especially across daylight saving changes. Calendar mode ignores the time of day in `otherDate`.

`sub(otherDate)` keeps the 1.x return shape. Its four fields are independent calendar boundary counts, with Sunday as the start of a week:

```js
new DateCalculator(new Date(2018, 7, 9)).sub(new Date(2018, 7, 3));
// { days: 6, weeks: 1, months: 0, years: 0 }
```

### Add business days

`addBusinessDays(amount, options)` skips Saturday and Sunday by default. A positive amount moves forward, a negative amount moves backward, and zero leaves the date unchanged. The starting date is never counted, even if it is a business day.

```js
const dc = new DateCalculator(new Date(2024, 4, 3)); // Friday, May 3
dc.addBusinessDays(1, { holidays: [new Date(2024, 4, 6)] });
console.log(dc.date); // Tuesday, May 7
```

`holidays` is an array of valid `Date` objects; their time of day is ignored. `weekend` can replace the default `[0, 6]` with weekday numbers. At least one weekday must remain available as a business day.

## Migrating from 1.x

`add(Date)` is no longer accepted. Use a numeric day count or a duration object instead. `sub(Date)` still returns the same four fields, while `diff()` lets you request one unit and choose its calculation mode. Invalid dates, unsupported units, and non-finite amounts now raise errors instead of silently producing invalid results.

## Development

```sh
npm ci
npm test
```

`npm test` builds the minified browser file and checks the source and build output. After building, open `test/index.html` to run the browser QUnit cases. `npm pack --dry-run` shows which files would be included in an npm package.

## License

MIT. Copyright (c) 2018-2020 Hyunjin Lee. See [LICENSE](LICENSE).
