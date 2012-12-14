var address = 'http://stop-theguessinggame.herokuapp.com:80';//'http://127.0.0.1:8080';
var socket;
var big_screen = null;
var root = 0;
var home = 1;
var room = 2;
var showing_mode = root;
var sub_mode = -1;
var res = 0;
var hr = 0, mr = 1, lr = 2;
var base_dict = {};
var set_dict = {};
var set_root_dict = {};
var set_home_dict = {};
var set_room_dict = {};
var keep_dict = {};
var keep_root_dict = {};
var keep_home_dict = {};
var keep_room_dict = {};
var current_user = -1;
var timer_interval = setInterval(function (){ return false; }, 500);
var stop_enabled = false;
var hinting = false;
var old_name = "";
var old_focus = null;


var current_mode = '.root';
var modes = ['.root', '.home', '.room'];

var chat = 0, new_room = 1;
var home_divs = ['.paper3', '.paper4', '.paper5'];
var home_modes = {
	0: ['.paper3', '.paper4'],
	1: ['.paper5', '.paper4']
}

var rooms = [];

var waiting = 0, playing = 1, checking = 2, scores = 3;
var room_divs = ['.paper6', '.paper7', '.paper8'];
var room_modes = {
	0: ['.paper6'],
	1: ['.paper7'],
	2: ['.paper8'],
	3: ['.paper6'],
	4: ['.paper6'],
}

var hint_messages = {
	'input_nickname': '<p>Write your nickname here and click in start.</p><p> You can change the nickname during the game by clicking on the eraser.</p>'
	,'new_room': '<p>Click here to create a new room.</p><p>It will open a page where you can set the room information.</p>'
	,'room_name': '<p>Write the desired room name here. </p> <p>Maximum of 20 alphanumeric charactes. </p>'
	,'room_rounds': '<p>Write the number of rounds here. </p> <p>The maximum number of rounds is the number of selected letters.</p>'
	,'room_players': '<p>Write the maximum number of players here. </p> <p>If it is 0, there will be no maximum number of players.</p>'
	,'room_stop': '<p>Write the stop time in seconds here. </p> <p>If it is 0, the players can ask stop as soon as they fill all the fields.</p>'
	,'room_check': '<p>Write the checking time in seconds here. </p> <p> If the timer reaches 0, the checking process will end.</p>'
	,'room_interval': '<p>Write the interval time in seconds here. </p> <p> If the timer reaches 0, the interval will end and a new round will start.</p>'
	,'letter_list': '<p>Select the letters that can be randomly selected for the game.</p>'
	,'create_room_categories_text': '<p>Write the categories for the room separated by spaces.</p>'
	,'create_room_submit': '<p>Use this button to create the room.</p>'
	,'create_room_cancel': '<p>Use this button to cancel the room creation.</p>'
	,'submit_login_btn': '<p>Use this button to start the game.</p>'
	,'text_outside': '<p>Write your message here and press enter </p>'
	,'search_room': '<p>Search room by name</p>'
	,'rooms': '<p>Click in a room to join.</p>'
	,'page_navigation': '<p>Navigate in the room list.</p>'
	,'exit_room_1': '<p>Exit room.</p> <p>If you are the only player, the room will be destroyed.</p><p> If you are the leader, another player will be the leader. </p>'
	,'exit_room_2': '<p>Exit room.</p> <p>If you are the only player, the room will be destroyed.</p><p> If you are the leader, another player will be the leader. </p>'
	,'exit_room_3': '<p>Exit room.</p> <p>If you are the only player, the room will be destroyed.</p><p> If you are the leader, another player will be the leader. </p>'
	,'paper_title_1': '<p> This is the room name.</p>' 
	,'paper_title_2': '<p> This is the room name.</p>' 
	,'paper_title_3': '<p> This is the room name.</p>'
	,'ready_play_2': '<p> You can stop after filling all fields and after the timer reaches 0. </p>' 	
	,'ready_play_3': '<p> The checking will finish when all players are ready or when the timer reaches 0. </p>' 	
	,'exit': '<p> Click here to exit game </p>'
	,'current_letter': '<p> This is the current letter of the round </p>'

};


function debug() {
	socket.emit("debug");
};


function update_width(size) {
	return function() {
		var input = $(this),
			parent = input.parent();
		input.width(parent.width() - size);
	}
};

