normalize
=========

Turn ugly
```
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
into beautiful
```
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
```
normalize(element, config);
```
Where config is optional, having pleasant defaults, but extendable for your amusement.

##API
Docs coming soon! Peruse the source for now, it is decently tiny, and the built in config explains most of it.
Depends upon the delightful jQuery.

Crafted with love by Mark Nadal, whom is not responsible for any liabilities from the use of this code.
