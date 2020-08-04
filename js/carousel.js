function Carousel(containerId, animationTime) {
  this.animationTime = animationTime;
  var context = this;
  this.containerElement = document.getElementById(containerId) || document.body;
  this.items = this.containerElement.getElementsByClassName("carousel-item");
  this.formerActive = this.activeItem;
  this.active = 0;
  this.transitioning = false;

  this.lastSlideable = this.items.length - 1;

  this.containerElement.style.position = "relative";
  this.containerElement.style.overflow = "hidden";
  for (var i = 0; i < this.items.length; i++) {
    this.items[i].style.position = "relative";
    this.items[i].style.width = "100%";
  }

  var carouselId = 0;
  for (var k = 0; k < containerId.length; k++) {
    carouselId += containerId.charCodeAt(k);
  }
  this.renderArrows = function () {
    var arrowBack = document.createElement("i");
    arrowBack.classList = "fa fa-chevron-left";
    var arrowNext = document.createElement("i");
    arrowNext.classList = "fa fa-chevron-right";
    var arrowStyles = {
      color: "white",
      position: "absolute",
      top: "40%",
      fontSize: "25px",
      padding: "15px",
      backgroundColor: "rgba(0,0,0,0.6)",
      cursor: "pointer",
    };

    Object.assign(arrowBack.style, arrowStyles);
    arrowBack.style.left = "0";
    Object.assign(arrowNext.style, arrowStyles);
    arrowNext.style.right = "0";

    arrowBack.addEventListener("click", function () {
      if(!context.transitioning){
        clearInterval(context.autoSlide); //clear autosliding until execution of next finishes
        context.goPrev();
        if(context.autoSlideEnabled){
          console.log("Resumed sliding");
          //continue auto sliding if enabled during object creation
          context.startSlideshow(context.holdTime);
        }
      }
    });

    arrowNext.addEventListener("click", function () {
      if(!context.transitioning){
        clearInterval(context.autoSlide);
        context.goNext();
        if(context.autoSlideEnabled){
          console.log("Resumed sliding");
          context.startSlideshow(context.holdTime);
        }
      }
    });

    this.containerElement.appendChild(arrowBack);
    this.containerElement.appendChild(arrowNext);
  };

  this.renderDots = function () {
    var dots = document.createElement("div");
    dots.style.position = "absolute";
    dots.style.bottom = "20px";
    dots.style.width = "100%";
    dots.style.textAlign = "center";
    this.containerElement.appendChild(dots);

    var dotStyles = {
      height: "15px",
      width: "15px",
      borderRadius: "50%",
      backgroundColor: "#a9a9a9",
      marginRight: "10px",
      display: "inline-block",
      cursor: "pointer",
    };
    for (var a = 0; a <= this.lastSlideable; a++) {
      var dot = document.createElement("span");
      Object.assign(dot.style, dotStyles);
      dot.id = carouselId + "dot" + a;
      dots.appendChild(dot);
    }
    dots.addEventListener("click", function (ev) {
      var source = ev.target.id;
      if (source.includes("dot")) {
        if(!context.transitioning){
          clearInterval(context.autoSlide);
          var no = parseInt(ev.target.id.slice(carouselId.toString().length + 3));
          context.jumpTo(no);
          if(context.autoSlideEnabled){
            context.startSlideshow(context.holdTime);
          }
        }
      }
    });
  };

  this.renderArrows();
  this.renderDots();

  this.slideTo = function (toItem) {
    if (toItem >= 0 && toItem <= this.lastSlideable) {
      for (var i = 0; i < this.items.length; i++) {
        if (i == toItem) {
          this.items[i].style.display = "inline-block";
          document.getElementById(
            carouselId + "dot" + i
          ).style.backgroundColor = "#ffffff";
        } else {
          this.items[i].style.display = "none";
          document.getElementById(
            carouselId + "dot" + i
          ).style.backgroundColor = "#a9a9a9";
        }
      }
    }
  };
  this.slideTo(this.active);
  this.height = this.items[0].offsetHeight;
  var itemWidth = this.items[0].offsetWidth;
  this.containerElement.style.maxWidth = itemWidth+"px";
  this.width = this.containerElement.offsetWidth;
  this.containerElement.style.maxHeight = this.height + "px";

  this.animatedSlide = function (fromItem, toItem) {
    this.transitioning = true;
    var itemOut = this.items[fromItem];
    var itemIn = this.items[toItem];
    itemOut.style.top = "0px";
    itemIn.style.display = "inline-block"; //to make both item in same line also added 4 i.e lineheight//Total time to finish transition (ms)
    var divisor = 100;
    var rate = (this.animationTime || 400) / divisor;
    var outside, inside, animate, slideLeft;
    if (fromItem > toItem) {
      //slide towards right
      (outside = 0), (inside = -this.width);
      itemOut.style.top = "-" + (this.height + 4) + "px";
      animate = function () {
        outside += context.width / divisor;
        itemOut.style.left = outside + "px";
        inside += context.width / divisor;
        itemIn.style.left = inside + "px";
        var slidingLimit = context.width;
        if (outside >= slidingLimit) {
          itemIn.style.top = "0px";
          itemOut.style.top = "0px";
          itemOut.style.display = "none";
          document.getElementById(
            carouselId + "dot" + fromItem
          ).style.backgroundColor = "#a9a9a9";
          document.getElementById(
            carouselId + "dot" + toItem
          ).style.backgroundColor = "#ffffff";
          clearInterval(context.slideLeft);
          context.transitioning = false;
        }
      };
    } else if (toItem > fromItem) {
      //slide towards left
      itemIn.style.top = "-" + (this.height + 4) + "px";
      (outside = 0), (inside = this.width);
      animate = function () {
        outside -= context.width / divisor;
        itemOut.style.left = outside + "px";
        inside -= context.width / divisor;
        itemIn.style.left = inside + "px";
        var slidingLimit = -context.width;
        if (outside <= slidingLimit) {
          itemIn.style.top = "0px";
          itemOut.style.top = "0px";
          itemOut.style.display = "none";
          document.getElementById(
            carouselId + "dot" + fromItem
          ).style.backgroundColor = "#a9a9a9";
          document.getElementById(
            carouselId + "dot" + toItem
          ).style.backgroundColor = "#ffffff";
          clearInterval(context.slideLeft);
          context.transitioning = false;
        }
      };
    } else {
      this.slideTo(toItem);
    }

    this.slideLeft = setInterval(animate, rate);
  };

  this.goPrev = function () {
    this.formerActive = this.active;
    this.active === 0 ? (this.active = this.lastSlideable) : (this.active -= 1);
    this.animatedSlide(this.formerActive, this.active);
  };

  this.goNext = function () {
    this.formerActive = this.active;
    this.active === this.lastSlideable ? (this.active = 0) : (this.active += 1);
    this.animatedSlide(this.formerActive, this.active);
  };
  var counter = 1;

  this.startSlideshow = function (holdTime) {
    this.autoSlideEnabled = true;
    this.holdTime = holdTime || 10000;
    holdTime <= this.animationTime ? (this.holdTime = this.animationTime + 100) : this.holdTime = holdTime;
    this.autoSlide = setInterval(function () {
      context.goNext();
    }, context.holdTime);
  };

  this.jumpTo = function (itemNo) {
    this.formerActive = this.active;
    this.animatedSlide(this.formerActive, itemNo);
    this.active = itemNo;
  };
}

window.addEventListener('resize',function(){
  location.reload();
}); 

