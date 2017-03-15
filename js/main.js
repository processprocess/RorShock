console.clear()

  let currentComp = 'hazard';
  let scaleModifier = 1;
  let adjustedWindowHeight = window.innerHeight - 200;
  let adjustedWindowWidth = window.innerWidth - 200;

  window.onload = () => {
    setScaleModifier(window.innerWidth)
    eval(currentComp)()
  }

  let navButtons = document.querySelectorAll('nav > ul > li');
  navButtons.forEach(navButton => navButton.addEventListener('click', function(e) {
    handleChange(e.target.textContent);
  }))

  function handleChange(nextComp) {
    if (nextComp === currentComp) return;
    currentComp = nextComp;
    let currentAnims = document.querySelectorAll('.compContainer > div');

    TweenMax.to(currentAnims, 1, {opacity:0, ease:Sine.easeInOut, onComplete:handleRemove})

    function handleRemove() {
      currentAnims = document.querySelectorAll('.compContainer > div');
      currentAnims.forEach(currentAnim => {
        currentAnim.remove();
      })
      setTimeout( function() {
        TweenMax.killAll();
        handleNextComp();
      }, 50 );
    }

    function handleNextComp() {
      eval(nextComp)()
    }
  }

  window.addEventListener('resize', function(e) {
    adjustedWindowHeight = window.innerHeight - 200,
    adjustedWindowWidth = window.innerWidth - 200;
    setScaleModifier(window.innerWidth);
    resetComp();
  })

  function resetComp() {
    let currentAnims = document.querySelectorAll('.compContainer > div');
    currentAnims.forEach(currentAnim => { currentAnim.remove() })
    eval(currentComp)()
  }

  function setScaleModifier(windowWidth) {
    if (windowWidth > 1200) {
      scaleModifier = 1;
    } else if( windowWidth <= 1200 && windowWidth >= 600) {
      scaleModifier = .8;
    } else if( windowWidth <= 600 ) {
      scaleModifier = .6;
    }
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  let stats = document.querySelector('.stats')

  let interval = 1,
      ticker = TweenLite.ticker,
      lastUpdate = ticker.time,
      lastFrame = ticker.frame;
  ticker.addEventListener("tick", function() {
      let time = ticker.time;
      if (time - lastUpdate >= interval) {
        stats.textContent = `fps: ${ Math.floor((ticker.frame - lastFrame) / (time - lastUpdate)) }`
          // console.log("fps: ", (ticker.frame - lastFrame) / (time - lastUpdate));
          lastUpdate = time;
          lastFrame = ticker.frame;
      }
  });