$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

$.fn.transition_hide = function(func) {
	this.clearQueue();
	this.slice(1).transition({left:"-200%"}, "1000");
	$(this[0]).transition({left:"-200%"}, "1000", func);
};

$.fn.update_width = function(size) {
	this.each(update_width(size));
};

$.fn.full_filled = function() {
	var result = true;
	this.find(':input').each(function() {
	   if($(this).val() === "") {
	   		result = false;
	   }
	});
	return result;
};

$.fn.post_it = function(text) {
	this.show();
	$('.close-button').show();
	this.html(text);
	this.css('left', ($(document).width() - 200)/2 + 'px');
	$('.close-button').css('left', this.position().left + this.width() + 'px');
	old_focus = document.activeElement;
	$('.close-button').focus();
}

function errorMessage(data) {
	//alert(data.message);
	$('.overlay').each(function(){
		var obj = $(this);
		obj.show();
		$('.error').post_it('<h1>Error</h1><span class="message">'+data.message+'</span>');
	});
};

function hintMessage(element_id) {
	//alert(data.message);
	hinting = false;
	var message = hint_messages[element_id];
	$('.logo').removeClass('logo2');
	if (message != undefined) {
		$('.overlay').each(function(){
			var obj = $(this);
			obj.show();
			$('.hint_post').post_it('<h1>Hint</h1><span class="message">'+message+'</span>');
		});
	
	}
};

var domOutline = window.DomOutline({ onClick: function(element) {
	if ($(element).hasClass('game_form_input')) {
		hint_messages['current'] = '<p>Write a word for "' + $(element).attr('name') + '" starting with "' + $('.current_letter').text()+'"</p>';
		hintMessage('current');
	} else if ($(element).hasClass('field')) {
		hint_messages['current'] = '<p>Check if the word "' + $(element).find('label').text() + '" is a valid "' + $('.checking_word').text()+'" starting with "'+$('.current_letter').text()+'"</p>';
		hintMessage('current');
	} else if ($(element).hasClass('tooltips')) {
		if (!$(element).html().match(/<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/)) {
			hint_messages['current'] = '<p>Click to edit your nickname</p>';
			hintMessage('current');
		}
	} else {
		hintMessage(element.id);
	}
	
	return false;
}});


function disable() {
	return false;
};

function key_submit(func) {
	return function(e) {
		if (e.which == 13) {
			func(this);
			return false;
		}
	};
};

function submit_login(event) {
	var data = $(".login_form").serialize();
	socket.emit("login", data);
};

function submit_exit(event) {
	socket.emit("exit");
};

function create_new_room(event) {
	var data = $(".create_room_form").serializeObject();
	socket.emit("create_room", data);
	return false;
};

function submit_exit_room(event) {
	if(!hinting) {
		socket.emit("exit_room");	
	}
};

function submit_join_room(event) {
	var id = this.id.split('_')[1];
	socket.emit("join_room", {id: id});
};

function submit_start_game(event) {
	socket.emit("start_game");
}

function submit_ready(event) {
	$('.ready_play').addClass('marked');
	socket.emit("ready");
}

function submit_stop(event) {
	if (stop_enabled) {
		var data = $(".game_form").serializeObject();
		socket.emit("stop", data);
	}
	return false;
}

function submit_change_name() {
	var name = $('.change_name').val();
	socket.emit("change_name", name);
}

function search_room() {
	var search_field = $('.search_room').val();
	$('ul.rooms').html("");
	if (rooms.length == 0 ) {
		$(".no_rooms").show();
		$(".page_container").hide();
	} else {
		$(".page_container").show();
		$(".no_rooms").hide();	
		for (var room_index in rooms) {
			var room = rooms[room_index];
			if (room.name.indexOf(search_field) == -1) {
				continue;
			}
			$('ul.rooms').append(
				'<li class="room_row">' +
					'<a href="#" class="room_link" id="room_' + room.id + '">' +
						'<span class="room_name">' + room.name + '</span>' +
						'<span class="room_players">' + room.user_count + '/' + room.max_players + '</span>' +
						'<span class="room_status">' + room.current_round + '/' + room.rounds + '</span>' +
					'</a>' +
				'</li>'
			);
		}
		$('.page_container').pajinate();
	}
};

