$(document).ready(function() {

  $('#friendBar').keyup(function(e) {
    let input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("friendBar");
    filter = input.value.toUpperCase();
    console.log(filter);
    ul = document.getElementById("friendList");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        txtValue = li[i].innerHTML;
        if (txtValue.toUpperCase().indexOf(filter) > -1)
            li[i].style.display = "";
        else
            li[i].style.display = "none";
    }
}
