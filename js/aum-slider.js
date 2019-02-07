;(function() {
	var AumSlider = function(selector, userOptions) {
		var _ = this;
		_.selector = selector;

		_.options = {
			speed: 500,
			easing: "ease",
			initialSlide: 0,
			swipe: true,
			arrows: true,
			arrowsWrapper: false,
			dots: true,
			loop: false,
			autoplay: false,
			autoplaySpeed: 3000,
			lazyLoad: false,
			fadeEffect: false
		};

		if (typeof userOptions !== "undefined") {
			for (var option in _.options) {
				if (userOptions[option] != undefined) {
					_.options[option] = userOptions[option];
				}
			}
		}

		if (document.querySelector(selector).children.length > 1) {
			_.init();
		}
	};



	window.AumSlider = AumSlider;



	AumSlider.prototype.init = function() {
		var _ = this;
		_.isAnimating = false;

		_.createStructure();

		if (!_.options.fadeEffect) {
			_.setSlidesWidth();
			_.setTrackPosition();
			_.setTrackWidth();
			_.setTrackTransition();

		}

		if (_.options.arrows) _.createArrows();

		if (_.options.dots) _.createDots();

		if (_.options.autoplay) _.enableAutoplay();

		_.navigateSlider();

		_.resizeSlider();

		if (_.options.lazyLoad) {
			_.setImageDataSrc();
			_.loadImage(_.options.initialSlide);
			if (_.options.loop && !_.options.fadeEffect) {
				if (_.options.initialSlide == 1) _.loadImage(_.slides.length - 1);
				if (_.options.initialSlide == _.slides.length - 2) _.loadImage(0);
			}
		}

		if (_.options.fadeEffect) _.setFadeEffect();
	};



	AumSlider.prototype.createStructure = function() {
		var _ = this;

		_.slider = document.querySelector(_.selector);

		_.originalHTML = _.slider.innerHTML;

		_.slider.classList.add("aum-slider", "initialized");

		if (_.options.lazyLoad) {
			_.slider.classList.add("lazy");
		}
		else {
			_.slider.classList.remove("lazy");
		}

		for (var i = 0; i < _.slider.children.length; i++) {
			_.slider.children[i].classList.add("aum-slide");
		}

		var sliderHTML = _.slider.innerHTML;
		var sliderNewHTML ="<div class=\"aum-list\">"+
		"<div class=\"aum-track\">"+
		sliderHTML+
		"</div>"+
		"</div>";

		_.slider.innerHTML = sliderNewHTML;
		_.list = _.slider.querySelector(".aum-list");
		_.track = _.slider.querySelector(".aum-track");
		_.originalSlides = _.slider.querySelectorAll(".aum-slide");
		_.slides = _.cloneSlides() || _.originalSlides;
	};



	AumSlider.prototype.cloneSlides = function() {
		var _ = this;

		if (!_.options.loop || _.options.fadeEffect) return;

		var firstSlideClone = _.track.firstElementChild.cloneNode(true);
		var lastSlideClone = _.track.lastElementChild.cloneNode(true);

		firstSlideClone.classList.add("aum-clone");
		lastSlideClone.classList.add("aum-clone");

		_.track.insertBefore(firstSlideClone, null);
		_.track.insertBefore(lastSlideClone, _.track.firstElementChild);

		_.allSlides = _.slider.querySelectorAll(".aum-slide");

		return _.allSlides;
	};



	AumSlider.prototype.setSlidesWidth = function() {
		var _ = this;

		_.slideWidth = _.list.clientWidth;

		for(var i = 0; i < _.slides.length; i++) {
			_.slides[i].style.width = _.slideWidth + "px";
		}
	};



	AumSlider.prototype.setTrackPosition = function() {
		var _ = this;
		var initialSlideIndex = (_.options.loop) ? ++_.options.initialSlide : _.options.initialSlide;
		var slideIndex = _.currentSlideIndex || initialSlideIndex;
		_.track.style.transform = "translateX(-" + slideIndex * _.slideWidth + "px)";
	};



	AumSlider.prototype.setTrackWidth = function() {
		var _ = this;

		_.track.style.width = _.slides[0].clientWidth * _.slides.length + "px";
	};



	AumSlider.prototype.setTrackTransition = function() {
		var _ = this;

		_.track.style.transition = "transform " + _.options.speed / 1000 + "s " + _.options.easing;
	};



	AumSlider.prototype.createArrows = function() {
		var _ = this;

		_.arrows =	"<button class=\"aum-arrow aum-prev\">prev</button>"+
		"<button class=\"aum-arrow aum-next\">next</button>";

		if (_.options.arrowsWrapper) {
			_.arrowsWrapper = "<div class=\"aum-arrows\">" + _.arrows + "</div>";
			_.list.insertAdjacentHTML("beforeend", _.arrowsWrapper);
		}
		else {
			_.list.insertAdjacentHTML("beforeend", _.arrows);
		}

		_.prevArrow = _.list.querySelector(".aum-prev");
		_.nextArrow = _.list.querySelector(".aum-next");

		if (!_.options.loop) _.toggleArrows(_.options.initialSlide);
	};



	AumSlider.prototype.createDots = function() {
		var _ = this;
		var dotsArr = [];
		var currentDot;
		var initIndex = (_.options.loop && !_.options.fadeEffect) ? _.options.initialSlide - 1 : _.options.initialSlide;

		for (var i = 0; i < _.originalSlides.length; i++) {
			currentDot = (i == initIndex) ? " aum-current" : "";
			dotsArr.push("<button class=\"aum-dot" + currentDot + "\">" + i + "</button>");
		}

		var dotsStr = dotsArr.join("");
		var dotsWrapperHTML = "<div class=\"aum-dots\">" + dotsStr + "</div>";

		_.list.insertAdjacentHTML("beforeend", dotsWrapperHTML);
		_.dotsWrapper = _.list.querySelector(".aum-dots");
		_.dots = _.dotsWrapper.querySelectorAll(".aum-dot");
		_.currentDot = _.dotsWrapper.querySelector(".aum-dot.aum-current");
		_.currentDotIndex = Array.prototype.slice.call(_.dotsWrapper.children).indexOf(_.currentDot);
	};



	AumSlider.prototype.navigateSlider = function() {
		var _ = this;

		_.currentSlideIndex = _.options.initialSlide;
		_.currentSlide = _.slides[_.currentSlideIndex];
		_.currentSlide.classList.add("aum-current");

		if (_.options.arrows) _.navigateWithArrows();
		if (_.options.dots) _.navigateWithDots();
		if (_.options.swipe) _.navigateOnSwipe();
	};



	AumSlider.prototype.navigateOnSwipe = function() {
		var _ = this;
		var touchStartPoint;
		var touchMovePoint;

		_.track.addEventListener('touchstart', function(event) {
			touchStartPoint = event.touches[0].clientX;
		});

		_.track.addEventListener('touchmove', function(event) {
			touchMovePoint = event.touches[0].clientX;
		});

		_.track.addEventListener("touchend", function() {
			if (_.isAnimating) return;

			_.isAnimating = true;

			if (touchStartPoint + 50 < touchMovePoint) {
				_.rotateSliderBack();
			}

			if (touchStartPoint - 50 > touchMovePoint) {
				_.rotateSliderForward();
			}

			setTimeout(function() {
				_.isAnimating = false;
			}, _.options.speed);
		});
	};



	AumSlider.prototype.navigateWithArrows = function() {
		var _ = this;

		function arrowNav(navigate) {
			_.navigate = navigate;

			if(_.isAnimating) return;

			_.isAnimating = true;

			_.navigate();

			setTimeout(function() {
				_.isAnimating = false;
			}, _.options.speed);
		}

		_.prevArrow.addEventListener("click", function() {
			arrowNav(_.rotateSliderBack);
		});

		_.nextArrow.addEventListener("click", function() {
			arrowNav(_.rotateSliderForward);
		});
	};



	AumSlider.prototype.disableArrow = function(el) {
		el.classList.add("disabled");
	};



	AumSlider.prototype.enableArrow = function(el) {
		el.classList.remove("disabled");
	};



	AumSlider.prototype.toggleArrows = function(slide) {
		var _ = this;
		if (slide == 0) {
			if (!_.prevArrow.classList.contains("disabled")) {
				_.disableArrow(_.prevArrow);
			}
			_.enableArrow(_.nextArrow);
		}
		else if (slide == _.slides.length - 1) {
			if (!_.nextArrow.classList.contains("disabled")) {
				_.disableArrow(_.nextArrow);
			}
			_.enableArrow(_.prevArrow);
		}
		else {
			_.enableArrow(_.nextArrow);
			_.enableArrow(_.prevArrow);
		}

		// switch(slide) {
		// 	case 0:
		// 		_.disableArrow(_.prevArrow);
		// 		_.enableArrow(_.nextArrow);
		// 		break;
		//
		// 	case _.slides.length - 1:
		// 		_.disableArrow(_.nextArrow);
		// 		_.enableArrow(_.prevArrow);
		// 		break;
		//
		// 	default:
		// 		_.enableArrow(_.nextArrow);
		// 		_.enableArrow(_.prevArrow);
		// }
	};



	AumSlider.prototype.navigateWithDots = function() {
		var _ = this;

		_.dotsWrapper.addEventListener("click", function(event) {
			if (_.isAnimating) return;

			_.isAnimating = true;

			if (event.target.classList.contains("aum-dot")) {
				var currentDotIndex = Array.prototype.slice.call(this.children).indexOf(event.target);
				_.changeCurrentDot(currentDotIndex);
				_.changeCurrentSlide((_.options.loop && !_.options.fadeEffect) ? currentDotIndex + 1 : currentDotIndex);
				if (!_.options.loop && _.options.arrows) _.toggleArrows(_.currentSlideIndex);
			}

			setTimeout(function() {
				_.isAnimating = false;
			}, _.options.speed);
		});
	};



	AumSlider.prototype.changeCurrentDot = function(index) {
		var _ = this;
		_.currentDotIndex = index;
		_.currentDot.classList.remove("aum-current");
		_.currentDot = _.dots[_.currentDotIndex];
		_.currentDot.classList.add("aum-current");
	};



	AumSlider.prototype.changeCurrentSlide = function(index) {
		var _ = this;
		_.currentSlideIndex = index;
		_.prevCurrentSlide = _.currentSlide;
		_.currentSlide.classList.remove("aum-current");
		_.currentSlide = _.slides[_.currentSlideIndex];
		_.currentSlide.classList.add("aum-current");

		if (_.options.fadeEffect) {
			_.fadeSlide(_.currentSlideIndex);
		}
		else {
			_.track.style.transform = "translateX(-" + _.currentSlideIndex * _.slideWidth + "px)";
			if (!_.track.style.transition) _.setTrackTransition();
		}
	};



	AumSlider.prototype.rotateSliderBack = function() {
		var _ = this;

		if (_.currentSlide.previousElementSibling) {
			--_.currentSlideIndex;
			_.changeCurrentSlide(_.currentSlideIndex);

			if (_.options.lazyLoad) {
				_.loadImage(_.currentSlideIndex);
				if (_.options.loop && !_.options.fadeEffect) {
					if (_.currentSlideIndex == 1) _.loadImage(_.slides.length - 1);
					if (_.currentSlideIndex == _.slides.length - 2) _.loadImage(0);
				}
			}

			if (_.options.dots && _.currentDot.previousElementSibling) {
				_.changeCurrentDot((_.options.loop && !_.options.fadeEffect) ? _.currentSlideIndex - 1 : _.currentSlideIndex);
			}
		}
		else {
			if (_.options.loop && _.options.fadeEffect) {
				_.changeCurrentSlide(_.slides.length - 1);
				if (_.options.lazyLoad) _.loadImage(_.slides.length - 1);
				if (_.options.dots) _.changeCurrentDot(_.slides.length - 1);
			}
		}

		if (_.currentSlideIndex == 0) {
			if (_.options.loop) {
				if (!_.options.fadeEffect) {
					_.loopSlider(_.slides.length - 2);
					if (_.options.lazyLoad) _.loadImage(_.slides.length - 2);
					if (_.options.dots) _.changeCurrentDot(_.slides.length - 3);
				}
			}
			else {
				if (_.options.arrows) _.disableArrow(_.prevArrow);
			}
		}
		else {
			if (_.options.arrows && !_.options.loop) _.enableArrow(_.nextArrow);
		}
	};



	AumSlider.prototype.rotateSliderForward = function() {
		var _ = this;

		if (_.currentSlide.nextElementSibling) {
			++_.currentSlideIndex;
			_.changeCurrentSlide(_.currentSlideIndex);

			if (_.options.lazyLoad) {
				_.loadImage(_.currentSlideIndex);
				if (_.options.loop && !_.options.fadeEffect) {
					if (_.currentSlideIndex == 1) _.loadImage(_.slides.length - 1);
					if (_.currentSlideIndex == _.slides.length - 2) _.loadImage(0);
				}
			}

			if (_.options.dots && _.currentDot.nextElementSibling) {
				_.changeCurrentDot((_.options.loop && !_.options.fadeEffect) ? _.currentSlideIndex - 1 : _.currentSlideIndex);
			}
		}
		else {
			if (_.options.loop && _.options.fadeEffect) {
				_.changeCurrentSlide(0);
				if (_.options.lazyLoad) _.loadImage(0);
				if (_.options.dots) _.changeCurrentDot(0);
			}
		}

		if (_.currentSlideIndex == _.slides.length - 1) {
			if (_.options.loop) {
				if (!_.options.fadeEffect) {
					_.loopSlider(1);
					if (_.options.lazyLoad) _.loadImage(1);
					if (_.options.dots) _.changeCurrentDot(0);
				}
			}
			else {
				if (_.options.arrows) _.disableArrow(_.nextArrow);
			}
		}
		else {
			if (_.options.arrows && !_.options.loop) _.enableArrow(_.prevArrow);
		}
	};



	AumSlider.prototype.loopSlider = function(index) {
		var _ = this;
		var loopTimer = setTimeout(function () {
			_.changeCurrentSlide(index);
			_.track.style.transition = "";
		}, _.options.speed);
	};



	AumSlider.prototype.enableAutoplay = function() {
		var _ = this;
		var isLastSlide = false;
		var autoplaySpeed = Math.max(_.options.autoplaySpeed, _.options.speed + 50);
		_.autoplayTimer = null;

		var updateAutoplayTimer = function() {
			if (_.autoplayTimer) {
				if (_.currentSlideIndex == _.slides.length - 1) isLastSlide = true;
				if (_.currentSlideIndex == 0) isLastSlide = false;

				if (isLastSlide) {
					if (_.options.loop) {
						if(_.options.fadeEffect) {
							_.changeCurrentSlide(0);
							if (_.options.lazyLoad) _.loadImage(0);
							if (_.options.dots) _.changeCurrentDot(0);
						}
					}
					else {
						--_.currentSlideIndex;
						_.changeCurrentSlide(_.currentSlideIndex);
						if (_.options.lazyLoad) _.loadImage(_.currentSlideIndex);
						if (_.options.dots) _.changeCurrentDot(_.currentSlideIndex);
					}
				}
				else {
					if (_.currentSlideIndex != _.slides.length - 1) {
						++_.currentSlideIndex;
						_.changeCurrentSlide(_.currentSlideIndex);
						if (_.options.lazyLoad) _.loadImage(_.currentSlideIndex);
					}

					if (_.options.dots) {
						if (_.options.loop && !_.options.fadeEffect) {
							if (_.currentSlideIndex == _.slides.length - 1) {
								_.changeCurrentDot(0);
							}
							else {
								_.changeCurrentDot(_.currentSlideIndex - 1);
							}
						}
						else {
							_.changeCurrentDot(_.currentSlideIndex);
						}
					}
				}

				if (!_.options.loop && _.options.arrows) _.toggleArrows(_.currentSlideIndex);
			}

			_.autoplayTimer = setTimeout(updateAutoplayTimer, autoplaySpeed);
		};

		updateAutoplayTimer();

		_.track.addEventListener("transitionend", function() {
			if (_.currentSlideIndex == _.slides.length - 1) {
				if (_.options.loop && !_.options.fadeEffect) {
					_.changeCurrentSlide(1);
					if (_.options.lazyLoad) _.loadImage(1);
					_.track.style.transition = "";
				}
			}
		});
	};



	AumSlider.prototype.clearAutoplayTimer = function() {
		var _ = this;

		if (_.autoplayTimer) clearTimeout(_.autoplayTimer);
	}



	AumSlider.prototype.resizeSlider = function() {
		var _ = this;
		var resizeTimer;

		window.addEventListener("resize", function() {
			if (!_.options.fadeEffect) {
				_.track.style.transition = "";
				clearTimeout(resizeTimer);

				resizeTimer = setTimeout(function() {

					_.setSlidesWidth();
					_.setTrackWidth();
					_.setTrackPosition();

				}, 50);
			}
		});
	};



	AumSlider.prototype.setImageDataSrc = function() {
		var _ = this;

		_.slides.forEach(function(slide) {
			slide.querySelector("img").setAttribute("data-src", slide.querySelector("img").getAttribute("src"));
			slide.querySelector("img").removeAttribute("src");
		});
	};



	AumSlider.prototype.loadImage = function(currentSlideIndex) {
		var _ = this;
		var slide = _.slides[currentSlideIndex];
		slide.classList.add("load");

		var image = slide.querySelector("img");
		image.setAttribute("src", image.getAttribute("data-src"));
		image.classList.add("load");

		image.addEventListener("load", function() {
			if (image.complete) {
				slide.classList.remove("load");
				slide.classList.add("loaded");
				image.classList.remove("load");
				image.classList.add("loaded");
			}
		});
	};



	AumSlider.prototype.setFadeEffect = function() {
		var _ = this;

		_.slider.classList.add("fade");

		_.slides.forEach(function(slide) {
			if (slide !== _.currentSlide) {
				slide.style.transition = "";
				slide.style.opacity = 0;
				slide.style.visibility = "hidden";
			}
		});
	};



	AumSlider.prototype.fadeSlide = function(currentSlideIndex) {
		var _ = this;
		var currentSlide = _.slides[currentSlideIndex];
		var transitionValue = _.options.speed / 1000 + "s " + _.options.easing;
		var fadeTimer = setTimeout(function() {
			_.prevCurrentSlide.style.transition = "";
			_.prevCurrentSlide.style.opacity = 0;
			_.prevCurrentSlide.style.visibility = "hidden";
		}, _.options.speed);

		currentSlide.style.transition = "opacity " + transitionValue + ", visibility " + transitionValue;
		currentSlide.style.opacity = 1;
		currentSlide.style.visibility = "visible";
	};



	AumSlider.prototype.destroy = function() {
		var _ = this;

		_.clearAutoplayTimer();

		_.slider.innerHTML = _.originalHTML;
		_.slider.classList.remove("aum-slider", "initialized", "fade");
	};



	AumSlider.prototype.reinit = function() {
		var _ = this;

		if (_.slider.classList.contains("initialized")) _.destroy();

		_.init();

		if (!_.options.fadeEffect) {
			_.track.style.transition = '';
			_.track.style.transform = "translateX(-" + _.options.initialSlide * _.slideWidth + "px)";
		}
	};
})();