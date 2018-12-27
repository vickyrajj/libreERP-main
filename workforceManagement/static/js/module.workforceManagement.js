app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement', {
      url: "/workforceManagement",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/workforceManagement.html',
        },
        "menu@workforceManagement": {
          templateUrl: '/static/ngTemplates/workforceManagement.menu.html',
          controller: 'workforceManagement.menu'
        },
        "@workforceManagement": {
          templateUrl: '/static/ngTemplates/workforceManagement.dash.html',
          controller: 'workforceManagement'
        }
      }
    })

});
app.controller('workforceManagement', function($scope, $users, Flash) {

  new Chart(document.getElementById("pie-chart"), {
    type: 'pie',
    data: {
      labels: ["Full Time", "Part Time"],
      datasets: [{
        label: "",
        backgroundColor: ["#3ecd59", "#f09001"],
        data: [247, 526]
      }]
    },
    options: {
      title: {
        display: true,
        text: ''
      },
      legend: {
        position: 'right',
      },

    },
  });


  new Chart(document.getElementById("remote-bar-chart"), {
    type: 'bar',
    data: {
      labels: ["Headquaters", "Remote"],
      datasets: [{
          backgroundColor: ["#3E95CD", "#56cf0a"],
          strokeColor: "",
          label: "Headquaters",
          data: [2478, 3247]
        },
        {
          backgroundColor: ["#14ec44", "#cc0a0a"],
          strokeColor: "",
          label: "Remote",
          data: [784, 433]
        }
      ]
    },
    options: {

      legend: {
        display: false
      },
      title: {
        display: false,
        text: ""
      },
      scales: {
        xAxes: [{
          barPercentage: 0.7,
          stacked: true,
        }],
        yAxes: [{
          stacked: true,
        }]
      },
    }
  });

  new Chart(document.getElementById("headcount-chart-horizontal"), {
    type: 'horizontalBar',
    data: {
      labels: ["Sales", "Development", "Client support", "Marketing ", "Finance "],
      datasets: [{
        label: "",
        backgroundColor: "#3e95cd",
        data: [2478, 5267, 734, 784, 433]
      }]
    },
    options: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: ''
      }
    }
  });


  new Chart(document.getElementById("tenure-doughnut-chart"), {
    type: 'doughnut',
    data: {
      labels: ["1 to 3 Years", "3 to 5 years", "< 1 Year", "> 5 Years"],
      datasets: [{
        label: "",
        backgroundColor: ["#cd533e", "#855ef4", "#3cba9f","#d6dd51"],
        data: [2478, 5267, 734,786]
      }]
    },
    options: {
      title: {
        display: true,
        text: ''
      },
      legend: {
        position: 'bottom',
      },
    }
  });

  new Chart(document.getElementById("growth-mixed-chart"), {
    type: 'bar',
    data: {
      labels: ["1900", "1950", "1999", "2050"],
      datasets: [{
        label: "Europe",
        type: "line",
        borderColor: "#8e5ea2",
        data: [1408, 2547, 2875, 3734],
        fill: false,
        lineTension: 0,
      }, {
        label: "Europe",
        type: "bar",
        backgroundColor: "rgba(102, 142, 245, 0.82)",
        data: [1600, 1947, 1375, 1134],
      }, {
        label: "Africa",
        type: "bar",
        backgroundColor: "rgba(45, 236, 242, 0.84)",
        backgroundColorHover: "#3e95cd",
        data: [1333, 2621, 2983, 2478]
      }]
    },
    options: {
      title: {
        display: true,
        text: ''
      },
      legend: {
        display: false
      }
    }
  });


  new Chart(document.getElementById("expense-mixed-chart"), {
    type: 'bar',
    data: {
      labels: ["1900", "1950", "1999", "2050","2060","2065","2067"],
      datasets: [{
        label: "Europe",
        type: "line",
        borderColor: "#f00e00",
        data: [1408, 2547, 2875, 3734, 1332, 2321, 1323],
        fill: false,
        lineTension: 0,
      }, {
        label: "Europe",
        type: "bar",
        backgroundColor: "rgba(90, 236, 135, 0.82)",
        data: [1600, 1947, 1375, 1134, 1212, 4332, 2321],
      }]
    },
    options: {
      title: {
        display: true,
        text: ''
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          barPercentage: 0.6,
          categoryPercentage: 0.8,
        }]
      },
    }
  });
});



app.controller('workforceManagement.menu', function($scope, $users, Flash, $permissions) {
  // main businessManagement tab default page controller

  $scope.apps = [];

  $scope.buildMenu = function(apps) {
    for (var i = 0; i < apps.length; i++) {
      var a = apps[i];
      var parts = a.name.split('.');
      if (a.module != 10 || a.name.indexOf('app') == -1 || parts.length != 2) {
        continue;
      }
      a.state = a.name.replace('app', 'workforceManagement')
      a.dispName = parts[parts.length - 1];
      $scope.apps.push(a);
    }
  }

  var as = $permissions.apps();
  if (typeof as.success == 'undefined') {
    $scope.buildMenu(as);
  } else {
    as.success(function(response) {
      $scope.buildMenu(response);
    });
  };
});