function sub_mode_visible(elements, modes) {
	for (var i = 0; i < elements.length; i++) {
		var element = elements[i];
		var found = false;
		for (var j = 0; j < modes[sub_mode].length; j++) {
			found = (found || (element == modes[sub_mode][j]));
		}
		$(element).toggle(found);
	}
};

function set_mode(modes, mode) {
	current_mode = mode;
	$(mode).css("left", "-100%");
	for (var i = 0; i < modes.length; i++) {
		$(modes[i]).toggle((modes[i] == mode)); 
	}
};


function topmove() {
	if (res == lr) {
		$(".leftmove").hide();
		$('.current_letter').css('left', '180px');
		$(".tooltips").css('left', '10px');
		$(".tooltips").css('top', '85px');
		$(".exit").css('left', '230px');
		$(".leftmove").show();
	} else {
		$(".leftmove").hide();
		$('.current_letter').css('left', '200px');
		$(".exit").css('left', ($(document).width() - 250) + 'px');
		$(".tooltips").css('left', ($(document).width() - 200) + 'px');
		$(".tooltips").css('top', '15px');
		$(".leftmove").show();
	}
}



function base() {	
	if ($('.post-it:visible')[0] != undefined) {	
		$('.post-it').css('left', ($(document).width() - 200)/2 + 'px');
		$('.close-button').css('left', $('.post-it:visible').position().left + $('.post-it:visible').width() + 'px');
	}

	var pos_top = $(".chat_inside").position().top;

	$(['.chat_outside', '.text_outside', '.chat_inside', '.text_inside', '.paper_form input[type="text"]', 
		'.paper_form input[type="password"]', ".create_room_categories_text", ".search_room"]).each(function(){
		$(this+ '').update_width(30);
	});

	$('.create_form_input').update_width(120);


    $([[".create_room_categories_text",".paper5"], ['.chat_outside', '.paper3']]).each(function(){
    	var text = $(this[0] + ''), paper = $(this[1] + '');
    	text.css('height', paper.height() - text.position().top - 50 + 'px'); 
    	paper.css('max-height', text.position().top + 300 + 'px');
	    paper.css('height', 'auto');
	    if (paper.is(':visible')) {
	    	if ($('.paper4').height() > paper.height()) {
	    		paper.css('max-height', $('.paper4').height());
	    		paper.height($('.paper4').height());
	    		text.css('height', paper.height() - text.position().top - 50 + 'px'); 
    	
	    	} else {
	    		$('.paper4').height(paper.height());	
	    	}
	    	
	    }
    });
     
    


    $(".chat_inside").each(function(){
    	var obj = $(this);
    	obj.css('height', obj.parents('.paper').height() - obj.position().top - 60 +'px');

    });
    $(['.paper6', '.paper7', '.paper8']).each(function() {
    	var str = this + '';
    	$(str).css('max-height', $(str + ' .tabbable').position().top + Math.max(500,  $(str + ' .users_list').height() + 100) + "px");
		$(str).css('height', 'auto');
		$(str + ' .paper_title').update_width(120);
    });

    $(".paper_title").each(function() {
		var obj = $(this);
		if (obj.height() > 40) {
			obj.css('line-height', 40 + "px");
			obj.css('margin', "0");
		} else {
			obj.css('line-height', 32 + "px");
			obj.css('margin', "0 0 8px");
		}
	});
   
	topmove();
	$('.exit_button').toggle((showing_mode != root));
};

function base_hr() {
	$('.paper').css("min-height", "0");
	$('.paper').css("top", "90px");
	topmove();
	$('body').css("overflow-x", "hidden");	
	$(".tooltips").css('top', '15px');
	$('.paper').css("width", '40%');
	$('.paper').each(function() {
		var obj = $(this),
			width = obj.width();
		obj.css('min-height', Math.min(width * 1.3, $(window).height() - obj.position().top - 50) + 'px');
		
	});

	base();
};

function base_mr() {
	$('body').css("overflow-x", "auto");	
	topmove();
	$('.paper').css("height", "auto");
	$('.paper').css("min-height", "0");
	$('.content').height($(document).height());
	$('.content').css('height', 'auto');
	var width = $(window).width(), 
		h = $(document).height() - 240,
		w = width - 110;
	$('.paper').css("min-height", h +"px");
	$('.paper').css("width", w +"px");
	base();
};

