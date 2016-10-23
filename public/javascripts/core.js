var app = angular.module('todoApp', ['ngRoute'], function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

app.controller('todoListController', todoListController);
function todoListController($scope, $http)
{
	var timer = "";
	var timer_status = "run";

    $scope.todos = [];
	$scope.newtodo = '';
	$scope.hours = 0;
	$scope.mins = 1;
    $scope.countdown = '';
    $scope.active_todo_name = '';
    $scope.timer_status = "Pause";
    $scope.timer_icon = "pause";
    $scope.timer_started = false;
    $scope.timer_paused = false;

    $scope.getToDoList = function()
    {
    	var local_todo = JSON.parse(localStorage.getItem('todos'));
    	if ( local_todo ) {
    		$scope.todos = local_todo;
    	}
    	setTimeout(checkActiveTodo, 10);
    	notifyMe();
    }

    $scope.addNewTodo = function()
    {
    	// add new to do to our todos array
    	var todo = {
    		'name': $scope.newtodo,
    		'hours': $scope.hours,
    		'mins': $scope.mins,
    		'secs': 0
    	};
    	$scope.todos.push( todo );

    	var local_todo = localStorage.getItem('todos');
    	if ( local_todo ) {
    		local_todo = JSON.parse(local_todo);
    		local_todo.push( todo );
    		localStorage.setItem('todos', JSON.stringify(local_todo));
    	} else {
    		localStorage.setItem('todos', JSON.stringify($scope.todos));
    	}

    	// clear textbox
    	$scope.newtodo = '';
    	$scope.hours = 0;
    	$scope.mins = 1;

    	return false;
    }

    $scope.removeTodo = function(index)
    {
    	// remove todo by index
    	$scope.todos.splice(index, 1);
    	localStorage.setItem('todos', JSON.stringify($scope.todos));
    }

    $scope.startTimer = function(index, event)
    {
    	// start todo by index
    	var todo = JSON.parse(localStorage.getItem('todos'));
    	var select_todo = todo[index];
    	var timer_btn = angular.element( event.target );

    	// Set active/running todo
    	var active = {
			'index': index,
			'todo': select_todo
		};
    	localStorage.setItem('active_todo', JSON.stringify(active));
    	initiateEasyTimer(select_todo, timer_btn);
    }

    $scope.stopTimer = function()
    {
    	resetTimer();
    	timer.stop();
    	$scope.timer_started = false;
    	$scope.active_todo_name = '';
    	console.log('Timer stopped!');
    }

    $scope.pauseResumeTimer = function()
    {
    	if ( timer_status == "run" ) {
    		timer.pause();
    		timer_status = "paused";
    		$scope.timer_icon = "play";
    		$scope.timer_status = "Resume";
    	} else if ( timer_status == "paused" ) {
    		timer.start();
    		timer_status = "run";
    		$scope.timer_icon = "pause";
    		$scope.timer_status = "Pause";
    	}
    }

    function initiateEasyTimer(select_todo, timer_btn) {
    	var mins = parseInt(select_todo.mins);
    	var hours = parseInt(select_todo.hours);
    	var secs = parseInt(select_todo.secs);

    	var start_values = { seconds:secs,minutes:mins,hours:hours };

    	// @TODO: Effectively create a function for checking pause and resume function;
    	if ( timer_status == "run" && $scope.timer_paused == false) {
    		timer = new Timer();
    	}

    	console.log(timer_status);
    	console.log($scope.timer_paused);

    	if ( timer_status == "run" && $scope.timer_paused == false) {
    		timer.start({countdown: true, startValues: start_values});
    		timer_btn.addClass('active-task');
    		timer_btn.removeClass('fa-play').addClass('fa-pause');
    		timer_status = "run";
    		$scope.timer_icon = "pause";
    		$scope.timer_status = "Pause";
    		$scope.timer_paused = false;
    		console.log('Timer started');
    	} else {
    		timer.pause();
    		timer_btn.removeClass('fa-pause').addClass('fa-play');
    		timer_status = "paused";
    		$scope.timer_icon = "play";
    		$scope.timer_status = "Resume";
    		$scope.timer_paused = true;
    		console.log('Timer paused');
    	}

    	$scope.active_todo_name = select_todo.name;
    	document.getElementById('todo_name').innerHTML = select_todo.name;
    	showCountdownTimer();
		timerDone();
    }

    function showCountdownTimer() {
    	document.getElementById('countdown_timer').innerHTML = timer.getTimeValues().toString();

		$scope.timer_started = true;

		timer.addEventListener('secondsUpdated', function (e) {
		    document.getElementById('countdown_timer').innerHTML = timer.getTimeValues().toString();

		    var active_todo = JSON.parse(localStorage.getItem('active_todo'));
	    	if ( active_todo ) {
	    		active_todo.todo.hours = timer.getTimeValues().hours;
	    		active_todo.todo.mins = timer.getTimeValues().minutes;
	    		active_todo.todo.secs = timer.getTimeValues().seconds;
		    	localStorage.setItem('active_todo', JSON.stringify(active_todo));
	    	}
		});
    }

    function timerDone() {
    	timer.addEventListener('targetAchieved', function (e) {
    		setTimeout(nextTodo, 1500);

		    // Notification
		    var options = {
		        body: "Hey there! Your latest task has now expired!",
		        sound: "audio/alert.mp3"
		    }
		    var notification = new Notification( 'Taymer', options );
		    var audio = new Audio('audio/alert.mp3');
			// audio.play();
		});
    }

    function resetTimer() {
    	var active = document.getElementsByClassName('action-btn');
		angular.element(active).removeClass('active-task fa-pause').addClass('fa-play');
    }

    function nextTodo() {
    	var active_todo = JSON.parse(localStorage.getItem('active_todo'));
    	var new_index = parseInt(active_todo.index) + 1;
    	var todo = JSON.parse(localStorage.getItem('todos'));
    	var select_todo = todo[new_index];
    	var active = document.getElementsByClassName('active-task');
    	var next_btn = angular.element(active).parents('.ng-scope').next().find('.fa-play');

    	// Check if there's a next task on the list
    	if ( todo.length > new_index ) {
    		var active = {
    			'index': new_index,
    			'todo': select_todo
    		};
	    	localStorage.setItem('active_todo', JSON.stringify(active));

	    	$scope.stopTimer();
	    	initiateEasyTimer(select_todo, next_btn);

	    	var options = {
		        body: "Started next task."
		    }
		    var notification = new Notification( 'Taymer', options );
	    } else {
	    	$scope.stopTimer();
	    	$scope.timer_started = false;
	    	localStorage.removeItem('active_todo');
	    	var running_todo_bar = document.getElementById('running_todo');
    		angular.element(running_todo_bar).addClass('ng-hide');
	    }
    }

    function notifyMe() {
    	if (!("Notification" in window)) {
			alert("This browser does not support desktop notification");
		}
		// Let's check whether notification permissions have already been granted
		else if (Notification.permission === "granted") {
			return true;
		}

		// Otherwise, we need to ask the user for permission
		else if (Notification.permission !== 'denied') {
			Notification.requestPermission(function (permission) {
			// If the user accepts, let's create a notification
			if (permission === "granted") {
				return true;
			}
			});
		}
    }

    function checkActiveTodo()
    {
    	var active_todo = JSON.parse(localStorage.getItem('active_todo'));
    	if ( active_todo ) {
    		var active_element = "todokey_" + active_todo.index;
    		var active_btn = document.getElementById(active_element);
    		$scope.timer_started = true;
    		$scope.active_todo_name = active_todo.name;
    		var running_todo_bar = document.getElementById('running_todo');
    		angular.element(running_todo_bar).removeClass('ng-hide');
    		initiateEasyTimer(active_todo.todo, angular.element(active_btn).find('.action-btn'));
    	}
    }
}