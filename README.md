# aumslider
AumSlider is a simple image slider, written in Javascript mostly for modern browsers. Also it has no dependencies.

## Demo
https://paulsolari.github.io/aumslider/

## Usage
#### 1. Add CSS

```html
<link rel='stylesheet' href='css/aum-slider.css'>
```

#### 2. Add HTML

```html
<div class="slider">
  <div></div>
  <div></div>
  <div></div>
</div>
```

#### 3. Add JS

```html
<script src='js/aum-slider.js'></script>
```

#### 3. Initialize slider

```html
<script>
  var slider = new AumSlider(".slider");
</script>
```

AumSlider has several options and you can set them this way.

```html
<script>
  var slider = new AumSlider(".slider", {
    speed: 1000,
    fadeEffect: true
  });
</script>
```

## Options

Option                | Type        | Default     | Description
----------------------|-------------|-------------|------------------------
speed                 | number      | 500         | Transition speed (in milliseconds).
easing                | string      | "ease"      | Transition timing function (ease-in, ease-out, linear, etc.).
initialSlide          | number      | 0           | Slide to be shown on slider initializing.
swipe                 | boolean     | true        | Enable swipe for touch devices.
arrows                | boolean     | true        | Enable navigation arrows.
arrowsWrapper         | boolean     | false       | Wrap arrows in ```<div></div>``` element.
dots                  | boolean     | true        | Enable navigation dots.
loop                  | boolean     | false       | Infinite loop.
autoplay              | boolean     | false       | Automatic change of slides.
autoplaySpeed         | number      | 3000        | Time between slides change (in milliseconds).
lazyLoad              | boolean     | false       | Load image when it will be in the viewport.
fadeEffect            | boolean     | false       | Change type of animation from carousel to gallery.
