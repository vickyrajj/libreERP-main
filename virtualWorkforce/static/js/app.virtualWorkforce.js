app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.virtualWorkforce', {
      url: "/virtualWorkforce",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
        },
        "menu@businessManagement.virtualWorkforce": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller: 'controller.generic.menu',
        },
        "@businessManagement.virtualWorkforce": {
          templateUrl: '/static/ngTemplates/app.virtualWorkforce.default.html',
          controller: 'businessManagement.virtualWorkforce.default',
        }
      }
    })
    .state('businessManagement.virtualWorkforce.controlRoom', {
      url: "/controlRoom",
      templateUrl: '/static/ngTemplates/app.virtualWorkforce.controlRoom.html',
      controller: 'businessManagement.virtualWorkforce.controlRoom'
    })
    .state('businessManagement.virtualWorkforce.configure', {
      url: "/configure",
      templateUrl: '/static/ngTemplates/app.virtualWorkforce.configure.html',
      controller: 'businessManagement.virtualWorkforce.configure'
    })
    .state('businessManagement.virtualWorkforce.environments', {
      url: "/environments",
      templateUrl: '/static/ngTemplates/app.virtualWorkforce.environments.html',
      controller: 'businessManagement.virtualWorkforce.environments'
    })
    .state('businessManagement.virtualWorkforce.processes', {
      url: "/processes",
      templateUrl: '/static/ngTemplates/app.virtualWorkforce.processes.html',
      controller: 'businessManagement.virtualWorkforce.processes'
    })
    .state('businessManagement.virtualWorkforce.queues', {
      url: "/queues",
      templateUrl: '/static/ngTemplates/app.virtualWorkforce.queues.html',
      controller: 'businessManagement.virtualWorkforce.queues'
    })
    .state('businessManagement.virtualWorkforce.releases', {
      url: "/releases",
      templateUrl: '/static/ngTemplates/app.virtualWorkforce.releases.html',
      controller: 'businessManagement.virtualWorkforce.releases'
    })
    .state('businessManagement.virtualWorkforce.reports', {
      url: "/reports",
      templateUrl: '/static/ngTemplates/app.virtualWorkforce.reports.html',
      controller: 'businessManagement.virtualWorkforce.reports'
    })
    .state('businessManagement.virtualWorkforce.schedules', {
      url: "/schedules",
      templateUrl: '/static/ngTemplates/app.virtualWorkforce.schedules.html',
      controller: 'businessManagement.virtualWorkforce.schedules'
    })
    .state('businessManagement.virtualWorkforce.robots', {
      url: "/robots",
      templateUrl: '/static/ngTemplates/app.virtualWorkforce.robots.html',
      controller: 'businessManagement.virtualWorkforce.robots'
    })


});



app.controller('businessManagement.virtualWorkforce.default', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  // settings main page controller
  var ctx = document.getElementById("myChart");
  var data = {
    labels: [
      "Green",
      "Grey"
    ],
    datasets: [{
      data: [300, 50],
      backgroundColor: [
        "#1DA381",
        "#ECECEC"
      ],

    }]
  };
  var myDoughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: {
      rotation: 1 * Math.PI,
      circumference: 1 * Math.PI,
      cutoutPercentage: 80
    }
  });
  var ctxx = document.getElementById("myChart1");
  var datas = {
    labels: [
      "Green",
      "Grey"
    ],
    datasets: [{
      data: [50, 300],
      backgroundColor: [
        "#1DA381",
        "#ECECEC"
      ],

    }]
  };
  var myDoughnutChart = new Chart(ctxx, {
    type: 'doughnut',
    data: datas,
    options: {
      rotation: 1 * Math.PI,
      circumference: 1 * Math.PI,
      cutoutPercentage: 80,
    }
  });


  $scope.barlabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];

  $scope.bardata = [
    [28, 48, 40, 19, 86, 27, 90, 34, 55, 21, 32, 32, 32, 45, 56, 45]
  ];

  new Chart(document.getElementById("line-chart"), {
    type: 'line',
    data: {
      labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      datasets: [{
        data: [860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, ],
        label: "",
        borderColor: "#1DA381",
        fill: false,
        lineTension: 0,
        pointRadius: 0,
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          ticks: {
            display: false
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          }
        }],
        yAxes: [{
          ticks: {
            display: false
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          }
        }]
      },
      title: {
        display: false,
        text: '',
        legend: false,
        lable: false,
        showLine: false,
      }
    }
  });
  new Chart(document.getElementById("line-chart1"), {
    type: 'line',
    data: {
      labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      datasets: [{
        data: [860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, ],
        label: "",
        borderColor: "#1DA381",
        fill: false,
        lineTension: 0,
        pointRadius: 0,
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          ticks: {
            display: false
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          }
        }],
        yAxes: [{
          ticks: {
            display: false
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          }
        }]
      },
      title: {
        display: false,
        text: '',
        legend: false,
        lable: false,
        showLine: false,
      }
    }
  });
  new Chart(document.getElementById("line-chart2"), {
    type: 'line',
    data: {
      labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      datasets: [{
        data: [860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, ],
        label: "",
        borderColor: "#1DA381",
        fill: false,
        lineTension: 0,
        pointRadius: 0,
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          ticks: {
            display: false
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          }
        }],
        yAxes: [{
          ticks: {
            display: false
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          }
        }]
      },
      title: {
        display: false,
        text: '',
        legend: false,
        lable: false,
        showLine: false,
      }
    }
  });

})
