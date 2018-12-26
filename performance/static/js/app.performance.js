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

  $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales", "sales"];
  $scope.data = [300, 500, 100, 400];


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


  new Chart(document.getElementById("line-chart3"), {
    type: 'line',
    data: {
      labels: ['weekly1', 'weekly2', 'weekly3', 'weekly4', 'weekly5', 'weekly6', 'weekly7', 'weekly8', 'weekly9', 'weekly10', ],
      datasets: [{
        data: [860, 114, 1060, 306, 107, 888, 133, 1000, 783, 2478, ],
        label: "",
        borderColor: "#7397AF",
        fill: false,
        lineTension: 0,
        pointRadius: 0,
      }]
    },
    options: {
      elements: {
        line: {
          tension: 0,
        }
      },
      scales: {
        xAxes: [{
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
          }
        }],
        yAxes: [{
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
          }
        }]
      }
    }
  });
  new Chart(document.getElementById("line-chart4"), {
    type: 'line',
    data: {
      labels: ['weekly1', 'weekly2', 'weekly3', 'weekly4', 'weekly5', 'weekly6', 'weekly7', 'weekly8', 'weekly9', 'weekly10', ],
      datasets: [{
        data: [860, 114, 1060, 306, 107, 888, 133, 1000, 783, 2478, ],
        label: "On Time percentage%",
        borderColor: "#7397AF",
        fill: false,
        lineTension: 0,
        pointRadius: 0,
      }, {
        data: [1060, 306, 860, 114, 133, 1000, 107, 888, 860, 114, ],
        label: "Scrap percentage%",
        borderColor: "#92B670",
        fill: false,
        lineTension: 0,
        pointRadius: 0,
      }]
    },
    options: {
      elements: {
        line: {
          tension: 0,
        }
      },
      scales: {
        xAxes: [{
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
          }
        }],
        yAxes: [{
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
          }
        }]
      }
    }
  });

  new Chart(document.getElementById("barchart"), {
    type: 'bar',
    data: {
      labels: ["May 1", "May 2", "May 3", "May 4", "May 5", "May 6",
        "May 7", "May 8", "May 9", "May 10", "May 11", "May 12"
      ],
      datasets: [{
          label: 'Completd on Time',
          data: [21000, 22000, 26000, 35000, 55000, 55000, 56000, 59000, 60000, 61000, 60100, 62000],
          backgroundColor: '#92B670',
        },
        {
          label: 'Completd Early',
          data: [60000, 61000, 60100, 62000, 1060, 2030, 2070, 4000, 4100, 4020, 4030, 4050],
          backgroundColor: '#7397AF',
        },
        {
          label: 'Completd Past Due',
          data: [1000, 1200, 1300, 55000, 56000, 59000, 60000, 4100, 4020, 4030, 4050],
          backgroundColor: '#A1BAD0',
        },
      ]
    },
    options: {
      scales: {
        xAxes: [{
          stacked: true,
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
          }
        }, ],
        yAxes: [{
          stacked: true,
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
          }
        }]
      }
    }
  });
  var barChartData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [{
      label: "Scrap Percentage",
      type: 'line',
      data: [40, 65, 40, 49, 60, 37, ],
      fill: false,
      borderColor: '#92B670',
      backgroundColor: '#92B670',
      pointBorderColor: '#92B670',
      pointBackgroundColor: '#92B670',
      pointHoverBackgroundColor: '#92B670',
      pointHoverBorderColor: '#92B670',
      yAxisID: 'y-axis-2',

    },{
      type: 'bar',
      label: "Scrap Amount",
      data: [200, 185, 590, 621, 250, 400, 95],
      fill: false,
      backgroundColor: '#7397AF',
      borderColor: '#7397AF',
      hoverBackgroundColor: '#7397AF',
      hoverBorderColor: '#7397AF',
      yAxisID: 'y-axis-1'
    },]
  };

  new Chart(document.getElementById("barwithline"), {
    type: 'bar',
    data: barChartData,
    options: {
      responsive: true,
      tooltips: {
        mode: 'label'
      },
      elements: {
        line: {
          fill: true,
          tension: 0,
        }
      },
      scales: {
        xAxes: [{
          display: true,
          gridLines: {
            display: false
          },
          labels: {
            show: true,
          }
        }],
        yAxes: [{
          type: "linear",
          display: true,
          position: "left",
          id: "y-axis-1",
          gridLines: {
            display: false
          },
          labels: {
            show: true,

          }
        }, {
          type: "linear",
          display: true,
          position: "right",
          id: "y-axis-2",
          gridLines: {
            display: false
          },
          labels: {
            show: true,

          },
          ticks: {
            min: 0,
            max: 65,
        // Your absolute max value
            callback: function(value) {
              return (value / this.max * 100).toFixed(0) + '%'; // convert it to percentage
            },
          },
        }]
      }
    }
  });

});
