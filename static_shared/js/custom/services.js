app.factory('$users', function(){
  var userProfiles = [];

  return {
    get : function(input , refetch){
      if (typeof input == 'number') {
        input = input.toString(); // if the PK is passed then get the string form of it
      } else{
        if (input != 'mySelf') { // url is passed and it will not get converted to int
          if (typeof input == 'object') {
            return;
          }
          input = getPK(input).toString()
        }
      }
      if (typeof userProfiles[input]=="undefined" || refetch) {
        if (input=='mySelf') {
          me = myProfile();
          if (me != null){
            userProfiles["mySelf"] = me;
            userProfiles[getPK(me.url).toString()] = me;
          }else {
            userProfiles["mySelf"] = null;
          }
        } else {
          url = '/api/HR/userSearch/' + input + '/'
          var user = getUser(url);
          userProfiles[input]= user
        }
      }
      return userProfiles[input];
    },
  }
});

app.factory('$custServices', function($http){
  var services = []
  function custServices(){
    $http({method : 'GET' , url : '/api/ERP/service/'}).
    then(function(response){
      services = response.data;
    })
  }
  custServices()


  return {
    get : function(pk){
      console.log(pk);
      console.log(services);
      var toReturn = 'noName'
      for (var i = 0; i < services.length; i++) {
        if (services[i].pk == pk) {
          toReturn = services[i].name
          break;
        }else {
          toReturn = 'noName'
        }
      }
      return toReturn
    }
  }

})

app.factory('$permissions', function($http){

  modules = [];
  apps = []

  $http({method : 'GET' , url : '/api/ERP/module/'}).
  then(function(response){
    modules = response.data;
    // console.log(modules);
  })

  // var applications = setInterval(getApplications, 200);
  getApplications()



  // $http({method : 'GET' , url : '/api/ERP/application/'}).
  // then(function(response){
  //   apps = response.data;
  // })
  function getApplications(){
    // if(apps.length>0){
    //   clearInterval(applications);
    // }
    console.log('getting applicatons');
    $http({method : 'GET' , url : '/api/ERP/application/'}).
    then(function(response){
      apps = response.data;
      // apps=[]
    })
  }




  myPk = myProfile().pk
var myPerms;
  $http({method : 'GET' , url : '/api/ERP/permission/?user='+myPk}).
  then(function(response){
    myPerms = response.data;
    // console.log(myPerms);
  })


  return {
    module : function(input){
      // if input is a string the function returns true or false based on the user's permission to use this module
      // otherwise it will return the list all the modules accessibel to this user
      if (modules.length == 0) {
        return $http.get('/api/ERP/module/')
      }
      return modules;
    },
    apps : function(input){

      // similar to above
      if (typeof input != 'undefined') {
        for (var i = 0; i < apps.length; i++) {
          if (apps[i].name == input){
            return true;
          } else {
            return false;
          }
        }
      }
      if (apps.length == 0) {
        return $http.get('/api/ERP/application/')
      }
      return apps;
    },
    action : function(){
      // similar to above

    }, myPerms : function(input) {
      if (typeof input != 'undefined') {
        // console.log('myp',myPerms,input);
        for (var i = 0; i < myPerms.length; i++) {
          if (myPerms[i].app.name == input) {
            return true
          }else {
            if (i == myPerms.length-1) {
              return false;
            }
          }
        }
      }
    }

  }

})


function myProfile(){
  var httpRequest = new XMLHttpRequest()
  httpRequest.open('GET', "/api/HR/users/?mode=mySelf&format=json" , false);
  httpRequest.send(null);
  if (httpRequest.status == 200) { // successfully
    var temp = JSON.parse(httpRequest.responseText);
    me = temp[0];
    if (typeof me.url == 'undefined') {
      me.url = '/api/HR/userSearch/'+ me.pk + '/';
    }else {
      me.url = me.url.split('?')[0]
    }
    return me;
  } else if (httpRequest.status == 403) {
    return null;
  }
}

function getUser(urlGet , mode){
  // console.log(urlGet);
  if (urlGet.indexOf('api/HR')==-1) {
    urlGet = '/api/HR/userSearch/'+ urlGet + '/'
  }
  if (urlGet.indexOf('json')==-1) {
    urlGet += '?format=json';
  }
  var httpRequest = new XMLHttpRequest()
  httpRequest.open('GET', urlGet , false);
  httpRequest.send(null);
  if (httpRequest.status == 200) { // successfully
    user = JSON.parse(httpRequest.responseText);
    user.url = '/api/HR/userSearch/'+ user.pk + '/';
    return user
  }
}
