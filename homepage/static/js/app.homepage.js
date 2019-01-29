var app = angular.module('app' , ['ui.router']);
app.config(function($stateProvider ,  $urlRouterProvider , $httpProvider , $provide ){
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
});


app.controller('homepage.career' , function($scope , $state , $http , $timeout , $interval){

  $scope.elements = [
    {role: 'FrontEnd Developer',functionalarea:'Web Application Development',experience:'0-1 years',roledetails:'view details',notes:'The truth is that our finest moments are most likely to occur when we are feeling deeply uncomfortable, unhappy, or unfulfilled. For it is only in such moments, propelled by our discomfort, that we are likely to step out of our ruts and start searching for different ways or truer answers.'},
    {role: 'Backend Developer',functionalarea:'Web Application Development',experience:'0-1 years',roledetails:'view details',notes:'The truth is that our finest moments are most likely to occur when we are feeling deeply uncomfortable, unhappy, or unfulfilled. For it is only in such moments, propelled by our discomfort, that we are likely to step out of our ruts and start searching for different ways or truer answers.'},
    {role: 'Android Developer',functionalarea:'Web Application Development',experience:'0-1 years',roledetails:'view details',notes:'The truth is that our finest moments are most likely to occur when we are feeling deeply uncomfortable, unhappy, or unfulfilled. For it is only in such moments, propelled by our discomfort, that we are likely to step out of our ruts and start searching for different ways or truer answers.'},
    {role: 'Software Developer Intern',functionalarea:'Web Application Development',experience:'0-1 years',roledetails:'view details',notes:'The truth is that our finest moments are most likely to occur when we are feeling deeply uncomfortable, unhappy, or unfulfilled. For it is only in such moments, propelled by our discomfort, that we are likely to step out of our ruts and start searching for different ways or truer answers.'}
  ];

});