function base_lr() {
	$('body').css("overflow-x", "auto");	
	topmove();
	$('.paper').css("height", "auto");
	$('.paper').css("min-height", "0");
	$('.content').height($(document).height());
	$('.content').css('height', 'auto');
	var width = $(window).width(), 
		h = $(document).height() - 240,
		w = width - 70;
	$('.paper').css("min-height", h +"px");
	$('.paper').css("width", w +"px");
	base();
};

function focus_root() {
	if ($('.paper2').hasClass('active')) {
		$('#input_nickname')[0].focus();
	}
}

function focus_home() {
	if (!$('.paper5').hasClass('active')) {
		$('#new_room')[0].focus();
	} else {
		$('#room_name')[0].focus();
	}
}

function focus_room(){
	if (sub_mode == 0 || sub_mode == 3) {
		$('.scores .ready_play')[0].focus();
	} else if (sub_mode == 1) {
		$(".game_form input:text:visible:first").focus();
	} else if (sub_mode == 2) {
		$(".check_form input:visible:first").focus();
	} 
}

function set_root_hr(){
	
	$('.paper').transition_hide(function() {
		base_hr();
		showing_mode = root;
		set_mode(modes, '.root');
		$('.paper1').transition({"left": "2%"});
		$('.paper2').transition({"left": "52%"});
		base_hr();
		focus_root();
	});
};

function keep_root_hr(){
	base_hr();
	$('.paper1').css('left', '2%');
	$('.paper2').css('left', '52%');
	base_hr();
};

function set_home_hr(){
	
	$('.paper').transition_hide(function() {
		base_hr();
		showing_mode = home;
		set_mode(modes, '.home');
		sub_mode_visible(home_divs, home_modes);
		$('.paper3').transition({"left": "52%"});
		$('.paper5').transition({"left": "52%"});
		$('.paper4').transition({"left": "2%"});
		base_hr();
		focus_home();
	});
};

function keep_home_hr(){
	base_hr();
	sub_mode_visible(home_divs, home_modes);
	$('.paper3').css('left', '52%');
	$('.paper5').css('left', '52%');
	$('.paper4').css('left', '2%');
	base_hr();
};

function set_room_hr(){
	
	$('.paper').transition_hide(function() {
		base_mr();
		showing_mode = room;
		set_mode(modes, '.room');
		sub_mode_visible(room_divs, room_modes);
		$('.paper').css("top", "90px");
		$('.paper').transition({"left": "30px"});
		base_mr();
		focus_room();
	});
};

function keep_room_hr(){
	base_mr();
	sub_mode_visible(room_divs, room_modes);
	$('.paper').css("top", "90px");
	$('.paper').css("left", "30px");
	base_mr();
};

function set_root_mr() {
	
	$('.paper').transition_hide(function() {
		base_mr();
		$('.root .paper:not(.active)').css('z-index', 0);
		$('.root .paper.active').css('z-index', 2);
		showing_mode = root;
		set_mode(modes, '.root');
		$('.root .paper:not(.active)').css("top", "90px");
		$('.root .paper.active').css("top", "140px");
		$('.root .paper:not(.active)').css("rotate", "0");
		$('.paper').transition({"left": "30px"});
		base_mr();
		focus_root();
	});
};

function keep_root_mr(){
	base_mr();
	$('.root .paper:not(.active)').css("top", "90px");
	$('.root .paper.active').css("top", "140px");
	$('.paper').css("left", "30px");
	base_mr();
};

function set_home_mr() {
	
	$('.paper').transition_hide(function() {
		base_mr();
		$('.home .paper:not(.active)').css('z-index', 2);
		$('.home .paper.active').css('z-index', 3);
		$('.home .paper:not(.active)').css("top", "90px");
		$('.home .paper.active').css("top", "140px");
		showing_mode = home;
		set_mode(modes, '.home');
		sub_mode_visible(home_divs, home_modes);
		$('.paper').transition({"left": "30px"});
		base_mr();
		focus_home();
	});
};

function keep_home_mr(){
	base_mr();
	sub_mode_visible(home_divs, home_modes);
	$('.home .paper:not(.active)').css("top", "90px");
	$('.home .paper.active').css("top", "140px");
	$('.home .paper.active').css('z-index', 3);
	$('.paper').css("left", "30px");
	base_mr();
};

