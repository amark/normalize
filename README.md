## Normalize.js
Turn ugly 
``` html
<p>
  <b>
    hi
  </b>
  <i>
    <b>
      yay!
    </b>
  </i>
</p>
```
into beautiful ✨
``` html
<p>
  <b>
    hi 
    <i>
      yay!
    </i>
  </b>
</p>
```
With just a touch of
``` javascript
normalize(element, config);
```
Where config is optional, having pleasant defaults, but extendable for your amusement!

## Installation
``` html
<!-- add jQuery -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<!-- then normalise -->
<script src="https://cdn.jsdelivr.net/gh/amark/normalize@master/normalize.js"></script>
```

## API
Docs coming soon! Peruse the source for now, it is decently tiny, and the built in config explains most of it.
Depends upon the delightful jQuery.

Crafted with love by Mark Nadal, whom is not responsible for any liabilities from the use of this code.
