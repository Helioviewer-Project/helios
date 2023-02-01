$(document).ready(function(){
  
  // tab behavior
  let thistabsection='';
  $(".hv_lefttabs").click(function(){
	// hides all tabbed content
    $('.hv_tabcont').css('display','none');
	// gets clicked-on tab section
	thistabsection=$(this).attr('thistab');
	// shows requested tab content
	$('#'+thistabsection).css('display','block');
	// re-style tabs
	$(".hv_lefttabs").removeClass('tabActive');
	$(".hv_lefttabs").addClass('tabInactive');
	$(this).removeClass('tabInactive');
	// style the tab
	$(this).addClass('tabActive');
  });
  
  // click Play/Pause button behavior
  let playcontrolstate='play';
  $("#js-play-btn-main").click(function(){
		if(playcontrolstate=='play') {
			$('#js-play-btn').trigger('click');
			$("#js-play-btn-main").attr('src','https://gl.helioviewer.org/btaylor/resources/images/pausebutton_white1.png').fadeIn();
			playcontrolstate='pause';
		}
		else if(playcontrolstate=='pause') {
			$('#js-pause-btn').trigger('click');
			$("#js-play-btn-main").attr('src','https://gl.helioviewer.org/btaylor/resources/images/playbutton_white1.png').fadeIn();
			playcontrolstate='play';
		}
  });
  
	// hover and press Play/Pause button behavior
	$('#js-play-btn').hover(function() {
		if(playcontrolstate=='play') {
			$('#js-play-btn-main').attr('src','https://gl.helioviewer.org/btaylor/resources/images/playbutton_white2.png');
		} else if(playcontrolstate=='pause') {
			$('#js-play-btn-main').attr('src','https://gl.helioviewer.org/btaylor/resources/images/pausebutton_white2.png');
		}
	}, function() {
		if(playcontrolstate=='play') {
			$('#js-play-btn-main').attr('src','https://gl.helioviewer.org/btaylor/resources/images/playbutton_white1.png');
		} else if(playcontrolstate=='pause') {
			$('#js-play-btn-main').attr('src','https://gl.helioviewer.org/btaylor/resources/images/pausebutton_white1.png');
		}
	});
  
  // opens the Date & Time tab on load
  $('.hv_lefttabs[thistab="hv_datetime_div"]').trigger('click');
  
});