set_room_mr = set_room_hr;

keep_room_mr = keep_room_hr;

function set_root_lr() {
	
	$('.paper').transition_hide(function() {
		base_lr();
		$('.root .paper:not(.active)').css('z-index', 0);
		$('.root .paper.active').css('z-index', 2);
		$('.root .paper:not(.active)').css("top", "155px");
		$('.root .paper.active').css("top", "205px");
		$('.root .paper:not(.active)').css("rotate", "0");
		showing_mode = root;
		set_mode(modes, '.root');
		$('.paper').transition({"left": "10px"});
		base_lr();
		focus_root();
	});
};

function keep_root_lr(){
	base_mr();
	$('.root .paper:not(.active)').css("top", "155px");
	$('.root .paper.active').css("top", "205px");
	$('.paper').css("left", "10px");
	base_mr();
}

function set_home_lr() {
	
	$('.paper').transition_hide(function() {
		base_lr();
		$('.home .paper:not(.active)').css('z-index', 2);
		$('.home .paper.active').css('z-index', 3);
		$('.home .paper:not(.active)').css("top", "155px");
		$('.home .paper.active').css("top", "205px");
		showing_mode = home;
		set_mode(modes, '.home');
		sub_mode_visible(home_divs, home_modes);
		$('.paper').transition({"left": "10px"});
		base_lr();
		focus_home();

	});
};

function keep_home_lr(){
	base_lr();
	sub_mode_visible(home_divs, home_modes);
	$('.home .paper:not(.active)').css("top", "155px");
	$('.home .paper.active').css("top", "205px");
	$('.paper').css("left", "10px");
	base_lr();
};

function set_room_lr() {
	
	$('.paper').transition_hide(function() {
		base_lr();
		showing_mode = room;
		set_mode(modes, '.room');
		sub_mode_visible(room_divs, room_modes);
		$('.paper').css("top", "155px");
		$('.paper').transition({"left": "10px"});
		base_lr();
		focus_room();
	});
};

function keep_room_lr(){
	base_lr();
	sub_mode_visible(room_divs, room_modes);
	$('.paper').css("top", "155px");
	$('.paper').css("left", "10px");
	base_lr();
};

function high_resolution() {
	return  ($(window).width()>= 768);
};

function low_resolution() {
	return  ($(window).width()<= 480);
};

function get_res() {
	if (high_resolution()) {
		return hr;	
	} else if (!low_resolution()) {
		return mr;	
	} else {
		return lr;	
	} 
}


base_dict[hr] = base_hr;
base_dict[mr] = base_mr;
base_dict[lr] = base_lr;



keep_root_dict[hr] = keep_root_hr;
keep_root_dict[mr] = keep_root_mr;
keep_root_dict[lr] = keep_root_lr;

keep_home_dict[hr] = keep_home_hr;
keep_home_dict[mr] = keep_home_mr;
keep_home_dict[lr] = keep_home_lr;

keep_room_dict[hr] = keep_room_hr;
keep_room_dict[mr] = keep_room_mr;
keep_room_dict[lr] = keep_room_lr;

set_root_dict[hr] = set_root_hr;
set_root_dict[mr] = set_root_mr;
set_root_dict[lr] = set_root_lr;

set_home_dict[hr] = set_home_hr;
set_home_dict[mr] = set_home_mr;
set_home_dict[lr] = set_home_lr;

set_room_dict[hr] = set_room_hr;
set_room_dict[mr] = set_room_mr;
set_room_dict[lr] = set_room_lr;

keep_dict[root] = keep_root_dict;
keep_dict[home] = keep_home_dict;
keep_dict[room] = keep_room_dict;

set_dict[root] = set_root_dict;
set_dict[home] = set_home_dict;
set_dict[room] = set_room_dict;

function move_paper_low(base) {
	return function() {
		var p_active = $(base + ' .paper.active:visible'),
			p_inactive = $(base + ' .paper:not(.active):visible'),
			pa_left = p_active.position().left,
			pa_top = p_active.position().top,
			pi_top = p_inactive.position().top;	
		p_active.transition({
			top: pi_top
		});
		p_inactive.transition({ 
			left: "-200%"
		}, function() {
			p_active.css('z-index', 1);
			p_inactive.css('z-index', 2);
			p_inactive.transition({ 
				left: pa_left,
				top: pa_top
			});
			p_active.removeClass('active');
			p_inactive.addClass("active");
		});
	}
		
}

