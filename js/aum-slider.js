var aumSlider = (function() {
	return function(selector, userOptions) {
		var _ = this;

		_.options = {
			speed: 500,
			easing: "ease",
			initialSlide: 0,
			swipe: true,
			arrows: true,
			arrowsWrapper: false,
			dots: true,
			loop: true,
			autoPlay: false,
			autoPlaySpeed: 1000,
			lazyLoad: true
		};

		if (typeof userOptions !== "undefined") {
			for (var option in _.options) {
				if (userOptions[option] != undefined) {
					_.options[option] = userOptions[option];
				}
			}
		}

		document.addEventListener("DOMContentLoaded", function() {
			if (document.querySelector(selector).children.length > 1) {
				init();
			}
		});

		function init() {
			createStructure();
			setSlidesWidth();
			setTrackPosition();
			setTrackWidth();
			setTrackTransition();
			if (_.options.arrows) createArrows();
			if (_.options.dots) createDots();
			if (_.options.autoPlay) setAutoPlay();
			navigateSlider();
			resizeSlider();
			if (_.options.lazyLoad) setImageDataSrc();
			if (_.options.lazyLoad) loadImage(_.options.initialSlide);
		}

		function createStructure() {
			_.slider = document.querySelector(selector);
			_.slider.classList.add("aum-slider", "initialized");
			if (_.options.lazyLoad) _.slider.classList.add("lazy");

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
			_.slides = cloneSlides() || _.originalSlides;
		}



		function cloneSlides() {
			if (!_.options.loop) return;

			var firstSlideClone = _.track.firstElementChild.cloneNode(true);
			var lastSlideClone = _.track.lastElementChild.cloneNode(true);

			firstSlideClone.classList.add("aum-clone");
			lastSlideClone.classList.add("aum-clone");

			_.track.insertBefore(firstSlideClone, null);
			_.track.insertBefore(lastSlideClone, _.track.firstElementChild);

			_.allSlides = _.slider.querySelectorAll(".aum-slide");

			return _.allSlides;
		}



		function setSlidesWidth() {
			_.slideWidth = _.list.offsetWidth;

			for(var i = 0; i < _.slides.length; i++) {
				_.slides[i].style.width = _.slideWidth + "px";
			}
		}



		function setTrackPosition() {
			var initialSlideIndex = (_.options.loop) ? ++_.options.initialSlide : _.options.initialSlide;
			var slideIndex = _.currentSlideIndex || initialSlideIndex;
			_.track.style.transform = "translateX(-" + slideIndex * _.slideWidth + "px)";
		}



		function setTrackWidth() {
			_.track.style.width = _.slides[0].offsetWidth * _.slides.length + "px";
		}



		function setTrackTransition() {
			_.track.style.transition = "transform " + _.options.speed / 1000 + "s " + _.options.easing;
		}



		function createArrows() {
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

			switch(_.options.initialSlide) {
				case 0:
					disableArrow(_.prevArrow);
					enableArrow(_.nextArrow);
					break;

				case _.slides.length - 1:
					disableArrow(_.nextArrow);
					enableArrow(_.prevArrow);
					break;

				default:
					enableArrow(_.nextArrow);
					enableArrow(_.prevArrow);
			}
		}



		function createDots() {
			var dotsArr = [];
			var currentDot;
			var initIndex = (_.options.loop) ? _.options.initialSlide - 1 : _.options.initialSlide;

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
		}



		function navigateSlider() {
			_.currentSlideIndex = _.options.initialSlide;
			_.currentSlide = _.slides[_.currentSlideIndex];
			_.currentSlide.classList.add("aum-current");
			if (_.options.arrows) navigateWithArrows();
			if (_.options.dots) navigateWithDots();
			if (_.options.swipe) navigateOnSwipe();
		}



		function navigateOnSwipe() {
			var touchStartFlag = false;
			var touchStartPoint;
			var touchMovePoint;

			_.track.addEventListener('touchstart', function(event) {
				touchStartPoint = event.touches[0].clientX;
				touchStartFlag = true;
			});

			_.track.addEventListener('touchmove', function(event) {
				touchMovePoint = event.touches[0].clientX;

				if (touchStartPoint + 50 < touchMovePoint) {
					if (touchStartFlag) {
						rotateSliderBack();

						touchStartFlag = false;
					}
				}

				if (touchStartPoint - 50 > touchMovePoint) {
					if (touchStartFlag) {
						rotateSliderForward();

						touchStartFlag = false;
					}
				}
			});
		}



		function navigateWithArrows() {
			var isClicked = false;

			_.prevArrow.addEventListener("click", function() {
				if(!isClicked) {
					rotateSliderBack();
					isClicked = true;
				}

				setTimeout(function() {
					isClicked = false;
				}, _.options.speed);
			});

			_.nextArrow.addEventListener("click", function() {
				if(!isClicked) {
					rotateSliderForward();
					isClicked = true;
				}

				setTimeout(function() {
					isClicked = false;
				}, _.options.speed);
			});
		}



		function disableArrow(el) {
			el.classList.add("disabled");
		}



		function enableArrow(el) {
			el.classList.remove("disabled");
		}



		function toggleArrows() {
			if (_.currentSlideIndex == 0) {
				disableArrow(_.prevArrow);
				enableArrow(_.nextArrow);
			}
			else if (_.currentSlideIndex == _.slides.length - 1) {
				disableArrow(_.nextArrow);
				enableArrow(_.prevArrow);
			}
			else {
				enableArrow(_.prevArrow);
				enableArrow(_.nextArrow);
			}
		}



		function navigateWithDots() {
			_.dotsWrapper.addEventListener("click", function(event) {
				if (event.target.classList.contains("aum-dot")) {
					var currentDotIndex = Array.prototype.slice.call(this.children).indexOf(event.target);
					changeCurrentDot(currentDotIndex);
					changeCurrentSlide((_.options.loop) ? currentDotIndex + 1 : currentDotIndex);
					if (!_.options.loop && _.options.arrows) toggleArrows();
				}
			});
		}



		function changeCurrentDot(index) {
			_.currentDotIndex = index;
			_.currentDot.classList.remove("aum-current");
			_.currentDot = _.dots[_.currentDotIndex];
			_.currentDot.classList.add("aum-current");
		}



		function changeCurrentSlide(index) {
			_.currentSlideIndex = index;
			_.currentSlide.classList.remove("aum-current");
			_.currentSlide = _.slides[_.currentSlideIndex];
			_.currentSlide.classList.add("aum-current");
			_.track.style.transform = "translateX(-" + _.currentSlideIndex * _.slideWidth + "px)";
			if (!_.track.style.transition) setTrackTransition();
		}



		function rotateSliderBack() {
			if (_.currentSlide.previousElementSibling) {
				--_.currentSlideIndex;
				changeCurrentSlide(_.currentSlideIndex);
				if (_.options.lazyLoad) loadImage(_.currentSlideIndex);

				if (_.options.dots && _.currentDot.previousElementSibling) {
					changeCurrentDot((_.options.loop) ? _.currentSlideIndex - 1 : _.currentSlideIndex);
				}
			}

			if (_.currentSlideIndex == 0) {
				if (_.options.loop) {
					loopSlider(_.slides.length - 2);
					if (_.options.lazyLoad) loadImage(_.slides.length - 2);
					if (_.options.dots) changeCurrentDot(_.slides.length - 3);
				}
				else {
					if (_.options.arrows) disableArrow(_.prevArrow);
				}
			}
			else {
				if (_.options.arrows) enableArrow(_.nextArrow);
			}
		}



		function rotateSliderForward() {
			if (_.currentSlide.nextElementSibling) {
				++_.currentSlideIndex;
				changeCurrentSlide(_.currentSlideIndex);
				if (_.options.lazyLoad) loadImage(_.currentSlideIndex);

				if (_.options.dots && _.currentDot.nextElementSibling) {
					changeCurrentDot((_.options.loop) ? _.currentSlideIndex - 1 : _.currentSlideIndex);
				}
			}

			if (_.currentSlideIndex == _.slides.length - 1) {
				if (_.options.loop) {
					loopSlider(1);
					if (_.options.lazyLoad) loadImage(1);
					if (_.options.dots) changeCurrentDot(0);
				}
				else {
					if (_.options.arrows) disableArrow(_.nextArrow);
				}
			}
			else {
				if (_.options.arrows) enableArrow(_.prevArrow);
			}
		}



		function loopSlider(index) {
			var loopTimer = setTimeout(function () {
				changeCurrentSlide(index);
				_.track.style.transition = "";
			}, _.options.speed);
		}



		function setAutoPlay() {
			var lastSlideFlag = false;
			var autoPlayTimer = setTimeout(function play() {
				if (_.currentSlideIndex == _.slides.length - 1) lastSlideFlag = true;
				if (_.currentSlideIndex == 0) lastSlideFlag = false;

				if (lastSlideFlag) {
					--_.currentSlideIndex;
					changeCurrentSlide(_.currentSlideIndex);
					if (_.options.lazyLoad) loadImage(_.currentSlideIndex);
					if (_.options.dots) changeCurrentDot(_.currentSlideIndex);
				}
				else {
					++_.currentSlideIndex;
					changeCurrentSlide(_.currentSlideIndex);
					if (_.options.lazyLoad) loadImage(_.currentSlideIndex);

					if (_.options.dots) {
						if (_.options.loop) {
							if (_.currentSlideIndex == _.slides.length - 1) {
								changeCurrentDot(0);
							}
							else {
								changeCurrentDot(_.currentSlideIndex - 1);
							}
						}
						else {
							changeCurrentDot(_.currentSlideIndex);
						}
					}
				}

				if (!_.options.loop && _.options.arrows) toggleArrows();

				setTimeout(play, _.options.autoPlaySpeed);
			}, _.options.autoPlaySpeed);

			_.track.addEventListener("transitionend", function() {
				if (_.currentSlideIndex == _.slides.length - 1) {
					if (_.options.loop) {
						changeCurrentSlide(1);
						if (_.options.lazyLoad) loadImage(1);
						_.track.style.transition = "";
					}
				}
			});
		}



		function resizeSlider() {
			var resizeTimer;

			window.addEventListener("resize", function() {
				_.track.style.transition = "";
				clearTimeout(resizeTimer);

				resizeTimer = setTimeout(function() {

					setSlidesWidth();
					setTrackWidth();
					setTrackPosition();

				}, 250);
			});
		}



		function setImageDataSrc() {
			_.slides.forEach(function(slide) {
				slide.querySelector("img").setAttribute("data-src", slide.querySelector("img").getAttribute("src"));
				slide.querySelector("img").removeAttribute("src");
			});
		}



		function loadImage(currentSlideIndex) {
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
		}
	};
})();



var slider = new aumSlider(".slider");