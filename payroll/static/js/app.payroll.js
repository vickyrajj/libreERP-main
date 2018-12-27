
app.config(function($stateProvider){

  $stateProvider
  .state('workforceManagement.payroll', {
    url: "/payroll",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@workforceManagement.payroll": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@workforceManagement.payroll": {
          templateUrl: '/static/ngTemplates/app.payroll.dash.html',
          controller : 'workforceManagement.payroll',
        }
    }
  })
});
app.controller("workforceManagement.payroll", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  new Chart(document.getElementById("active-line-chart"), {
    type: 'line',
    data: {
      labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      datasets: [{
        data: [860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, ],
        label: "",
        borderColor: "#3e95cd",
        fill: false,
        lineTension: 0,
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
      },
      elements: {
        point: {
          radius: 0
        }
      }
    }
  });
  new Chart(document.getElementById("sales-bar-chart"), {
    type: 'bar',
    data: {
      labels: ["Africa", "Asia", "Europe", "Latin America", "North America", "dsadsa", "dasd", "dasd", "etre", "sfdfsd", "sfd", "fsdf", "etre", "sfdfsd", "Africa", "Asia", "Europe", "Latin America", "North America", ],
      datasets: [{
        backgroundColor: "#3E95CD",
        strokeColor: "brown",
        label: "",
        data: [2478, 5267, 734, 784, 433, 5267, 734, 784, 433, 734, 784, 433, 734, 784, 433, 734, 784, 734, 784, 433, 734, 784]
      }]
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
          categoryPercentage: 1,
          barPercentage: 0.7,
          ticks: {
            display: false,
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          },
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
    }
  });


  new Chart(document.getElementById("downtime-doughnut-chart"), {
    type: 'doughnut',
    data: {
      labels: ["PJL", "HTX", "FTW"],
      datasets: [{
        label: "",
        backgroundColor: ["#cd533e", "#855ef4", "#3cba9f"],
        data: [2478, 5267, 734]
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
  new Chart(document.getElementById("volume-doughnut-chart1"), {
    type: 'doughnut',
    data: {
      labels: ["", "Asia"],
      datasets: [{
        label: "Population (millions)",
        backgroundColor: ["rgba(255, 255, 255, 0)", "rgba(0, 154, 254, 0.71)"],
        data: [2478, 5267]
      }]
    },
    options: {
      cutoutPercentage: 80,
      legend: {
        display: false
      },
      title: {
        display: false,
        text: '',
        display: false,

        lable: false,
      }
    },
    elements: {
      center: {
        text: '70%',
        color: '#36A2EB', //Default black
        fontStyle: 'Helvetica', //Default Arial
        sidePadding: 15 //Default 20 (as a percentage)
      }
    }
  });
  new Chart(document.getElementById("volume-doughnut-chart2"), {
    type: 'doughnut',
    data: {
      labels: ["Africa", ""],
      datasets: [{
        label: "Population (millions)",
        backgroundColor: ["rgba(0, 254, 10, 0.71)", "rgba(255, 255, 255, 0)"],
        data: [2478, 1267]
      }]
    },
    options: {
      cutoutPercentage: 80,
      legend: {
        display: false
      },
      title: {
        display: false,
        text: '',
        display: false,

        lable: false,
      }
    },
    elements: {
      center: {
        text: '70%',
        color: '#36A2EB', //Default black
        fontStyle: 'Helvetica', //Default Arial
        sidePadding: 15 //Default 20 (as a percentage)
      }
    }
  });
  new Chart(document.getElementById("volume-doughnut-chart3"), {
    type: 'doughnut',
    data: {
      labels: ["", "Asia"],
      datasets: [{
        label: "Population (millions)",
        backgroundColor: ["rgba(255, 255, 255, 0)", "rgba(252, 34, 34, 0.84)"],
        data: [78, 467]
      }]
    },
    options: {
      cutoutPercentage: 80,
      legend: {
        display: false
      },
      title: {
        display: false,
        text: '',
        display: false,

        lable: false,
      }
    },
    elements: {
      center: {
        text: '70%',
        color: '#096db0', //Default black
        fontStyle: 'Helvetica', //Default Arial
        sidePadding: 15, //Default 20 (as a percentage)
      }
    }
  });
  new Chart(document.getElementById("volume-doughnut-chart4"), {
    type: 'doughnut',
    data: {
      labels: ["", "Asia"],
      datasets: [{
        label: "Population (millions)",
        backgroundColor: ["rgba(255, 255, 255, 0)", "rgba(254, 251, 0, 0.71)"],
        data: [2478, 4267]
      }]
    },
    options: {
      cutoutPercentage: 80,
      legend: {
        display: false
      },
      title: {
        display: false,
        text: '',
        display: false,

        lable: false,
      }
    },
    elements: {
      center: {
        text: '70%',
        color: '#36A2EB', //Default black
        fontStyle: 'Helvetica', //Default Arial
        sidePadding: 15 //Default 20 (as a percentage)
      }
    }
  });
  new Chart(document.getElementById("top-bar-chart1"), {
    type: 'bar',
    data: {
      labels: ["Africa", "Asia", "Europe", "Latin America", "North America", "dsadsa", "dasd", "dasd", "etre", "sfdfsd", "sfd", "fsdf", "etre", "sfdfsd", "Africa", "Asia", "Europe", "Latin America", "North America", ],
      datasets: [{
        backgroundColor: "#3E95CD",
        strokeColor: "brown",
        label: "",
        data: [778, 267, 734, 784, 433, 567, 734, 784, 433, 734, 784, 433, 734, 784, 433, 734, 784, 734, 784, 433, 734, 784]
      }]
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
          categoryPercentage: 1,
          barPercentage: 0.7,
          ticks: {
            display: false,
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          },
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
    }
  });
  new Chart(document.getElementById("top-bar-chart2"), {
    type: 'bar',
    data: {
      labels: ["Africa", "Asia", "Europe", "Latin America", "North America", "dsadsa", "dasd", "dasd", "etre", "sfdfsd", "sfd", "fsdf", "etre", "sfdfsd", "Africa", "Asia", "Europe", "Latin America", "North America", ],
      datasets: [{
        backgroundColor: "#3ecd55",
        strokeColor: "brown",
        label: "",
        data: [678, 267, 734, 784, 433, 667, 734, 784, 433, 734, 784, 433, 734, 784, 433, 734, 784, 734, 784, 433, 734, 784]
      }]
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
          categoryPercentage: 1,
          barPercentage: 0.7,
          ticks: {
            display: false,
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          },
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
    }
  });
  new Chart(document.getElementById("top-bar-chart3"), {
    type: 'bar',
    data: {
      labels: ["Africa", "Asia", "Europe", "Latin America", "North America", "dsadsa", "dasd", "dasd", "etre", "sfdfsd", "sfd", "fsdf", "etre", "sfdfsd", "Africa", "Asia", "Europe", "Latin America", "North America", ],
      datasets: [{
        backgroundColor: "#cd4b3e",
        strokeColor: "brown",
        label: "",
        data: [478, 267, 734, 784, 433, 267, 734, 784, 433, 734, 784, 433, 734, 784, 433, 734, 784, 734, 784, 433, 734, 784]
      }]
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
          categoryPercentage: 1,
          barPercentage: 0.7,
          ticks: {
            display: false,
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          },
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
    }
  });


  new Chart(document.getElementById("returned-bar-chart"), {
    type: 'bar',
    data: {
      labels: ["Jan 2015", "Feb 2015", "Mar 2015", "Apr 2015", "May 2015", "Jun 2015", "Jul 2015", "Aug 2015", "Sep 2015", "Oct 2015",  "Nov 2015", "Dec 2015",  "Jan 2016", ],
      datasets: [{
          backgroundColor: "#f49065",
          strokeColor: "brown",
          label: "Broken",
          data: [478, 947, 734, 784, 433, 267, 734, 784, 433, 734, 184,  234, 784]
        },
        {
          backgroundColor: "#f70707",
          strokeColor: "brown",
          label: "Other",
          data: [784, 433, 334, 484, 433, 433, 34, 784, 433, 34, 784, 734, 67]
        },
        {
          backgroundColor: "#22de12",
          strokeColor: "brown",
          label: "no reason",
          data: [184, 33, 134, 84, 233, 133, 234, 84, 33, 34, 184,  134,267]
        }
      ]
    },
    options: {

      legend: {
        display: true
      },
      title: {
        display: false,
        text: ""
      },
      scales: {
        xAxes: [{
          barPercentage: 0.7,
          stacked: true,
          ticks: {
            display: true,
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: true,
            display: true,
          },
        }],
        yAxes: [{
          stacked: true,
          ticks: {
            display: true
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: true,
            display: true,
          }
        }]
      },
    }
  });

});
