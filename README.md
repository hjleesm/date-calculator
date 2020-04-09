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

### Copyright
Copyright (c) 2018-2020 Hyunjin Lee. See [LICENSE](LICENSE) for further details.
