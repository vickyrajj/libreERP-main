app.controller('projectManagement.Attendance.Calendar', function($scope, $state, $users, $stateParams, $http, Flash, $timeout) {
  $scope.me = $users.get('mySelf');
  $scope.userform = {
    user: $scope.me
  }
  $scope.getUserAttendance = function() {
    $http({
      method: 'GET',
      url: '/api/Attendance/fetchAttendance/?user=' + $scope.userform.user.pk + '&date=' + $scope.dateDisp.toJSON().split('T')[0],
    }).
    then(function(response) {
      console.log(response.data,'resssssssssssss');
      $scope.values = response.data.valList
      $scope.timeList = response.data.timeList
    })
    // console.log($scope.dateDisp, '7777777777777777');
    // console.log($scope.userform);
  }


  // $scope.refreshList = function() {
  //   for (var i = 0; i < 42; i++) {
  //     if ($scope.dates[i] == $scope.dateDisp.getDate() && $scope.dateFlags[i] == 'Cur') {
  //       $scope.showDay(i);
  //     }
  //   }
  // }

  // $scope.listOfMonths = [{
  //     "val": 0,
  //     "disp": "January"
  //   }, {
  //     "val": 1,
  //     "disp": "February"
  //   }, {
  //     "val": 2,
  //     "disp": "March"
  //   }, {
  //     "val": 3,
  //     "disp": "April"
  //   }, {
  //     "val": 4,
  //     "disp": "May"
  //   },
  //   {
  //     "val": 5,
  //     "disp": "June"
  //   }, {
  //     "val": 6,
  //     "disp": "July"
  //   }, {
  //     "val": 7,
  //     "disp": "August"
  //   }, {
  //     "val": 8,
  //     "disp": "September"
  //   }, {
  //     "val": 9,
  //     "disp": "October"
  //   }, {
  //     "val": 10,
  //     "disp": "November"
  //   },
  //   {
  //     "val": 11,
  //     "disp": "December"
  //   }
  // ];


  // $scope.setMonth = function(mnth) {
  //   $scope.dropMonth = mnth;
  //   $scope.gotoPerticular()
  // }

  // $scope.setYear = function(year) {
  //   $scope.dropYear = year;
  //   $scope.gotoPerticular()
  // }

  // $scope.listOfYears = [{
  //   "val": 2015,
  //   "disp": "2015"
  // }, {
  //   "val": 2016,
  //   "disp": "2016"
  // }, {
  //   "val": 2017,
  //   "disp": "2017"
  // }, {
  //   "val": 2018,
  //   "disp": "2018"
  // }, {
  //   "val": 2019,
  //   "disp": "2019"
  // }];


  $scope.listOfDays = [{
      "val": 1,
      "disp": "Sunday"
    }, {
      "val": 1,
      "disp": "Monday"
    }, {
      "val": 1,
      "disp": "Tuesday"
    }, {
      "val": 1,
      "disp": "Wednesday"
    }, {
      "val": 1,
      "disp": "Thursday"
    },
    {
      "val": 1,
      "disp": "Friday"
    }, {
      "val": 1,
      "disp": "Saturday"
    }
  ];

  var calDate = new Date(); // the current date value known to the calendar, also the selected. For a random month its 1st day of that month.
  var calMonth = calDate.getMonth(); // in MM format
  var calYear = calDate.getFullYear(); // in YYYY format

  $scope.itemInView = [];
  datesMap = getDays(calMonth, calYear);
  $scope.dates = datesMap.days;
  $scope.dateFlags = datesMap.flags;
  $scope.dateDisp = calDate;
  $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp; // Find equivalent day name from the index
  $scope.getUserAttendance()
  // $scope.dropYear = {
  //   "val": calYear,
  //   "disp": ""
  // }; // year selected in the drop down menu
  // $scope.dropMonth = {
  //   "val": calMonth,
  //   "disp": ""
  // }; // Month selected in the drop down menu

  // $scope.showDay = function(input) {
  //
  //   if (datesMap.flags[input] == "Cur") {
  //     $scope.calDate = calDate.setFullYear(calYear, calMonth, $scope.dates[input]);
  //     $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
  //     $scope.dateDisp = calDate;
  //   } else if (datesMap.flags[input] == "Prev") {
  //     var selectedDate = $scope.dates[input];
  //     $scope.gotoPrev();
  //     $scope.calDate = calDate.setFullYear(calYear, calMonth, selectedDate);
  //     $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
  //     $scope.dateDisp = calDate;
  //   } else if (datesMap.flags[input] == "Next") {
  //     var selectedDate = $scope.dates[input];
  //     $scope.gotoNext();
  //     $scope.calDate = calDate.setFullYear(calYear, calMonth, selectedDate);
  //     $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
  //     $scope.dateDisp = calDate;
  //   };
  //   $scope.dayClicked($scope.itemsGroup[input]);
  // };

  // $scope.refreshItems = function() {
  //   $scope.itemsGroup = [];
  //   for (var i = 0; i < 42; i++) {
  //     $scope.itemsGroup.push([])
  //   }
  //   for (var i = 0; i < 42; i++) {
  //     for (var j = 0; j < $scope.dayItems.length; j++) {
  //       d = $scope.dayItems[j].date;
  //       if ($scope.dateFlags[i] == 'Cur') {
  //         if ($scope.dateDisp.getFullYear() == d.getFullYear() && $scope.dateDisp.getMonth() == d.getMonth() && $scope.dates[i] == d.getDate()) {
  //           $scope.itemsGroup[i].push(j)
  //         }
  //       } else if ($scope.dateFlags[i] == 'Next') {
  //         if ($scope.dateDisp.getFullYear() == d.getFullYear() && $scope.dateDisp.getMonth() + 1 == d.getMonth() && $scope.dates[i] == d.getDate()) {
  //           $scope.itemsGroup[i].push(j)
  //         }
  //       } else if ($scope.dateFlags[i] == 'Prev') {
  //         if ($scope.dateDisp.getFullYear() == d.getFullYear() && $scope.dateDisp.getMonth() - 1 == d.getMonth() && $scope.dates[i] == d.getDate()) {
  //           $scope.itemsGroup[i].push(j)
  //         }
  //       }
  //     }
  //   }
  //   console.log($scope.itemsGroup);
  //   console.log($scope.dayItems);
  // };

  $scope.gotoToday = function() {
    var calDate = new Date(); // current day
    calMonth = calDate.getMonth();
    calYear = calDate.getFullYear();
    $scope.dateDisp = calDate;
    $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
    datesMap = getDays(calMonth, calYear);
    $scope.dates = datesMap.days;
    $scope.dateFlags = datesMap.flags;
    $scope.getUserAttendance()
  };
  $scope.gotoNext = function() {
    calMonth += 1;
    calDate.setFullYear(calYear, calMonth, 1);
    datesMap = getDays(calMonth, calYear);
    $scope.dates = datesMap.days;
    $scope.dateFlags = datesMap.flags;
    $scope.dateDisp = calDate;
    $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
    $scope.getUserAttendance()
  };
  $scope.gotoPrev = function() {
    calMonth -= 1;
    calDate.setFullYear(calYear, calMonth, 1);
    datesMap = getDays(calMonth, calYear);
    $scope.dates = datesMap.days;
    $scope.dateFlags = datesMap.flags;
    $scope.dateDisp = calDate;
    $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
    $scope.getUserAttendance()
  };
  // $scope.gotoPerticular = function() {
  //   calMonth = $scope.dropMonth.val;
  //   calYear = $scope.dropYear.val;
  //   calDate.setFullYear(calYear, calMonth, 1);
  //   $scope.dateDisp = calDate;
  //   datesMap = getDays(calMonth, calYear);
  //   $scope.dates = datesMap.days;
  //   $scope.dateFlags = datesMap.flags;
  // };
  $scope.range = function(min, max, step) {
    step = step || 1;
    var input = [];
    for (var i = min; i <= max; i += step) input.push(i);
    return input;
  };
  $scope.userSearch = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };


  $scope.getval = function(typ, dt) {
    if ($scope.values!=undefined) {
      if (typ == 'Cur') {
        if ($scope.values[dt - 1] >= 8) {
          return '#64d252'
        } else if ($scope.values[dt - 1] > 0 && $scope.values[dt - 1] < 8) {
          return '#d08657'
        } else if ($scope.values[dt - 1] == 0) {
          return '#5694cd'
        }
      } else {
        return ''
      }
    }
  }

});
