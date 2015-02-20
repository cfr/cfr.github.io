// src: http://tech.pro/tutorial/725/javascript-tutorial-simple-fade-animation

function fade(eid, duration) {
  var element = document.getElementById(eid);
  if(element == null) return;

  if(element.FadeState == null) {
    if(element.style.opacity == null || element.style.opacity == '' || element.style.opacity == '1') element.FadeState = 2;
    else element.FadeState = -2;
  }

  if(element.FadeState == 1 || element.FadeState == -1) {
    element.FadeState = element.FadeState == 1 ? -1 : 1;
    element.FadeTimeLeft = duration - element.FadeTimeLeft;
  } else {
    element.FadeState = element.FadeState == 2 ? -1 : 1;
    element.FadeTimeLeft = duration;
    setTimeout("animateFade(" + new Date().getTime() + ",'" + eid + "'," + duration + ")", 33);
    element.style.pointerEvents = "auto";
  }
}

function animateFade(lastTick, eid, duration) {
  var curTick = new Date().getTime()
  var elapsedTicks = curTick - lastTick;
  var element = document.getElementById(eid);

  if(element.FadeTimeLeft <= elapsedTicks) {
    element.style.opacity = element.FadeState == 1 ? '1' : '0';
    element.style.filter = 'alpha(opacity = ' + (element.FadeState == 1 ? '100' : '0') + ')';
    element.FadeState = element.FadeState == 1 ? 2 : -2;
  } else {
      element.FadeTimeLeft -= elapsedTicks;
      var newOpVal = element.FadeTimeLeft / duration;
      if(element.FadeState == 1) newOpVal = 1 - newOpVal;

      element.style.opacity = newOpVal;
      element.style.filter = 'alpha(opacity = ' + (newOpVal*100) + ')';

      setTimeout("animateFade(" + curTick + ",'" + eid + "'," + duration + ")", 33);
  }
}