function move_paper_root(base) {
	return function() {
		var p_active = $(base + ' .paper.active'),
			p_inactive = $(base + ' .paper:not(.active)'),
			pa_left = p_active.position().left,
			pa_top = p_active.position().top,
			pi_top = p_inactive.position().top;	
		if (high_resolution()) {
			p_active.transition({
				rotate: "-20deg",
				left: "15%"
			});
			p_inactive.transition({
				rotate: '0deg',
				left: "-40%"
			}, function() {
				p_active.css('z-index', 1);
				p_inactive.css('z-index', 2);
				p_inactive.transition({ 
					left: '31.5%'
				});
				p_active.removeClass('active');
				p_inactive.addClass("active");
			})
		} else {
			move_paper_low(base)();
		}
	};
	
};


function to_home() {
	sub_mode = chat;
	set_dict[home][res]();
};

function to_root() {
	sub_mode = -1;
	set_dict[root][res]();
};

function to_room(data) {
	sub_mode = data.game.status;
	set_dict[room][res]();
};

function resize() {
	keep_dict[showing_mode][res]();
	if(this.resizeTO) clearTimeout(this.resizeTO);
    this.resizeTO = setTimeout(function() {
        resize_end();
    }, 500);
    base();
};

function resize_end() {
	$('.paper').clearQueue();
	var new_res = get_res();
	if (res == new_res) {
		keep_dict[showing_mode][res]();
	} else {
		$('.paper').hide();
		res = new_res;
		set_dict[showing_mode][res]();
	}
};

