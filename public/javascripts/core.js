var app = angular.module('todoApp', ['ngRoute'], function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

app.controller('todoListController', todoListController);
function todoListController($scope, $http)
{
	var timer = new Timer();
	var timer_status = "run";

    $scope.todos = [];
    $scope.countdown = '';
    $scope.active_todo_name = '';
    $scope.timer_status = "Pause";
    $scope.timer_icon = "pause";
    $scope.timer_started = false;

    $scope.getToDoList = function()
    {
    	var local_todo = JSON.parse(localStorage.getItem('todos'));
    	if ( local_todo ) {
    		$scope.todos = local_todo;
    	}
    }

    $scope.addNewTodo = function()
    {
    	// add new to do to our todos array
    	var todo = {
    		'name': $scope.newtodo,
    		'hours': $scope.hours,
    		'mins': $scope.mins,
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
    }

    $scope.removeTodo = function(index)
    {
    	// remove todo by index
    	$scope.todos.splice(index, 1);
    	localStorage.setItem('todos', JSON.stringify($scope.todos));
    }

    $scope.startTimer = function(index)
    {
    	// start todo by index
    	var todo = JSON.parse(localStorage.getItem('todos'));

    	var select_todo = todo[index];

    	// Set active/running todo
    	localStorage.setItem('active_todo', JSON.stringify(select_todo));

    	var mins = parseInt(select_todo.mins);
    	var hours = parseInt(select_todo.hours);

    	var start_values = { minutes:mins,hours:hours };

		timer.start({countdown: true, startValues: start_values});
		document.getElementById('countdown_timer').innerHTML = timer.getTimeValues().toString();
		$scope.active_todo_name = select_todo.name;

		$scope.timer_started = true;

		timer.addEventListener('secondsUpdated', function (e) {
		    document.getElementById('countdown_timer').innerHTML = timer.getTimeValues().toString();
		});

		timer.addEventListener('targetAchieved', function (e) {
		    console.log('done!');
		    // Notification
		});
    }

    $scope.stopTimer = function()
    {
    	timer.stop();
    	$scope.timer_started = false;
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
    	console.log('Timer: ' + timer_status);
    }
}