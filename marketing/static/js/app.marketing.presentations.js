app.controller("businessManagement.marketing.presentations", function($scope, $state, $users, $stateParams, $http, Flash,$aside,$uibModal) {

  $scope.createNewDemo = function(){
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.marketing.presentations.newForm.html',
      size: 'xl',
      backdrop: true,
      controller : function($scope, $state, $users, $stateParams, $http, Flash,$uibModalInstance){
        $scope.slots = ['8 - 9','9 - 10','10 - 11','11 - 12','12 - 13','13 - 14','14 - 15','15 - 16','16 - 17',]
        $scope.form = {name:'',emailId:'',dated:new Date(),slot:'8 - 9'}
        $scope.minDate = new Date()
        $scope.saveDemo = function(){
          var f = $scope.form
          console.log(f);
          if (f.name.length==0) {
            Flash.create('warning', 'Please Select The Name')
            return
          }
          if (f.emailId == undefined || f.emailId.length==0) {
            Flash.create('warning', 'Please Select The Proper Email')
            return
          }
          toSend = {name:f.name,emailId:f.emailId,slot:f.slot,dated:f.dated.toJSON().split('T')[0]}
          $http({url : '/api/marketing/schedule/' , method : 'POST',data:toSend}).
          then(function(response){
            console.log(response.data);
            Flash.create('success', 'Created')
            $scope.form = {name:'',emailId:'',dated:new Date(),slot:'8 - 9'}
            $uibModalInstance.close()
          })

        }
      }

    }).result.then(function() {
      console.log('here...');
      $scope.gotoToday()
    }, function(typ) {
      console.log('ret...');
    });
  }

  $scope.listOfMonths = [{"val":0, "disp":"January"}, {"val":1, "disp":"February"}, {"val":2, "disp":"March"}, {"val":3, "disp":"April"}, {"val":4, "disp":"May"},
    {"val":5, "disp":"June"}, {"val":6, "disp":"July"}, {"val":7, "disp":"August"}, {"val":8, "disp":"September"}, {"val":9, "disp":"October"}, {"val":10, "disp":"November"},
    {"val":11, "disp":"December"}];

  $scope.listOfYears = [{"val":2017, "disp":"2017"}, {"val":2018, "disp":"2018"}, {"val":2019, "disp":"2019"}, {"val":2020, "disp":"2020"}, {"val":2021, "disp":"2021"}];


  $scope.listOfDays = [{"val":1, "disp":"Sunday"}, {"val":1, "disp":"Monday"}, {"val":1, "disp":"Tuesday"}, {"val":1, "disp":"Wednesday"}, {"val":1, "disp":"Thursday"},
    {"val":1, "disp":"Friday"}, {"val":1, "disp":"Saturday"}];

  var calDate = new Date(); // the current date value known to the calendar, also the selected. For a random month its 1st day of that month.
  var calMonth = calDate.getMonth(); // in MM format
  var calYear = calDate.getFullYear(); // in YYYY format
  datesMap = getDays(calMonth, calYear);
  $scope.dateDisp = calDate;
  $scope.dates = datesMap.days;
  $scope.dateFlags = datesMap.flags;
  $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp; // Find equivalent day name from the index

  $scope.dropYear ={"val":calYear, "disp":""}; // year selected in the drop down menu
  $scope.dropMonth = {"val":calMonth, "disp":""}; // Month selected in the drop down menu

  $scope.setMonth = function(mnth) {
    $scope.dropMonth = mnth;
    $scope.gotoPerticular()
  }

  $scope.setYear = function(year) {
    $scope.dropYear = year;
    $scope.gotoPerticular()
  }

  $scope.showDay = function(input){
    // console.log('show Day');
    if (datesMap.flags[input]=="Cur"){
      $scope.calDate = calDate.setFullYear(calYear, calMonth, $scope.dates[input]);
      $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
      $scope.dateDisp = calDate;
    }else if(datesMap.flags[input]=="Prev"){
      var selectedDate = $scope.dates[input];
      $scope.gotoPrev();
      $scope.calDate = calDate.setFullYear(calYear, calMonth, selectedDate);
      $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
      $scope.dateDisp = calDate;
    }else if(datesMap.flags[input]=="Next"){
      var selectedDate = $scope.dates[input];
      $scope.gotoNext();
      $scope.calDate = calDate.setFullYear(calYear, calMonth, selectedDate);
      $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
      $scope.dateDisp = calDate;
    };
    // $scope.dayClicked($scope.itemsGroup[input]);
  };

  $scope.gotoToday = function(){
    var calDate = new Date(); // current day
    calMonth = calDate.getMonth();
    calYear = calDate.getFullYear();
    $scope.dateDisp = calDate;
    $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
    datesMap = getDays(calMonth, calYear);
    $scope.dates = datesMap.days;
    $scope.dateFlags = datesMap.flags;
  };
  $scope.gotoNext = function(){
    calMonth +=1;
    calDate.setFullYear(calYear, calMonth, 1);
    datesMap = getDays(calMonth, calYear);
    $scope.dateDisp = calDate;
    $scope.dates = datesMap.days;
    $scope.dateFlags = datesMap.flags;
    $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
  };
  $scope.gotoPrev = function(){
    calMonth -=1;
    calDate.setFullYear(calYear, calMonth, 1);
    datesMap = getDays(calMonth, calYear);
    $scope.dateDisp = calDate;
    $scope.dates = datesMap.days;
    $scope.dateFlags = datesMap.flags;
    $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
  };
  $scope.gotoPerticular = function(){
    calMonth = $scope.dropMonth.val;
    calYear = $scope.dropYear.val;
    calDate.setFullYear(calYear, calMonth, 1);
    datesMap = getDays(calMonth, calYear);
    $scope.dateDisp = calDate;
    $scope.dates = datesMap.days;
    $scope.dateFlags = datesMap.flags;
  };
  $scope.range = function(min, max, step){
    step = step || 1;
    var input = [];
    for (var i = min; i <= max; i += step) input.push(i);
    return input;
  };
  $scope.scheduleData = []
  $scope.$watch('dates',function(newValue , oldValue){
    console.log('changingggggggg vallllllllll');
    $http({url : '/api/marketing/schedulesData/' , method : 'POST',data:{'data':datesMap,'curDate':$scope.dateDisp.toJSON().split('T')[0]}}).
    then(function(response){
      // console.log(response.data);
      $scope.scheduleData = response.data
    })
  })
  $scope.showSlots = function(data,typ){
    // console.log(data,typ);
    if (typ=='Cur') {
      if (data.length>0) {
        $aside.open({
          templateUrl : '/static/ngTemplates/app.marketing.presentations.demosList.html',
          placement: 'right',
          size: 'xl',
          resolve: {
            slotData : function() {
              return data;
            },
          },
          controller : function($scope, $state, $users, $stateParams, $http, Flash,slotData,$uibModalInstance){
            $scope.slotData = slotData
            for (var i = 0; i < $scope.slotData.length; i++) {
              $scope.slotData[i].participantsPksList = []
              $scope.slotData[i].participantName = ''
              for (var j = 0; j < $scope.slotData[i].participants.length; j++) {
                $scope.slotData[i].participantsPksList.push($scope.slotData[i].participants[j].pk)
              }
            }
            $scope.userSearch = function(query) {
              return $http.get('/api/HR/userSearch/?username__icontains=' + query).
              then(function(response) {
                return response.data;
              })
            }
            $scope.cancel = function(){
              $uibModalInstance.dismiss();
            }
            $scope.saveSchedule = function(slot){
              console.log(slot);
              if (slot.organizer==null || typeof slot.organizer != 'object') {
                Flash.create('warning', 'Please Select The Organizer')
                return
              }
              $http({url : '/api/marketing/schedule/'+slot.pk+'/' , method : 'PATCH',data:{'organizer':slot.organizer.pk,'participantsPksList':slot.participantsPksList,'status':slot.status}}).
              then(function(response){
                console.log(response.data);
                Flash.create('success', 'Updated')
                return
              })
            }
            $scope.addParticipant = function(idx){
              if (typeof $scope.slotData[idx].participantName == 'object') {
                if ($scope.slotData[idx].participantsPksList.indexOf($scope.slotData[idx].participantName.pk)==-1) {
                  $scope.slotData[idx].participantsPksList.push($scope.slotData[idx].participantName.pk)
                  $scope.slotData[idx].participants.push($scope.slotData[idx].participantName)
                  $scope.slotData[idx].participantName = ''
                }else {
                  Flash.create('warning', 'This Participants Has Already Added')
                  return
                }
              }else {
                Flash.create('warning', 'Please Select The User')
                return
              }
            }
          }
        })
      }
    }
  }



})

app.controller("businessManagement.marketing.leads.Explore", function($scope, $state, $users, $stateParams, $http, Flash , $uibModal) {

  if ($scope.tab != undefined) {
    console.log($scope.data.tableData[$scope.tab.data.index]);
    $scope.contactData = $scope.data.tableData[$scope.tab.data.index]
  }

})