$(document).ready(function() {
	socket = io.connect(address);
	$(window).resize(resize);
	$(".logo").tooltip({placement: 'bottom', title: 'Enable\\Disable Hint mode'});
	$(".root .paper:not(.active)").live('click', function(){
		if (!high_resolution()) {
			move_paper_low('.root')();
		}
	});

	//move_paper_root('.root'));
	$(".home .paper:not(.active)").live('click', function(){
		if (!high_resolution()) {
			move_paper_low('.home')();
		}
	});
		//move_paper("paper1", "paper2", "-20deg", "15%", "-40%", "31.5%", low_move_paper1));
	//$(".paper3").live('click', move_paper2("paper3", "paper4", low_move_paper1));
	
	$(".chat_outside").keydown(disable);
	$(".chat_inside").keydown(disable);

	socket.on("error", function(data) {
		errorMessage(data);	
	});

	socket.on("success", function(data) {
		if (data.code == "0") { //login
		}
	});

	socket.on("logged_in", function(data) {
		$(".chat_outside").html("");
		$(".chat_inside").html("");
		old_name = data.user.nickname;
		$(".tooltips").html(data.user.nickname);
		if ($('#room_name').val() == "") {
			$('#room_name').val(data.user.nickname + "'s room");	
		}
		current_user = data.user.id;
		if (data.update) {
			to_home();
		}
	});

	socket.on("logged_out", function(data) {
		current_user = -1;
		if (showing_mode != root) {
			to_root();	
		}
		$(".tooltips").html("<br>");
	});

	socket.on("room_update", function(data) {
		if (data.update) {
			$('.ready_play').removeClass('marked');	
		}
		
		$('.current_round').text('Round ' + data.room.current_round + '/' + data.room.rounds);
		$('.room .paper_title').text(data.room.name);
		$('.score-list').html('');
		var leader = false; 
		for (var user_id in data.room.users) {
			var user = data.room.users[user_id];
			$('.score-list').append(
				'<tr class="user_in_list'+ (user.leader? ' leader': "") + (user.ready? ' ready_user': "") +'">'+
					'<td class="player_name">' + user.nickname + '</td>' +
					'<td class="player_score">' + user.score + '</td>' +
				'</tr>'
			);
			if (user_id == current_user && user.leader) {
				leader = true;
				if (user.ready){

					$('.ready_play').addClass('marked');
				}
			}
		}
		if (data.update) {

			if (data.room.game.status == 0) {
				$('.current_letter').text('?');
				$('.scores .time_text').text('');
				if (leader) {
					$('.scores .ready_play').css('visibility', 'visible');
					$('.scores .ready_play').text('Play');
					hint_messages['ready_play_1'] = '<p> Click in this button to start the game </p>';
				} else {
					$('.scores .ready_play').css('visibility', 'hidden');
				}
			}
			if (data.room.game.status == 1) {
				$('.current_letter').text(data.room.game.letter);
				$('.phrase_letter').text(data.room.game.letter);
				$('.playing .time_text').html('<span class="time-number"></span>s remaining');
				$('.playing .ready_play').css('visibility', 'visible');
				$('.playing .ready_play').text('Stop!');
				$('.game_form').html("");
				for (var category_id in data.room.categories) {
					var category = data.room.categories[category_id];
					$('.game_form').append(
						'<div class="field">' +
							'<label class="game_form_label" for="game_form_' + category + '">' + category + ': </label>' +
							'<input class="game_form_input hint" id="game_form_' + category + '" type="text" name="' + category + '"></input>' +
						'</div>'
					);
					
				}
				$('.game_form').append('<div class="clear"></div>');
				clearInterval(timer_interval);
				timer_interval = setInterval(function (){
					socket.emit("get_timer");
				}, 500);
				stop_enabled = false;
				$('.playing .ready_play').addClass("disabled");		
			}
			if (data.room.game.status == 2) {
				$('.current_letter').text(data.room.game.letter);
				$('.phrase_letter').text(data.room.game.letter);
				$('.checking_word').text(data.room.game.category);
				$('.checking .time_text').html('<span class="time-number"></span>s remaining');
				$('.checking .ready_play').css('visibility', 'visible');
				$('.checking .ready_play').text('Ready');
				$('.check_form').html("");
				for (var word in data.room.game.words) {
					$('.check_form').append(
						'<div class="field hint">' +
							'<input class="check_form_input" id="check_form_' + word + '" type="checkbox" name="' + word + '"></input>' +
							'<label class="check_form_label" for="check_form_' + word + '">' + word + '</label>' +
						'</div>'
					);
				}
				$('.check_form').append('<div class="clear"></div>');
				clearInterval(timer_interval);
				timer_interval = setInterval(function (){
					socket.emit("get_timer");
				}, 500);
			}
			if (data.room.game.status == 3) {
				$('.current_letter').text('?');
				$('.scores .time_text').html('<span class="time-number"></span>s remaining');
				$('.scores .ready_play').text('Ready');
				hint_messages['ready_play_1'] = '<p>The game will start when all players are ready or when the timer reaches 0.</p>';
				$('.scores .ready_play').css('visibility', 'visible');
				clearInterval(timer_interval);
				timer_interval = setInterval(function (){
					socket.emit("get_timer");
				}, 500);
			}
			if (data.room.game.status == 4) {
				$('.current_letter').text('?');
				$('.scores .time_text').text('Game finished!');
				$('.scores .ready_play').css('visibility', 'hidden');
			}
			to_room(data.room);	
		}
	});

	socket.on("update_timer", function(data) {
		$('.time-number').text(data);
		if (sub_mode == 1) {
			if (data == 0) {
				if ($('.game_form').full_filled()) {
					$('.time_text').text('You can stop now!');
					$('.playing .ready_play').removeClass("disabled");
					stop_enabled = true;
				} else {
					$('.time_text').text('Fill all the fields!');
					$('.playing .ready_play').addClass("disabled");		
					stop_enabled = false;
				}
			} 
		}
		
	});

	socket.on("exit_room", function(data){
		$(".chat_inside").html("");
		to_home();
	});

	socket.on("update_rooms", function(data){
		rooms = data.rooms;
		search_room();
	});

	socket.on('delete_timer_interval', function(data) {
		clearInterval(timer_interval);
	});

	socket.on('stop_request', function(data) {
		var data = $(".game_form").serializeObject();
		socket.emit("stop_response", data);
	});

	socket.on('check_request', function(data) {
		var data = $(".check_form").serializeObject();
		socket.emit("next_response", data);
	});

	//Login
	$("#submit_login_btn").click(submit_login);
	$(".login_form input").keypress(key_submit(submit_login));

	//Exit
	$(".exit_button").click(function(){
		if (!hinting) {
			return submit_exit();	
		}
	});

	//Chat outside
	$(".text_outside").keypress(key_submit(function(){
		socket.emit("chat_outside", $('.text_outside').val());
		$('.text_outside').val("");
	}));

	//Chat inside
	$(".text_inside").keypress(key_submit(function(element){
		socket.emit("chat_inside", $(element).val());
		$(element).val("");
	}));

	socket.on("chat_outside", function(data) {
		$(".chat_outside").each(function(){
			$(this).append(data+'\n');
			this.scrollTop = this.scrollHeight;
		});

	});

	socket.on("chat_inside", function(data) {
		$(".chat_inside").each(function(){
			$(this).append(data+'\n');
			this.scrollTop = this.scrollHeight;
		});
	});

	socket.on("new_session", function(data) {
		$('.logo').tooltip('show');
	});



	socket.on("debug", function(data) {
		console.log(data);
	});

	//New room
	$(".new_room").click(function(){
		if(!hinting) {
			$('.paper4').removeClass('active');
			$('.paper3').removeClass('active');
			$('.paper5').addClass('active');
			if (sub_mode != new_room) {
				
				sub_mode = new_room;
				set_dict[home][res]();
			}	
		}
	});

	//Create room
	$(".letters_label").click(function(){
		if (!hinting) {
			$('.how_many_selected').text('');
			var precount = $('.letters').filter(':checked').length;
			var obj = $(this), 
				element = "#"+obj.attr("for");
			if (!$(element).prop('checked')) {
				obj.css('color', '#FFF');
				obj.css('background-color', '#333');
				if (precount == 25) {
					$('.how_many_selected').text('(All selected)');
				} else {
					$('.how_many_selected').text('('+(precount+1)+' selected)');
				}
			} else {
				obj.css('color', '#000');
				obj.css('background-color', '#EEE');
				
				if (precount == 1) {
					$('.how_many_selected').text('(None selected)');
				} else {
					$('.how_many_selected').text('('+(precount-1)+' selected)');
				}
			};
			$(element).change();
		
		}

		
	});

	$(".create_room_cancel").click(function(){
		if (!hinting) {
			$('.paper4').toggleClass('active', false);
			$('.paper3').toggleClass('active', true);
			$('.paper5').toggleClass('active', false);
			if (sub_mode != chat) {
				sub_mode = chat;
				set_dict[home][res]();
			}
			return false;
		}
	});

	$('.create_room_form input').keypress(key_submit(create_new_room));
	$(".create_room_submit").click(function(){
		if (!hinting) {
			return create_new_room();	
		}
		
	});

	//Exit room
	$(".exit_room").click(submit_exit_room);

	//Search room
	$(".search_room").keypress(key_submit(disable));
	$(".search_room").keyup(search_room);

	//Join room
	$('.room_link').live('click',submit_join_room);

	//Start game
	$('.scores .ready_play').click(function() {
		if (!hinting) {
			if (sub_mode == 0) {
				return submit_start_game();
			} else {
				return submit_ready();
			}	
		}
	});

	//Stop
	$('.playing .ready_play').click(function(){
		if (!hinting) {
			return submit_stop();	
		}
	});
	$(".game_form").keypress(key_submit(submit_stop));

	//Ready
	$('.checking .ready_play').click(function(){
		if(!hinting) {
			return submit_ready();	
		}
	});

	//Change name
	$('.tooltips').click(function(){
		if (!hinting && showing_mode != root) {
			if (!$(this).html().match(/<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/)) {
				old_name = $(this).html();
				$(this).html('<input type="text" class="change_name" value="'+old_name+'"></input>');
				$('.change_name').focus();
			}	
		}
		
	});

	$('.change_name').live('keypress', key_submit(submit_change_name));
	$('.change_name').live('blur', submit_change_name);


	$('.logo').click(function(){
		if (!hinting) {
			$('.logo').addClass('logo2');
			domOutline.start();
		} else {
			$('.logo').removeClass('logo2');
			domOutline.stop();
		}
		hinting = !hinting;
		
	});

	function hide_overlay() {
		$('.overlay').hide();
		$('.post-it').hide();
		$('.close-button').hide();
		old_focus.focus();
		return false;
	};

	$('.overlay').click(hide_overlay);
	$('.post-it').click(hide_overlay);
	$('.close-button').click(hide_overlay);

	res = get_res();
	base_dict[res]();
	set_dict[root][res]();
	$('.page_container').pajinate();
	//sub_mode = 0;
	//set_dict[room][res]();


});



