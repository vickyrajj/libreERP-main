app.controller('projectManagement.projects.new', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {

  $scope.ccSearch = function(query) {
    return $http.get('/api/finance/costCenter/?name__icontains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $scope.resetForm = function() {
    $scope.form = {
      title: '',
      dueDate: new Date(),
      costCenter: '',
      description: '',
      team: []
    };
    $scope.data = {
      files: []
    };
  };
  $scope.resetForm();

  $scope.postProject = function() {
    if ($scope.form.title.length==0) {
      Flash.create('warning', 'Please Select The Title');
      return;
    }
    if ($scope.form.costCenter.length==0 || $scope.form.costCenter.pk==undefined) {
      Flash.create('warning', 'Please Select Proper Cost Center');
      return;
    }
    var dataToSend = $scope.form;
    dataToSend.costCenter = $scope.form.costCenter.pk;
    dataToSend.files = []
    for (var i = 0; i < $scope.data.files.length; i++) {
      dataToSend.files.push($scope.data.files[i].pk)
    }
    $http({
      method: 'POST',
      url: '/api/projects/project/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', 'Project created')
      $scope.resetForm();
    });
  };

});
