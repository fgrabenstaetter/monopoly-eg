$(document).ready(function() {

  $('#friendBar').keyup(function(e) {
    let input, filter, element, a, i, txtValue;
    input = document.getElementById("friendBar");
    filter = input.value.toUpperCase();
    console.log(filter);
    element = document.getElementsByClassName("friend-entry");
    for (i = 0; i < element.length; i++) {
        txtValue = element[i].innerHTML;
        if (txtValue.toUpperCase().indexOf(filter) > -1)
            element[i].style.display = "";
        else
            element[i].style.display = "none";
    }
    }
  )})