app.config(function($stateProvider){
  $stateProvider.state('home.evaluation', {
    url: "/evaluation",
    templateUrl: '/static/ngTemplates/app.LMS.evaluation.html',
    controller: 'home.LMS.evaluation'
  });
});

app.controller('home.LMS.evaluation', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.LMS.evaluation.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/LMS/paper/',
    searchField: 'ques',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Paper :';
          var appType = 'paperEditor';
        } else if (action == 'details') {
          var title = 'Paper Details :';
          var appType = 'paperExplorer';
        }


        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            paper : $scope.data.tableData[i]
          },
          active: true
        })
      }
    }

  }


  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

});

app.controller("home.LMS.evaluation.explore", function($scope, $state, $users, $stateParams, $http, Flash) {
  $scope.paper = $scope.tab.data.paper;
});


app.controller("home.LMS.evaluation.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.resetForm=function(){
    $scope.selectedquestions=[]
    $scope.questions = []
    $scope.form = {topic : '' , text : '' , subject : '' ,typ : '' ,book : '' ,section : '',name:'',timelimit:''}
  }
  $scope.resetForm();
  $scope.time = new Date();

  if ($scope.tab == undefined || $scope.tab.data == undefined) {
    $scope.mode = 'new';
    $scope.form.timelimit = $scope.time.setHours(01, 00);
  }else {
    $scope.mode = 'edit';
    $scope.selectedquestions = $scope.tab.data.paper.questions;
    $scope.form.name=$scope.tab.data.paper.name
    console.log($scope.selectedquestions );
    $scope.form.timelimit = $scope.time.setHours($scope.tab.data.paper.timelimit);
  }

  $scope.$watch('form.topic' , function(newValue , oldValue){
    if (typeof newValue != 'object') {
      return;
    }
    $scope.fetchQuestions();
  });

  $scope.$watch('form.section' , function(newValue , oldValue){
    if (typeof newValue != 'object') {
      return;
    }
    $scope.fetchQuestions();
  });

  $scope.fetchQuestions = function() {

    // if (typeof $scope.form.topic != 'object') {
    //   return;
    // }
    if ($scope.form.typ == 'book') {
      var url = '/api/LMS/question/?bookSection='+ $scope.form.section.pk + '&ques__contains=' + $scope.form.text
    }else {
      var url = '/api/LMS/question/?topic='+ $scope.form.topic.pk + '&ques__contains=' + $scope.form.text
    }
    $http({method:'GET',url:url}).
    then(function(response) {
      $scope.questions.length=0
      angular.forEach(response.data,function(obj){
        $scope.questions.push({'ques':obj})
      })
      console.log($scope.questions);
    })
  }

  $scope.subjectSearch = function(query) {
    return $http.get( '/api/LMS/subject/?title__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.topicSearch = function(query) {
    return $http.get( '/api/LMS/topic/?title__contains=' + query + '&subject='+ $scope.form.subject.pk).
    then(function(response){
      return response.data;
    })
  };

  $scope.bookSearch = function(query) {
    return $http.get( '/api/LMS/book/?title__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.sectionSearch = function(query) {
    return $http.get( '/api/LMS/section/?title__contains=' + query +'&book='+ $scope.form.book.pk).
    then(function(response){
      return response.data;
    })
  };

  $scope.add = function() {
    $scope.title = false;
    for (var i = 0; i < $scope.questions.length; i++) {
      console.log($scope.questions[i])
      if ($scope.questions[i].selected){
        $scope.selectedquestions.push({'ques':$scope.questions[i].ques , 'marks': 1,'negativeMarks':0.25,'optional':false})
      }
    }
  };


  $scope.delete=function(indx){
    $scope.selectedquestions.splice(indx,1)
  }

  $scope.save= function(){
    var toSend=[]
    for (var i = 0; i < $scope.selectedquestions.length; i++) {
      console.log($scope.selectedquestions[i])
      var data = {
        ques : $scope.selectedquestions[i].ques.pk,
        marks : $scope.selectedquestions[i].marks,
        optional : $scope.selectedquestions[i].optional,
        negativeMarks : $scope.selectedquestions[i].negativeMarks,
      }
      toSend.push(data)
    }
    if ($scope.mode=='edit'){
      var method='PATCH';
      var url='/api/LMS/paper/'+$scope.tab.data.paper.pk+'/';
      $http({method : method , url : url , data :  {questions :toSend,name:$scope.form.name}}).
      then(function(response) {
          Flash.create('success', 'Question Paper Updated');
          console.log(response.data);
      })
    }else {
      var method='POST';

      $http({method : method , url : '/api/LMS/paper/' , data :  {questions :toSend,name:$scope.form.name}}).
      then(function(response) {
        Flash.create('success', 'Question Paper Created');
        resetForm();
      })


    }

  };


  $scope.hstep = 1;
  $scope.mstep = 15;

  console.log($scope.time,'jjj');



});






// app.controller('home.LMS.evaluation', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
//   // settings main page controller
//
//   $scope.data = {
//     tableData: []
//   };
//
//   views = [{
//     name: 'list',
//     icon: 'fa-th-large',
//     template: '/static/ngTemplates/genericTable/genericSearchList.html',
//     itemTemplate: '/static/ngTemplates/home.LMS.evaluation.item.html',
//   }, ];
//
//   var options = {
//     main: {
//       icon: 'fa-pencil',
//       text: 'edit'
//     },
//   };
//
//   $scope.config = {
//     views: views,
//     url: '/api/LMS/evaluation/',
//     searchField: 'item',
//     itemsNumPerView: [12, 24, 48],
//   }
//
//
//   $scope.tableAction = function(target, action, mode) {
//     console.log(target, action, mode);
//     console.log($scope.data.tableData);
//
//     if (action == 'edit') {
//       for (var i = 0; i < $scope.data.tableData.length; i++) {
//         if ($scope.data.tableData[i].pk == parseInt(target)) {
//           $scope.addTab({
//             title: 'Edit Asset : ' + $scope.data.tableData[i].pk,
//             cancel: true,
//             app: 'editAsset',
//             data: {
//               pk: target,
//               asset: $scope.data.tableData[i]
//             },
//             active: true
//           })
//         }
//       }
//     }
//   }
//
//   $scope.tabs = [];
//   $scope.searchTabActive = true;
//
//   $scope.closeTab = function(index) {
//     $scope.tabs.splice(index, 1)
//   }
//
//   $scope.addTab = function(input) {
//     console.log(JSON.stringify(input));
//     $scope.searchTabActive = false;
//     alreadyOpen = false;
//     for (var i = 0; i < $scope.tabs.length; i++) {
//       if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
//         $scope.tabs[i].active = true;
//         alreadyOpen = true;
//       } else {
//         $scope.tabs[i].active = false;
//       }
//     }
//     if (!alreadyOpen) {
//       $scope.tabs.push(input)
//     }
//   }
// })
