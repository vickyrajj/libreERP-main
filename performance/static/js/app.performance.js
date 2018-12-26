app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.performance', {
      url: "/performance",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
        },
        "menu@workforceManagement.performance": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller: 'controller.generic.menu',
        },
        "@workforceManagement.performance": {
          templateUrl: '/static/ngTemplates/app.performance.dash.html',
          controller: 'workforceManagement.performance.dash',
        }
      }
    })
});
app.controller("workforceManagement.performance.dash", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales","sales"];
  $scope.data = [300, 500, 100,400];

  new Chart(document.getElementById("line-chart"), {
    type: 'line',
    data: {
      labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      datasets: [{
        data: [860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, ],
        label: "",
        borderColor: "#1874D9",
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
        data: [-860, -114, -1060, -306, -107, -888, -133, -1000, -783, -2478, -860, -114, -1060, -306, 107, -888, -133, -1000, -783, -2478, -860, -114, -1060, -306, -107, -888, -133, 1000, ],
        label: "",
        borderColor: "#1874D9",
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
        borderColor: "#1874D9",
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
});
