document.addEventListener("DOMContentLoaded", function(event) {
  var courses_list = document.getElementById('courses_list')
  courses_list.style.display = 'none';
  courses_list.addEventListener("mouseover", mouseOver);
  courses_list.addEventListener("mouseout", mouseOut);
  document.getElementById("courses").addEventListener("mouseover", mouseOver);
  document.getElementById("courses").addEventListener("mouseout", mouseOut);
  function mouseOver() {
    courses_list.style.display = "block";
  }
  function mouseOut() {
    courses_list.style.display = "none";
  }
});
